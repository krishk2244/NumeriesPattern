/**
 * Build per-country name pools.
 *
 * For each country, calls the model multiple times with growing exclusion
 * lists, accumulates unique names, and writes src/data/name-pools/<slug>.json.
 *
 * Run with: npm run build:pools
 *
 * Idempotent: if a pool already exists, the script seeds the exclusion list
 * with its names so reruns expand the pool rather than overwriting it.
 */

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'France',
  'Italy',
  'Japan',
] as const

const PASSES_PER_COUNTRY = 3
const NAMES_PER_PASS = 40
const MODEL = 'anthropic/claude-haiku-4.5'
const MAX_OUTPUT_TOKENS = 3500

const apiKey = process.env.OPENROUTER_API_KEY
if (!apiKey) {
  console.error('OPENROUTER_API_KEY not set. Run with --env-file=.env.local.')
  process.exit(1)
}

const client = new OpenAI({
  apiKey,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.OPENROUTER_REFERER ?? 'http://localhost:3000',
    'X-Title': 'NUMERIS-build',
  },
})

const NameSchema = z.object({
  name: z.string(),
  origin: z.string(),
  meaning: z.string(),
  gender: z.string(),
  era: z.string(),
})

const PoolSchema = z.object({
  names: z.array(NameSchema),
})

type PoolName = z.infer<typeof NameSchema>

const SYSTEM_PROMPT = `You are NUMERIS Atelier — an expert cross-cultural name advisor. Generate authentic, diverse, real first names from the country's tradition.

For each name provide:
- name: the single given name in standard Latin transliteration (strip diacritics)
- origin: one short sentence on the cultural / linguistic root
- meaning: one short sentence on the traditional meaning
- gender: "M" for masculine, "F" for feminine, or "U" for unisex
- era: "classical" (pre-20th century), "modern" (20th century classics), or "contemporary" (current popular)

DIVERSITY: vary across gender, era, region, sub-tradition, etymology, and length (4–9 letters typical). For India that means mixing Sanskrit, Hindi, Tamil, Bengali, Punjabi, Marathi roots. For Nigeria, mix Yoruba, Igbo, Hausa. For Japan, mix kanji-derived names from different reading patterns. Avoid biasing toward any one letter pattern — names should naturally span many starting letters.

AUTHENTICITY: only real names actually used in the country today or historically. No fictional-only names, no portmanteaus, no spelling variants of the same name (Aaliyah and Aliyah count as the same).

OUTPUT: JSON only, no prose around it.`

const POOL_DIR = path.join(process.cwd(), 'src/data/name-pools')

function slugify(country: string): string {
  return country.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function loadExistingPool(country: string): PoolName[] {
  const slug = slugify(country)
  const file = path.join(POOL_DIR, `${slug}.json`)
  if (!fs.existsSync(file)) return []
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    return Array.isArray(data.names) ? data.names : []
  } catch {
    return []
  }
}

async function callModel(
  country: string,
  excludeNames: string[]
): Promise<PoolName[]> {
  const exclusion =
    excludeNames.length > 0
      ? `\n\nDo NOT include any of these names (already in the pool): ${excludeNames.join(', ')}`
      : ''

  const completion = await client.chat.completions.parse({
    model: MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Country: ${country}\nGenerate ${NAMES_PER_PASS} distinct, authentic ${country} first names with broad coverage across gender, era, and naming sub-traditions.${exclusion}`,
      },
    ],
    response_format: zodResponseFormat(PoolSchema, 'name_pool'),
  })

  const data = completion.choices[0]?.message.parsed
  if (!data) throw new Error('No data parsed')
  return data.names
}

async function buildCountry(country: string): Promise<void> {
  process.stdout.write(`  ${country.padEnd(22)} `)

  const collected = new Map<string, PoolName>()
  for (const existing of loadExistingPool(country)) {
    collected.set(existing.name.toLowerCase().trim(), existing)
  }
  const seedSize = collected.size
  if (seedSize) process.stdout.write(`(seeded ${seedSize}) `)

  for (let pass = 0; pass < PASSES_PER_COUNTRY; pass++) {
    const exclusion = [...collected.values()].map((n) => n.name)
    let added = 0
    try {
      const newNames = await callModel(country, exclusion)
      for (const n of newNames) {
        const k = n.name.toLowerCase().trim()
        if (!collected.has(k)) {
          collected.set(k, n)
          added++
        }
      }
    } catch (e) {
      console.log(
        `\n    pass ${pass + 1} failed: ${e instanceof Error ? e.message : e}`
      )
      break
    }
    process.stdout.write(`+${added} `)
  }

  fs.mkdirSync(POOL_DIR, { recursive: true })
  const slug = slugify(country)
  const outPath = path.join(POOL_DIR, `${slug}.json`)
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        country,
        generated_at: new Date().toISOString(),
        model: MODEL,
        count: collected.size,
        names: [...collected.values()],
      },
      null,
      2
    )
  )

  console.log(`= ${collected.size}`)
}

async function main(): Promise<void> {
  console.log(
    `Building name pools (${PASSES_PER_COUNTRY} passes × ${NAMES_PER_PASS} names, model: ${MODEL})\n`
  )

  for (const country of COUNTRIES) {
    try {
      await buildCountry(country)
    } catch (e) {
      console.error(
        `\n  ${country} fatal: ${e instanceof Error ? e.message : e}`
      )
    }
  }

  console.log()

  // Summary
  let total = 0
  for (const country of COUNTRIES) {
    const slug = slugify(country)
    const file = path.join(POOL_DIR, `${slug}.json`)
    if (fs.existsSync(file)) {
      const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
      total += data.count
    }
  }
  console.log(`Total: ${total} names across ${COUNTRIES.length} countries.`)
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
