// Shared simple cache + batched fetch helper for Pokemon details
// Keeps a short in-memory TTL and limits concurrent requests to avoid thundering herds
const CACHE = new Map<string, { data: any; ts: number }>()
const TTL = 10 * 60 * 1000 // 10 minutes

async function fetchJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`)
  return res.json()
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
        const cached = CACHE.get(key)
        if (cached && Date.now() - cached.ts < TTL) {
          const r = cached.data
          const id = r.id || extractIdFromUrl(item.url)
          const types = Array.isArray(r.types) ? r.types.map((t: any) => ({ name: t.type?.name ?? t.name })) : []
          out.push({ name: item.name, url: item.url, id, types })
          continue
        }

        const r = await fetchJson(item.url)
        CACHE.set(key, { data: r, ts: Date.now() })
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

export function preloadImages(urls: string[]) {
  if (!Array.isArray(urls)) return
  urls.forEach(u => {
    try {
      const img = new Image()
      img.src = u
    } catch (e) {
      // ignore
    }
  })
}
