import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { calculateName } from '@/lib/numerology'
import {
  NumerologySystem,
  SystemSelection,
  expandSelection,
} from '@/types/numerology'
import {
  COMPANY_SUGGESTIONS_SYSTEM_PROMPT,
  COMPANY_COMPOSITION_SYSTEM_PROMPT,
} from '@/lib/company-suggestions-prompt'
import { getPool, scoreCompany, shuffle } from '@/lib/company-pool'
import { BUSINESS_WORDS } from '@/lib/business-words'
import { isFoundryEnabled } from '@/lib/features'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  targetNumber: z.number().int().min(1).max(9),
  system: z.enum(['pythagorean', 'chaldean', 'both']),
  structure: z.string().min(1).max(80),
  industry: z.string().min(1).max(800),
  country: z.string().min(1).max(120).optional(),
  keywords: z.string().max(400).optional(),
  // User-supplied required substring (case-insensitive). Every suggested
  // company name must contain this fragment.
  mustInclude: z.string().min(1).max(40).optional(),
  count: z.number().int().min(3).max(50).optional().default(20),
})

const ARCHETYPES = [
  'coined',
  'classical',
  'founder',
  'descriptive',
  'place',
  'compound',
  'abstract',
] as const

// archetype/pronunciation_hint are optional with defaults so the lean
// composition path (name + short rationale only) parses cleanly — that
// path needs to fit ~30 candidates in the token budget without timing out.
const CandidateSchema = z.object({
  name: z.string(),
  archetype: z.string().optional().default('coined'),
  rationale: z.string().optional().default(''),
  pronunciation_hint: z.string().optional().default(''),
})

const ResponseSchema = z.object({
  candidates: z.array(CandidateSchema),
  // OpenAI structured outputs require all fields present — use `nullable`
  // rather than `optional` so the model always emits the key.
  notes: z.string().nullable(),
})

const MODEL = 'gpt-4o-mini'
// gpt-4o-mini in structured-output mode emits ~80-120 tok/sec. Token budget
// sized so the call completes inside the 9s timeout. ~700 tokens ≈ 8-10
// candidate companies. Offline pool tops up the rest.
const OVERSAMPLE_FACTOR = 1.5
const MAX_GENERATED = 12
// When mustInclude narrows the model's vocabulary heavily, we need to
// generate a wider candidate pool so at least some pass the numerology
// filter. The lean schema (name + short rationale) keeps this fast.
const MAX_GENERATED_MUST_INCLUDE = 40
const MAX_OUTPUT_TOKENS = 700
// Lean candidates (~18 tokens each) → 40 fit in ~900. Headroom for the
// model to occasionally produce a slightly longer rationale.
const MAX_OUTPUT_TOKENS_MUST_INCLUDE = 1300
// 9.5s — gpt-4o-mini's actual time-to-completion for ~700 tokens of JSON.
// 6.5s was too tight (call always timed out). Total route latency ~10s.
const OPENAI_TIMEOUT_MS = 9_500

function normalizeArchetype(value: string): (typeof ARCHETYPES)[number] {
  const v = value.toLowerCase().trim()
  return (ARCHETYPES as readonly string[]).includes(v)
    ? (v as (typeof ARCHETYPES)[number])
    : 'coined'
}

/**
 * Strip trailing legal-structure suffixes if the model included them despite
 * the prompt instruction. Order matters — match the longest/most-specific
 * forms first so e.g. "Pvt Ltd" is consumed before "Ltd" runs.
 */
const LEGAL_SUFFIX_PATTERN =
  /\s*[,]?\s*(?:Private\s+Limited|Public\s+Limited|Pvt\.?\s*Ltd\.?|Pte\.?\s*Ltd\.?|Co\.?,?\s*Ltd\.?|Limited|S\.?A\.?S\.?|S\.?A\.?R\.?L\.?|S\.?p\.?A\.?|S\.?R\.?L\.?|GmbH|AG|N\.?V\.?|B\.?V\.?|LLP|LLC|L\.?L\.?C\.?|L\.?L\.?P\.?|Inc\.?|Incorporated|Corp\.?|Corporation|Ltd\.?|Co\.?|&\s*Co\.?|Group|Holdings|Trust|Cooperative|Family\s+Office|Partnership|Sole\s+Proprietor)\s*$/i

function stripLegalSuffix(name: string): string {
  let cleaned = name.trim()
  // Run twice in case of compound suffixes like "Sterling Capital Pvt Ltd Inc"
  for (let i = 0; i < 2; i++) {
    const next = cleaned.replace(LEGAL_SUFFIX_PATTERN, '').trim()
    if (next === cleaned) break
    cleaned = next
  }
  return cleaned
}

export async function POST(req: Request) {
  if (!isFoundryEnabled()) {
    return NextResponse.json(
      { error: 'Foundry is coming soon. Try the Calculator in the meantime.' },
      { status: 503 }
    )
  }

  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const {
    targetNumber,
    system,
    structure,
    industry,
    country,
    keywords,
    mustInclude,
    count,
  } = parsed.data
  const selection = system as SystemSelection
  const activeSystems = expandSelection(selection)

  // Helper — does name reduce to target under every active system?
  const matchesAllSystems = (name: string): boolean => {
    for (const sys of activeSystems) {
      if (calculateName(name, sys).finalNumber !== targetNumber) return false
    }
    return true
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server misconfigured: OPENAI_API_KEY not set' },
      { status: 500 }
    )
  }

  // "Both" mode and must-include need a wider candidate pool to survive
  // the tight numerology filter (~1-3% pass rate vs ~11% single-system).
  // The lean schema kicks in for both; same generous timeout.
  const wideCandidatesMode = selection === 'both' || Boolean(mustInclude)
  const timeout = wideCandidatesMode ? 14_000 : OPENAI_TIMEOUT_MS
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    timeout,
    maxRetries: 0,
  })

  const userPayload = {
    target_number: targetNumber,
    system,
    structure,
    industry,
    country: country ?? 'international',
    keywords: keywords || null,
    must_include: mustInclude
      ? `COMPOSITION RULE — the substring "${mustInclude}" is a FIXED CORE that must appear verbatim (case-insensitive) in EVERY brand name. Build complete brand names by adding letters or words BEFORE and/or AFTER this core (e.g. for core "lux": Luxora, Brightlux, Luxhaven, Aurelux). The core may sit at the start, middle, or end.${keywords ? ` The parts you add should thematically relate to the keywords: "${keywords}".` : ''} Vary placement and length widely so the server can find spellings that reduce to the target number. Coined/blended brand names are encouraged here as long as they are pronounceable and contain the core.`
      : null,
    intersection_filter:
      selection === 'both'
        ? 'Names will be filtered to those whose letters reduce to the target under BOTH Pythagorean and Chaldean systems. This is a tight intersection — favor short to medium length, varied letters, and a wide pool.'
        : null,
    // When the wide-candidates path is active (both systems OR must-include),
    // we use the lean schema and can fit many more candidates per call.
    count: wideCandidatesMode
      ? MAX_GENERATED_MUST_INCLUDE
      : Math.min(Math.ceil(count * OVERSAMPLE_FACTOR), MAX_GENERATED),
  }

  // Substring filter (case-insensitive contains)
  const passesMustInclude = (name: string): boolean =>
    !mustInclude || name.toLowerCase().includes(mustInclude.toLowerCase())

  // Offline-pool builder — used to top up when the model falls short and as
  // a graceful fallback when the model errors entirely.
  function buildPoolResult(source: 'pool' | 'pool-fallback') {
    const matchingNumber = getPool().filter((c) => {
      if (!passesMustInclude(c.name)) return false
      return matchesAllSystems(c.name)
    })
    const scored = matchingNumber
      .map((c) => ({ c, s: scoreCompany(c, { industry, keywords }) }))
      .sort((a, b) => b.s - a.s)
    const high = scored.filter((x) => x.s > 0).map((x) => x.c)
    const rest = scored.filter((x) => x.s === 0).map((x) => x.c)
    const ordered = [...shuffle(high), ...shuffle(rest)].slice(0, count)
    return ordered.map((c) => {
      const primary = activeSystems[0]
      const calc = calculateName(c.name, primary)
      return {
        name: c.name,
        archetype: c.archetype,
        rationale: c.rationale,
        pronunciation_hint: c.pronunciation_hint,
        expected_value: targetNumber,
        actual_value: calc.finalNumber,
        sum: calc.sum,
        reduction_steps: calc.reductionSteps,
        verified: true,
        source,
      }
    })
  }

  type VerifiedModelEntry = {
    name: string
    archetype: (typeof ARCHETYPES)[number]
    rationale: string
    pronunciation_hint: string
    expected_value: number
    actual_value: number
    sum: number
    reduction_steps: number[]
    verified: true
    source: 'model'
  }

  async function callModelPass(exclude: string[]): Promise<
    | { parsed: z.infer<typeof ResponseSchema>; raw_count: number }
    | { error: string }
  > {
    const payload = { ...userPayload, exclude_names: exclude.slice(0, 80) }
    try {
      // Plain JSON mode — strict `.parse()` runs schema-validation grammar
      // on every token and adds 4-8s of latency. json_object + manual Zod
      // parse is dramatically faster.
      const completion = await client.chat.completions.create({
        model: MODEL,
        max_tokens: wideCandidatesMode
          ? MAX_OUTPUT_TOKENS_MUST_INCLUDE
          : MAX_OUTPUT_TOKENS,
        messages: [
          {
            role: 'system',
            content: wideCandidatesMode
              ? COMPANY_COMPOSITION_SYSTEM_PROMPT
              : COMPANY_SUGGESTIONS_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content:
              JSON.stringify(payload) +
              (wideCandidatesMode
                ? // Lean shape — fewer fields per candidate means many more
                  // candidates fit in the budget, so enough survive the
                  // numerology filter without the call timing out. The
                  // explicit count line is load-bearing: without it the
                  // model under-delivers (~9 names when 32 were asked).
                  `\n\nReturn EXACTLY ${payload.count} candidate brand names. Quantity matters — submit the full count. Format: JSON object of shape {"candidates":[{"name","rationale"}, ...], "notes": null} with no markdown. Keep each rationale to 3-6 words. Do NOT pre-filter for numerology; the server does the math.`
                : '\n\nReturn ONLY a JSON object of shape {"candidates":[{"name","archetype","rationale","pronunciation_hint"}, ...], "notes": null} with no markdown.'),
          },
        ],
        response_format: { type: 'json_object' },
      })
      const text = completion.choices[0]?.message?.content
      if (!text)
        return {
          error: `No content (finish: ${completion.choices[0]?.finish_reason ?? 'unknown'})`,
        }
      const cleaned = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
      let parsed: z.infer<typeof ResponseSchema>
      try {
        const obj = JSON.parse(cleaned)
        const validated = ResponseSchema.safeParse(obj)
        if (!validated.success)
          return { error: `Schema mismatch: ${validated.error.message.slice(0, 120)}` }
        parsed = validated.data
      } catch (e) {
        return { error: `JSON parse failed: ${e instanceof Error ? e.message : String(e)}` }
      }
      return { parsed, raw_count: parsed.candidates.length }
    } catch (err) {
      return { error: err instanceof Error ? err.message : String(err) }
    }
  }

  // Speed path: check the offline pool BEFORE calling OpenAI. If it already
  // has enough matching brands, skip the model entirely — the 9.5s model
  // call adds latency for no benefit when the pool is sufficient.
  const seen = new Set<string>()
  const verifiedFromModel: VerifiedModelEntry[] = []
  let modelError: string | null = null
  let rawGenerated = 0
  let modelSkipped = false

  const earlyPoolPreview = buildPoolResult('pool')
  // Skip the model when:
  //  (a) the pool fully satisfies the request — model adds nothing,
  //  (b) 'both' mode without must-include — the deterministic word-pair
  //      composer downstream produces ~100 valid pairs per target reliably,
  //      so the model's ~0.4% pass rate is wasted wall-clock.
  const skipModel =
    earlyPoolPreview.length >= count ||
    (selection === 'both' && !mustInclude)

  if (skipModel) {
    modelSkipped = true
  } else {
    // Hit rates per candidate: single system ≈ 11%, 'both' ≈ 0.4-3%.
    // Composition (core+word for must-include, word+word for 'both') always
    // fills any remaining slots, so a single batch is enough — wide on
    // parallel calls, no sequential retry. Keeps wall-clock under ~12s.
    const parallel = mustInclude ? 4 : 1
    const maxBatches = 1

    batchLoop: for (let b = 0; b < maxBatches; b++) {
      if (verifiedFromModel.length >= count) break

      // Rotate the exclusion window across parallel calls so each model
      // call sees a slightly different "already seen" list — encourages
      // diversity instead of every call returning the same brands.
      const excludeBase = verifiedFromModel.map((v) => v.name)
      const calls = Array.from({ length: parallel }, (_, i) => {
        const offset = i * 5
        return callModelPass(excludeBase.slice(offset, offset + 50))
      })
      const results = await Promise.all(calls)

      let addedThisBatch = 0
      for (const result of results) {
        if ('error' in result) {
          // Only surface an error if NO call across all batches has produced
          // anything — a single transient timeout shouldn't poison the run.
          if (verifiedFromModel.length === 0 && !modelError)
            modelError = result.error
          continue
        }
        rawGenerated += result.raw_count
        for (const c of result.parsed.candidates) {
          const cleanName = stripLegalSuffix(c.name)
          if (!cleanName) continue
          const key = cleanName.toLowerCase().trim()
          if (seen.has(key)) continue
          seen.add(key)
          if (!passesMustInclude(cleanName)) continue
          if (!matchesAllSystems(cleanName)) continue
          const primary = activeSystems[0]
          const primaryCalc = calculateName(cleanName, primary)
          verifiedFromModel.push({
            name: cleanName,
            archetype: normalizeArchetype(c.archetype),
            rationale: c.rationale,
            pronunciation_hint: c.pronunciation_hint,
            expected_value: targetNumber,
            actual_value: primaryCalc.finalNumber,
            sum: primaryCalc.sum,
            reduction_steps: primaryCalc.reductionSteps,
            verified: true,
            source: 'model',
          })
          addedThisBatch++
          if (verifiedFromModel.length >= count) break batchLoop
        }
      }
      // If a full batch (10+ calls) added nothing, another won't either.
      if (addedThisBatch === 0) break
    }
  }

  type ComposedEntry = Omit<VerifiedModelEntry, 'source'> & {
    source: 'composed'
  }

  // Deterministic composition floor — uses the 250-word BUSINESS_WORDS bank
  // (Shyamal). Two strategies, both compute in <50ms:
  //
  //  (a) MUST-INCLUDE: pair the user's fragment with every business word
  //      (before and after). Surfaces "Melbourne Wells", "Wells Melbourne".
  //
  //  (b) BOTH-SYSTEMS without must-include: pair every word with every
  //      other word — 250×250 ≈ 62,500 candidates, of which ~1% hit the
  //      target under both systems = ~600 valid real-looking names
  //      ("Aurora Capital", "North Forge", "Bay Sterling"). Without this
  //      the model alone yields only 1-5 hits at any plausible cost
  //      because the dual-system pass rate is ~0.4%.
  //
  // Both strategies guarantee real brand names, no API cost, instant.
  const composed: ComposedEntry[] = []
  const pushComposed = (
    name: string,
    rationale: string,
    archetype: (typeof ARCHETYPES)[number] = 'compound'
  ) => {
    const key = name.toLowerCase().trim()
    if (seen.has(key)) return false
    if (!matchesAllSystems(name)) return false
    seen.add(key)
    const primary = activeSystems[0]
    const calc = calculateName(name, primary)
    composed.push({
      name,
      archetype,
      rationale,
      pronunciation_hint: '',
      expected_value: targetNumber,
      actual_value: calc.finalNumber,
      sum: calc.sum,
      reduction_steps: calc.reductionSteps,
      verified: true,
      source: 'composed',
    })
    return true
  }
  const enough = () => verifiedFromModel.length + composed.length >= count

  if (mustInclude && !enough()) {
    const core = mustInclude.trim()
    const coreTitle =
      core.charAt(0).toUpperCase() + core.slice(1).toLowerCase()
    for (const [word, meaning] of BUSINESS_WORDS) {
      if (enough()) break
      for (const name of [`${coreTitle} ${word}`, `${word} ${coreTitle}`]) {
        pushComposed(
          name,
          `A composed brand grounding ${coreTitle}'s identity in ${meaning}.`,
          'place'
        )
        if (enough()) break
      }
    }
  } else if (!mustInclude && !enough()) {
    // Pair every word with every other word, shuffled so successive runs
    // don't always return the same brands at the top. Works for both
    // single-system and 'both'; the matchesAllSystems check handles either.
    const words = BUSINESS_WORDS.map(([w]) => w)
    const pairs: [string, string][] = []
    for (let i = 0; i < words.length; i++)
      for (let j = 0; j < words.length; j++)
        if (i !== j) pairs.push([words[i], words[j]])
    // Fisher-Yates shuffle for run-to-run variety
    for (let i = pairs.length - 1; i > 0; i--) {
      const k = Math.floor(Math.random() * (i + 1))
      ;[pairs[i], pairs[k]] = [pairs[k], pairs[i]]
    }
    for (const [a, b] of pairs) {
      if (enough()) break
      pushComposed(`${a} ${b}`, `${a} + ${b} compound`)
    }
  }

  // Slice model + composed results to count (may be 0 if model errored or
  // returned no verified hits). Pool top-up + relaxed fallback handle gaps.
  const modelSliced = [...verifiedFromModel, ...composed].slice(0, count)

  type PoolEntry = ReturnType<typeof buildPoolResult>[number]
  type RelaxedPoolEntry = Omit<PoolEntry, 'source'> & {
    source: 'relaxed-pool'
  }
  type SuggestionEntry =
    | VerifiedModelEntry
    | ComposedEntry
    | PoolEntry
    | RelaxedPoolEntry

  // Top up from offline pool if model didn't produce enough verified hits
  let suggestions: SuggestionEntry[] = modelSliced
  let topUpUsed = false
  let relaxedFallback = false
  if (modelSliced.length < count) {
    const poolEntries = buildPoolResult('pool')
    const modelNames = new Set(modelSliced.map((v) => v.name.toLowerCase()))
    const topUp = poolEntries
      .filter((p) => !modelNames.has(p.name.toLowerCase()))
      .slice(0, count - modelSliced.length)
    if (topUp.length > 0) {
      suggestions = [...modelSliced, ...topUp]
      topUpUsed = true
    }
  }

  // Relaxed fallback: if every constrained filter killed every name, fall
  // back to pool entries that hit the numerology target. We relax industry
  // and keywords (soft filters) but NEVER mustInclude — if the user asked
  // for a substring, they need to see names containing it or hear that
  // none exist. Silently dropping must-include made the field feel broken.
  let relaxedSystem: NumerologySystem | null = null
  if (suggestions.length === 0) {
    let relaxedSystems: NumerologySystem[] = activeSystems
    let relaxed = getPool().filter((c) => {
      if (!passesMustInclude(c.name)) return false
      return relaxedSystems.every(
        (s) => calculateName(c.name, s).finalNumber === targetNumber
      )
    })

    // Pool is small (~86 names) and the dual-system intersection is empty
    // for many targets (e.g. 0 candidates reduce to 5 under BOTH systems).
    // If we asked for 'both' and got 0, try each system individually and
    // pick whichever has more matches. Flag this in the note so the user
    // knows we relaxed the system constraint, not just the filters.
    if (relaxed.length === 0 && selection === 'both') {
      const pyth = getPool().filter(
        (c) =>
          passesMustInclude(c.name) &&
          calculateName(c.name, 'pythagorean').finalNumber === targetNumber
      )
      const chald = getPool().filter(
        (c) =>
          passesMustInclude(c.name) &&
          calculateName(c.name, 'chaldean').finalNumber === targetNumber
      )
      if (pyth.length >= chald.length && pyth.length > 0) {
        relaxed = pyth
        relaxedSystems = ['pythagorean']
        relaxedSystem = 'pythagorean'
      } else if (chald.length > 0) {
        relaxed = chald
        relaxedSystems = ['chaldean']
        relaxedSystem = 'chaldean'
      }
    }

    const mapped = relaxed.slice(0, count).map((c) => {
      const primary = relaxedSystems[0]
      const calc = calculateName(c.name, primary)
      return {
        name: c.name,
        archetype: c.archetype,
        rationale: c.rationale,
        pronunciation_hint: c.pronunciation_hint,
        expected_value: targetNumber,
        actual_value: calc.finalNumber,
        sum: calc.sum,
        reduction_steps: calc.reductionSteps,
        verified: true,
        source: 'relaxed-pool' as const,
      }
    })
    if (mapped.length > 0) {
      suggestions = mapped
      relaxedFallback = true
    }
  }

  // Must-include is preserved in the relaxed fallback (never dropped).
  // Industry/keywords are soft filters that we *do* relax.
  const droppedFilters: string[] = []
  if (relaxedFallback) {
    if (industry) droppedFilters.push('industry')
    if (keywords) droppedFilters.push('keywords')
    if (relaxedSystem) droppedFilters.push('dual-system match')
  }

  return NextResponse.json({
    suggestions,
    notes:
      suggestions.length === 0
        ? mustInclude
          ? `No company names containing “${mustInclude}” reduce to ${targetNumber} under ${selection === 'both' ? 'either system' : selection}. Try a shorter / different fragment, a different target number, or remove the Must Include filter.`
          : `No invented company names in our pool reduce to ${targetNumber} under ${selection === 'both' ? 'either system' : selection}. Try a different target number — most targets have 5-15 candidates.`
        : relaxedFallback
          ? relaxedSystem
            ? `No names reduce to ${targetNumber} under both systems — showing names that reduce to ${targetNumber} under ${relaxedSystem === 'pythagorean' ? 'Pythagorean' : 'Chaldean'} only${droppedFilters.length > 1 ? ` (also dropped: ${droppedFilters.filter((f) => f !== 'dual-system match').join(', ')})` : ''}.`
            : `No company names matched your ${droppedFilters.join(' / ') || 'filters'} AND target ${targetNumber}. Showing names that reduce to ${targetNumber} — relax or remove ${droppedFilters.join(' / ') || 'filters'} to narrow these further.`
          : topUpUsed
            ? `Model returned ${modelSliced.length} matching name${modelSliced.length === 1 ? '' : 's'}; topped up with offline-pool candidates to reach your requested count.`
            : null,
    meta: {
      requested_count: count,
      generated_count: rawGenerated,
      verified_count: suggestions.length,
      from_model: modelSliced.length,
      from_pool: suggestions.length - modelSliced.length,
      target_number: targetNumber,
      system,
      structure,
      model: modelSkipped ? 'offline-pool (fast path)' : MODEL,
      model_error: modelError,
      model_skipped: modelSkipped,
    },
  })
}
