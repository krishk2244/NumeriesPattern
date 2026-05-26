/**
 * Offline pool of invented company names used as a guaranteed fallback for
 * /api/suggest-companies. Hand-curated; tagged with archetype, industries,
 * and vibes so the route can soft-match a user's brief.
 *
 * Loaded once via static import — Next bundles the JSON at build time.
 */

import poolJson from '@/data/company-pool.json'

export interface PoolCompany {
  name: string
  archetype: string
  rationale: string
  pronunciation_hint: string
  industries: string[]
  vibes: string[]
}

interface PoolFile {
  generated_at: string
  source: string
  count: number
  names: PoolCompany[]
}

const POOL = poolJson as PoolFile

export function getPool(): PoolCompany[] {
  return POOL.names
}

/**
 * Score a pool entry against a user's brief. Higher = better match.
 * Tokens are tried against the candidate's industries + vibes + the raw
 * industry/keywords strings the user typed.
 */
export function scoreCompany(
  entry: PoolCompany,
  opts: { industry?: string; keywords?: string }
): number {
  const sources = [
    entry.industries.join(' '),
    entry.vibes.join(' '),
    entry.archetype,
    entry.rationale,
  ]
    .join(' ')
    .toLowerCase()

  const queryBlob = [opts.industry ?? '', opts.keywords ?? '']
    .join(' ')
    .toLowerCase()
  const tokens = queryBlob
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3)

  if (tokens.length === 0) return 0

  let score = 0
  for (const t of tokens) {
    if (entry.industries.some((i) => i.includes(t) || t.includes(i))) score += 3
    else if (entry.vibes.some((v) => v.includes(t) || t.includes(v))) score += 2
    else if (sources.includes(t)) score += 1
  }
  return score
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
