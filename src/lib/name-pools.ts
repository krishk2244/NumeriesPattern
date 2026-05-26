/**
 * Per-country name pools — pre-computed offline. See scripts/build-name-pools.ts.
 *
 * At runtime the route loads these JSON files once at module scope and filters
 * locally via calculateName() — no model call per request.
 */

import { promises as fs } from 'fs'
import * as path from 'path'

export interface PoolName {
  name: string
  origin: string
  meaning: string
  gender: string
  era: string
}

export interface NamePool {
  country: string
  generated_at: string
  model: string
  count: number
  names: PoolName[]
}

const POOL_DIR = path.join(process.cwd(), 'src/data/name-pools')

function slugify(country: string): string {
  return country.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

const cache = new Map<string, NamePool>()
let availableSlugs: Set<string> | null = null

export async function listAvailablePools(): Promise<Set<string>> {
  if (availableSlugs) return availableSlugs
  try {
    const entries = await fs.readdir(POOL_DIR)
    availableSlugs = new Set(
      entries.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
    )
  } catch {
    availableSlugs = new Set()
  }
  return availableSlugs
}

export async function loadPool(country: string): Promise<NamePool | null> {
  const slug = slugify(country)
  if (cache.has(slug)) return cache.get(slug)!

  const available = await listAvailablePools()
  if (!available.has(slug)) return null

  const raw = await fs.readFile(path.join(POOL_DIR, `${slug}.json`), 'utf-8')
  const pool = JSON.parse(raw) as NamePool
  cache.set(slug, pool)
  return pool
}

/**
 * Load every available country pool and combine into a single flat list.
 * Deduplicates by lowercased name across cultures. Used when the caller
 * doesn't specify a country — the result is a cross-cultural common pool.
 */
let combinedCache: NamePool | null = null
export async function loadCombinedPool(): Promise<NamePool> {
  if (combinedCache) return combinedCache

  const available = await listAvailablePools()
  const merged: PoolName[] = []
  const seen = new Set<string>()
  let earliest = new Date().toISOString()

  for (const slug of available) {
    const raw = await fs.readFile(path.join(POOL_DIR, `${slug}.json`), 'utf-8')
    const pool = JSON.parse(raw) as NamePool
    cache.set(slug, pool)
    if (pool.generated_at < earliest) earliest = pool.generated_at
    for (const n of pool.names) {
      const key = n.name.toLowerCase().trim()
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(n)
    }
  }

  combinedCache = {
    country: 'Universal',
    generated_at: earliest,
    model: 'combined',
    count: merged.length,
    names: merged,
  }
  return combinedCache
}
