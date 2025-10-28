import { ref, computed, watchEffect, type Ref } from 'vue'
import { useFetch } from '#app'
import { fetchWithRetry } from '@/lib/fetchUtils'

type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Array<{ name: string; url: string }>
}

type PokemonTypeInfo = {
  type: { name: string; url: string }
}

type PokemonDetailResponse = {
  id: number
  name: string
  types: PokemonTypeInfo[]
}

type PokemonGridItem = {
  name: string
  url: string
  id: number | null
  types: Array<{ name: string }>
}

export const usePokemonGrid = (pageRef: Ref<number>, pageSizeRef?: Ref<number>) => {
  const PAGE_SIZE = computed(() => pageSizeRef?.value ?? 24)
  const offset = computed(() => (pageRef.value - 1) * PAGE_SIZE.value)
  const { data, pending, error } = useFetch<PokemonListResponse>(() => `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE.value}&offset=${offset.value}`)

  const pokemons = ref<PokemonGridItem[]>([])
  const count = ref(0)
  const isLoading = ref(true)

  watchEffect(async () => {
    isLoading.value = true
    const results = data.value?.results ?? []
    count.value = data.value?.count ?? 0
    if (results.length) {
      const details = await Promise.all(
        results.map(async (p): Promise<PokemonGridItem> => {
          try {
            const result = await fetchWithRetry<PokemonDetailResponse>(
              p.url,
              { retries: 2, timeout: 8000 }
            )

            if (result.success && result.data) {
              return {
                name: p.name,
                url: p.url,
                id: result.data.id,
                types: result.data.types.map((t: PokemonTypeInfo) => ({ name: t.type.name })),
              }
            } else {
              throw result.error
            }
          } catch (e) {
            return { name: p.name, url: p.url, id: null, types: [] }
          }
        })
      )
      pokemons.value = details
    } else {
      pokemons.value = []
    }
    isLoading.value = false
  })

  return {
    pokemons,
    count,
    isLoading,
    hasError: error,
    // allow external callers to request a specific page be loaded
    fetchPage: (p: number) => {
      pageRef.value = p
    }
  }
}
