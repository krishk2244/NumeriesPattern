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
import { loadPool, loadCombinedPool, PoolName } from '@/lib/name-pools'
import { isSuggestEnabled } from '@/lib/features'

export const runtime = 'nodejs'

const RequestSchema = z.object({
  targetNumber: z.number().int().min(1).max(9),
  system: z.enum(['pythagorean', 'chaldean', 'both']),
  country: z.string().min(1).max(120).optional(),
  keywords: z.string().max(400).optional(),
  mustInclude: z.string().min(1).max(40).optional(),
  count: z.number().int().min(3).max(100).optional().default(20),
})

/**
 * Returns true if the name reduces to targetNumber under every system in the
 * selection. For 'both', this is an AND — strictest match. For a single
 * system, this is the usual single-system check.
 */
function matchesAllSystems(
  name: string,
  systems: NumerologySystem[],
  targetNumber: number
): boolean {
  for (const sys of systems) {
    const calc = calculateName(name, sys)
    if (calc.finalNumber !== targetNumber) return false
  }
  return true
}

// Soft filters from free-text keywords (gender, era hints).
function applyKeywordFilters(
  names: PoolName[],
  keywords: string | undefined
): PoolName[] {
  if (!keywords) return names
  const lower = keywords.toLowerCase()
  let pool = names

  if (/\b(masculine|male|boy|men)\b/.test(lower)) {
    pool = pool.filter((n) => n.gender === 'M' || n.gender === 'U')
  } else if (/\b(feminine|female|girl|women)\b/.test(lower)) {
    pool = pool.filter((n) => n.gender === 'F' || n.gender === 'U')
  } else if (/\bunisex\b/.test(lower)) {
    pool = pool.filter((n) => n.gender === 'U')
  }

  if (/\b(classical|traditional|ancient|old)\b/.test(lower)) {
    pool = pool.filter((n) => n.era === 'classical')
  } else if (/\b(modern|20th)\b/.test(lower)) {
    pool = pool.filter((n) => n.era === 'modern' || n.era === 'classical')
  } else if (/\b(contemporary|current|trendy|popular)\b/.test(lower)) {
    pool = pool.filter((n) => n.era === 'contemporary' || n.era === 'modern')
  }

  const tokens = lower
    .replace(/[,;.]/g, ' ')
    .split(/\s+/)
    .filter(
      (t) =>
        t.length > 3 &&
        ![
          'masculine',
          'feminine',
          'male',
          'female',
          'classical',
          'modern',
          'contemporary',
          'unisex',
          'name',
          'names',
          'with',
          'from',
        ].includes(t)
    )
  if (tokens.length && pool.length > 0) {
    const fuzzy = pool.filter((n) => {
      const blob = (n.origin + ' ' + n.meaning).toLowerCase()
      return tokens.some((t) => blob.includes(t))
    })
    if (fuzzy.length >= 3) pool = fuzzy
  }
  return pool
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Substring filter — case-insensitive contains test.
function matchesMustInclude(name: string, fragment: string | undefined): boolean {
  if (!fragment) return true
  return name.toLowerCase().includes(fragment.toLowerCase())
}

/* ──────────────────────  OpenAI top-up  ────────────────────── */

// origin/gender/era are optional with defaults so the lean composition
// path (which returns only name + meaning, to fit many more candidates in
// the token budget) parses cleanly.
const NameCandidateSchema = z.object({
  name: z.string(),
  origin: z.string().optional().default(''),
  meaning: z.string().optional().default(''),
  gender: z.string().optional().default('U'),
  era: z.string().optional().default('contemporary'),
})

const NameResponseSchema = z.object({
  names: z.array(NameCandidateSchema),
})

async function generateFromOpenAI(opts: {
  targetNumber: number
  selection: SystemSelection
  country: string | undefined
  keywords: string | undefined
  mustInclude: string | undefined
  count: number
  exclude?: string[]
}): Promise<PoolName[] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  // 9.5s wall-clock cap, NO retries. gpt-4o-mini needs ~9s for structured
  // JSON output; tighter timeouts caused all calls to fail. Total route
  // latency ~10s on narrowed queries; plain queries skip OpenAI entirely.
  // Must-include composition needs a wider candidate pool, so allow more
  // wall-clock when it's active. baseURL is optional — lets the same key
  // work via OpenRouter when OPENAI_BASE_URL is set.
  const timeout = opts.mustInclude ? 18_000 : 9_500
  const client = new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || undefined,
    timeout,
    maxRetries: 0,
  })

  const constraints: string[] = []
  if (opts.country) constraints.push(`country / cultural tradition: ${opts.country}`)
  if (opts.keywords) constraints.push(`keywords (theme, gender, era): ${opts.keywords}`)
  if (opts.mustInclude) {
    const kw = opts.keywords
      ? ` The parts you add should thematically relate to the keywords: "${opts.keywords}".`
      : ''
    constraints.push(
      `COMPOSITION RULE — the substring "${opts.mustInclude}" is a FIXED CORE that must appear verbatim (case-insensitive) in EVERY name. Build complete, pronounceable names by adding letters or name-elements BEFORE and/or AFTER this core. The core may sit at the start, middle, or end. Example: for core "ar" you might produce Arman, Maara, Omar, Aravind, Tarun.${kw} Vary the added parts and total length widely so the server can find spellings that reduce to the target. Composed/blended names are allowed here even if uncommon, as long as they are pronounceable and the core "${opts.mustInclude}" is present.`
    )
  }
  if (opts.selection === 'both')
    constraints.push(
      'Names will be filtered to those whose letters reduce to the target under BOTH Pythagorean and Chaldean systems — this is a tight intersection. Favor short to medium-length names, mix common letters, and submit a wide variety so the server can find matches.'
    )

  // Composition path uses a LEAN schema (name + short meaning only). Each
  // full entry costs ~70 tokens; a lean one ~18. That lets us fit ~40
  // candidates in the budget instead of ~15 — critical because only ~11%
  // of composed names reduce to a single target (≈1% under 'both').
  const lean = Boolean(opts.mustInclude)

  const systemPrompt = lean
    ? `You are NUMERIS Atelier — a name composer. Build a wide variety of pronounceable first names around a required core substring.

For each name provide ONLY:
- name: the full composed name in plain Latin letters (no diacritics)
- meaning: 3-6 words on its sense/theme

Composed/blended names are fine — they need only be pronounceable and contain the required core. Vary length and the parts you add. No duplicates.

Return JSON only, no prose.`
    : `You are NUMERIS Atelier — a cross-cultural name advisor. Generate a wide variety of culturally authentic real first names matching the user's constraints.

For each name provide:
- name: standard Latin transliteration of the given name (strip diacritics)
- origin: one short sentence on the cultural / linguistic root
- meaning: one short sentence on the traditional meaning
- gender: "M" masculine, "F" feminine, or "U" unisex
- era: "classical", "modern", or "contemporary"

Diversity matters: vary across gender (unless specified), era, region, and length.
Authenticity matters: only real names actually used in some culture; no portmanteaus, no fictional-only names.
No duplicates or spelling variants of the same name.

Return JSON only, no prose.`

  const userMsgLines = [
    `Generate ${opts.count} candidate names with these constraints:`,
    ...constraints,
  ]
  if (opts.exclude && opts.exclude.length > 0) {
    userMsgLines.push(
      `\nDo NOT include any of these names (already returned in earlier passes): ${opts.exclude.join(', ')}`
    )
  }
  userMsgLines.push(
    "\nThe server verifies each name's numerology value; you do not need to compute it. Submit a varied pool."
  )

  const shape = lean
    ? '{"names":[{"name","meaning"}, ...]}'
    : '{"names":[{"name","origin","meaning","gender","era"}, ...]}'

  try {
    // Plain JSON mode (not strict structured outputs / `.parse()`) — the
    // latter runs OpenAI's per-token schema-validation grammar which adds
    // 4-8s of latency on gpt-4o-mini. Plain json_object + post-parse with
    // Zod is dramatically faster and still validates everything we care
    // about.
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: lean ? 1500 : 900,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content:
            userMsgLines.join('\n') +
            `\n\nReturn ONLY a JSON object of shape ${shape} with no markdown fencing.`,
        },
      ],
      response_format: { type: 'json_object' },
    })
    const text = completion.choices[0]?.message.content
    if (!text) return null
    const cleaned = text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
    const obj = JSON.parse(cleaned) as unknown
    const validated = NameResponseSchema.safeParse(obj)
    if (!validated.success) return null
    return validated.data.names
  } catch (err) {
    console.error('[suggest-names] OpenAI top-up failed:', err)
    return null
  }
}

/* ──────────────────────  ROUTE  ────────────────────── */

export async function POST(req: Request) {
  if (!isSuggestEnabled()) {
    return NextResponse.json(
      { error: 'Name Atelier is coming soon. Try the Calculator in the meantime.' },
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
  const { targetNumber, system, country, keywords, mustInclude, count } =
    parsed.data
  const selection = system as SystemSelection
  const activeSystems = expandSelection(selection)

  // Load pool
  let pool = country ? await loadPool(country) : null
  if (!pool) pool = await loadCombinedPool()
  if (!pool || pool.names.length === 0) {
    return NextResponse.json(
      { error: 'No name pool data available on this server.' },
      { status: 500 }
    )
  }

  // Hard filter — must reduce to target under every system in the selection.
  // For 'both' this is the intersection (Pythagorean AND Chaldean).
  const matchingNumber = pool.names.filter((n) =>
    matchesAllSystems(n.name, activeSystems, targetNumber)
  )

  let filteredPool = applyKeywordFilters(matchingNumber, keywords)
  let mustIncludeFellBack = false
  if (mustInclude) {
    const withSubstring = filteredPool.filter((n) => matchesMustInclude(n.name, mustInclude))
    if (withSubstring.length > 0) {
      filteredPool = withSubstring
    } else {
      // No names contain the substring — fall back to the pre-mustInclude pool
      // and let the OpenAI top-up try to generate matches instead.
      mustIncludeFellBack = true
    }
  }

  // OpenAI top-up policy (sub-10s budget):
  //   - Plain queries → skip OpenAI entirely. The 461-name pool handles them
  //     in <100ms and gpt-4o-mini's structured-output latency is ~8-12s.
  //   - Narrowed queries (mustInclude OR system='both') → user has opted into
  //     a tight slice where the pool falls short. Fire ONE model call with a
  //     6.5s wall-clock cap. Pool result is the floor; model adds when fast.
  const fromModel: PoolName[] = []
  let modelAttempted = false
  let modelError: string | null = null
  const seenNames = new Set(filteredPool.map((n) => n.name.toLowerCase()))

  // Trigger model top-up when:
  //   - User explicitly narrowed (mustInclude, both, country)
  //   - OR keyword filter collapsed the pool to a fraction of count
  // Plain queries skip OpenAI and serve from the pool only (~80ms).
  // If mustInclude fell back (no names contain the substring), don't count it
  // as a narrowing signal — the substring is unmatchable and the OpenAI top-up
  // would waste time generating names that also can't match.
  const effectiveMustInclude = mustIncludeFellBack ? undefined : mustInclude
  const userNarrowedSearch =
    Boolean(effectiveMustInclude) ||
    selection === 'both' ||
    Boolean(country) ||
    (Boolean(keywords) && filteredPool.length < Math.max(3, Math.ceil(count / 3)))
  if (userNarrowedSearch && filteredPool.length < count) {
    modelAttempted = true
    // Must-include composition has a low pass-rate (the full spelling must
    // both contain the core AND reduce to target). The lean schema lets us
    // ask for a big batch so enough survive the numerology filter.
    const askFor = mustInclude
      ? selection === 'both'
        ? 50
        : 40
      : selection === 'both'
        ? Math.min(12, (count - filteredPool.length) * 3)
        : Math.min(12, (count - filteredPool.length) * 2)

    // Tight combos (must-include, especially with 'both') hit ~1-11% per
    // candidate, so a single pass often yields very few. Run several passes,
    // accumulating verified hits and excluding what we've already seen, until
    // we reach `count` or exhaust the pass budget.
    const maxPasses = mustInclude ? (selection === 'both' ? 4 : 3) : 1
    for (let pass = 0; pass < maxPasses; pass++) {
      if (filteredPool.length + fromModel.length >= count) break
      const exclude = [
        ...filteredPool.map((n) => n.name),
        ...fromModel.map((n) => n.name),
      ].slice(-60)

      const generated = await generateFromOpenAI({
        targetNumber,
        selection,
        country,
        keywords,
        // When mustInclude has no pool support at all (mustIncludeFellBack),
        // pass undefined so the model can compose names without the
        // substring being a hard generation constraint upstream — the
        // local filter below still enforces it if effectiveMustInclude
        // remains the substring.
        mustInclude: effectiveMustInclude,
        count: askFor,
        exclude,
      })
      if (!generated) {
        // Surface a transient error but keep trying — gpt-4o-mini latency
        // is variable and one timeout often clears on the next call.
        if (fromModel.length === 0)
          modelError = 'OpenAI call timed out or unavailable'
        continue
      }
      let addedThisPass = 0
      for (const cand of generated) {
        const key = cand.name.toLowerCase().trim()
        if (seenNames.has(key)) continue
        if (!matchesMustInclude(cand.name, effectiveMustInclude)) continue
        if (!matchesAllSystems(cand.name, activeSystems, targetNumber)) continue
        fromModel.push(cand)
        seenNames.add(key)
        addedThisPass++
        if (filteredPool.length + fromModel.length >= count) break
      }
      // If a whole pass added nothing, another is unlikely to help much.
      if (addedThisPass === 0 && pass > 0) break
    }
  }

  // Compose selection — pool first, then model, up to count
  const shuffledPool = shuffle(filteredPool)
  const finalList: PoolName[] = [...shuffledPool, ...shuffle(fromModel)].slice(0, count)

  // Hydrate with calculation breakdown(s). When 'both' is selected, expose
  // both Pythagorean and Chaldean reductions so the UI can render either.
  const enriched = finalList.map((s) => {
    const pyth = calculateName(s.name, 'pythagorean')
    const chal = calculateName(s.name, 'chaldean')
    const primary = activeSystems[0]
    const primaryCalc = primary === 'pythagorean' ? pyth : chal
    return {
      name: s.name,
      origin: s.origin,
      meaning: s.meaning,
      gender: s.gender,
      era: s.era,
      expected_value: targetNumber,
      actual_value: primaryCalc.finalNumber,
      letters: primaryCalc.letters,
      reduction_steps: primaryCalc.reductionSteps,
      sum: primaryCalc.sum,
      // Always include both reductions so the UI can show them when 'both' is selected
      pythagorean: {
        final: pyth.finalNumber,
        sum: pyth.sum,
        reduction_steps: pyth.reductionSteps,
      },
      chaldean: {
        final: chal.finalNumber,
        sum: chal.sum,
        reduction_steps: chal.reductionSteps,
      },
      verified: true,
    }
  })

  return NextResponse.json({
    suggestions: enriched,
    notes:
      enriched.length === 0
        ? mustInclude
          ? `No names containing "${mustInclude}" reduce to ${targetNumber} under ${selection === 'both' ? 'both systems' : selection}.`
          : selection === 'both'
            ? `No names reduce to ${targetNumber} under both Pythagorean AND Chaldean. Try a different target number — the intersection is naturally tight.`
            : 'No matches. Try a different target number or remove keywords.'
        : mustIncludeFellBack
          ? `No names contain "${mustInclude}" as a substring — showing all names that reduce to ${targetNumber} instead.`
          : null,
    meta: {
      requested_count: count,
      pool_size: pool.count,
      matching_target: matchingNumber.length,
      after_keyword_filter: filteredPool.length,
      from_model: fromModel.length,
      returned_count: enriched.length,
      system_selection: selection,
      must_include: mustInclude ?? null,
      model_attempted: modelAttempted,
      model_error: modelError,
      pool_generated_at: pool.generated_at,
      pool_model: pool.model,
    },
  })
}
