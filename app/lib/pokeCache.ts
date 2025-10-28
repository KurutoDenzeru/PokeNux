// Shared Pokemon detail fetching with caching and batching
// Uses the generic cache manager for consistency
import { createCache, type Cache } from './cacheManager'
import { fetchWithRetry } from './fetchUtils'

// Cache for Pokemon details with 10-minute TTL
const pokemonCache: Cache<any> = createCache({ ttl: 10 * 60 * 1000, maxSize: 100 })

async function fetchJson(url: string) {
  const result = await fetchWithRetry(url, { retries: 2, timeout: 8000 })
  if (!result.success) {
    throw result.error || new Error(`Fetch failed: ${url}`)
  }
  return result.data
}

function extractIdFromUrl(url: string | undefined) {
  if (!url) return 0
  try {
    const parts = String(url).split('/').filter(Boolean)
    const last = parts[parts.length - 1]
    return last && /^[0-9]+$/.test(last) ? Number(last) : 0
  } catch (e) {
    return 0
  }
}

export type PokemonResume = { name: string; url: string }
export type PokemonDetail = { name: string; url: string; id: number; types: Array<{ name: string }> }

export async function fetchPokemonDetailsBatch(items: PokemonResume[], concurrency = 6): Promise<PokemonDetail[]> {
  if (!Array.isArray(items) || items.length === 0) return []

  const queue = items.slice()
  const out: PokemonDetail[] = []

  const worker = async () => {
    while (queue.length) {
      const item = queue.shift()
      if (!item) break
      const key = item.url
      try {
        // Check cache first
        const cached = pokemonCache.get(key)
        if (cached) {
          const r = cached
          const id = r.id || extractIdFromUrl(item.url)
          const types = Array.isArray(r.types) ? r.types.map((t: any) => ({ name: t.type?.name ?? t.name })) : []
          out.push({ name: item.name, url: item.url, id, types })
          continue
        }

        // Fetch with retry logic
        const r = await fetchJson(item.url)
        pokemonCache.set(key, r)
        const id = r.id || extractIdFromUrl(item.url)
        const types = Array.isArray(r.types) ? r.types.map((t: any) => ({ name: t.type?.name ?? t.name })) : []
        out.push({ name: item.name, url: item.url, id, types })
      } catch (e) {
        // non-fatal: push a best-effort fallback using resume data
        const id = extractIdFromUrl(item.url)
        out.push({ name: item.name, url: item.url, id, types: [] })
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker())
  await Promise.all(workers)
  return out
}

/**
 * Preload images with optional priority levels and batch control
 * @param urls - Array of image URLs to preload
 * @param priority - 'high' (immediate), 'normal' (gradual), 'low' (lazy)
 * @param batchSize - Number of images to load concurrently
 */
export function preloadImages(
  urls: string[],
  priority: 'high' | 'normal' | 'low' = 'normal',
  batchSize: number = 5
) {
  if (!Array.isArray(urls) || urls.length === 0) return

  // Filter out invalid URLs
  const validUrls = urls.filter((u): u is string => typeof u === 'string' && u.length > 0)
  if (validUrls.length === 0) return

  // Determine delay based on priority
  const delayMs = priority === 'high' ? 0 : priority === 'normal' ? 100 : 500

  // Load in batches
  let loaded = 0
  const loadBatch = () => {
    const batch = validUrls.slice(loaded, loaded + batchSize)
    batch.forEach(url => {
      try {
        const img = new Image()
        img.loading = 'lazy' // Browser-level lazy loading
        img.src = url
      } catch (e) {
        // Silently ignore errors
      }
    })
    loaded += batch.length

    // Schedule next batch
    if (loaded < validUrls.length) {
      setTimeout(loadBatch, delayMs)
    }
  }

  loadBatch()
}
