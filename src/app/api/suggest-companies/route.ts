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
import { COMPANY_SUGGESTIONS_SYSTEM_PROMPT } from '@/lib/company-suggestions-prompt'
import { getPool, scoreCompany, shuffle } from '@/lib/company-pool'
import { isFoundryEnabled } from '@/lib/features'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  targetNumber: z.number().int().min(1).max(9),
  system: z.enum(['pythagorean', 'chaldean', 'both']),
  structure: z.string().min(1).max(80),
  industry: z.string().min(1).max(800),
  country: z.string().min(1).max(120).optional(),
  founders: z.string().max(800).optional(),
  keywords: z.string().max(400).optional(),
  // User-supplied required substring (case-insensitive). Every suggested
  // company name must contain this fragment.
  mustInclude: z.string().min(1).max(40).optional(),
  count: z.number().int().min(3).max(30).optional().default(20),
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

const CandidateSchema = z.object({
  name: z.string(),
  archetype: z.enum(ARCHETYPES),
  rationale: z.string(),
  pronunciation_hint: z.string(),
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
const MAX_OUTPUT_TOKENS = 700
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
    founders,
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

  const client = new OpenAI({
    apiKey,
    timeout: OPENAI_TIMEOUT_MS,
    maxRetries: 0,
  })

  const userPayload = {
    target_number: targetNumber,
    system,
    structure,
    industry,
    country: country ?? 'international',
    founders: founders || null,
    keywords: keywords || null,
    must_include: mustInclude
      ? `Every name MUST contain the substring "${mustInclude}" (case-insensitive). Names without this substring will be discarded.`
      : null,
    intersection_filter:
      selection === 'both'
        ? 'Names will be filtered to those whose letters reduce to the target under BOTH Pythagorean and Chaldean systems. This is a tight intersection — favor short to medium length, varied letters, and a wide pool.'
        : null,
    // When intersection-filtering, the natural hit-rate drops sharply
    // (≈1%–2% vs ≈11% single-system), so we ask the model for more.
    count:
      selection === 'both'
        ? Math.min(Math.ceil(count * OVERSAMPLE_FACTOR * 2.5), MAX_GENERATED)
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
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          { role: 'system', content: COMPANY_SUGGESTIONS_SYSTEM_PROMPT },
          {
            role: 'user',
            content:
              JSON.stringify(payload) +
              '\n\nReturn ONLY a JSON object of shape {"candidates":[{"name","archetype","rationale","pronunciation_hint"}, ...], "notes": null} with no markdown.',
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
  // If the pool already covers a third of what the user asked for, that's a
  // good signal we don't need to spend 9.5s on the model. Return pool-only.
  const skipModel = earlyPoolPreview.length >= Math.max(5, Math.ceil(count / 3))

  if (skipModel) {
    modelSkipped = true
  } else {
    const exclude = verifiedFromModel.map((v) => v.name)
    const result = await callModelPass(exclude)
    if ('error' in result) {
      modelError = result.error
    } else {
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
        if (verifiedFromModel.length >= count) break
      }
    }
  }

  // If every pass failed entirely, fall back to offline pool
  if (verifiedFromModel.length === 0 && modelError) {
    const suggestions = buildPoolResult('pool-fallback')
    return NextResponse.json({
      suggestions,
      notes:
        'OpenAI request did not return structured output — showing names from the offline pool. They still verify to your target number.',
      meta: {
        requested_count: count,
        generated_count: suggestions.length,
        verified_count: suggestions.length,
        target_number: targetNumber,
        system,
        structure,
        model: 'offline-pool',
        model_error: modelError,
      },
    })
  }

  // Slice to count
  const modelSliced = verifiedFromModel.slice(0, count)

  // Top up from offline pool if model didn't produce enough verified hits
  let suggestions: Array<
    VerifiedModelEntry | ReturnType<typeof buildPoolResult>[number]
  > = modelSliced
  let topUpUsed = false
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

  return NextResponse.json({
    suggestions,
    notes:
      suggestions.length === 0
        ? 'No matches in either the model output or the offline pool. Try a different target number or industry.'
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
