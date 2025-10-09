import { ref, computed, watchEffect, type Ref } from 'vue'
import { useFetch } from '#app'

type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: Array<{ name: string; url: string }>
}

export const usePokemonGrid = (pageRef: Ref<number>, pageSizeRef?: Ref<number>) => {
  const PAGE_SIZE = computed(() => pageSizeRef?.value ?? 24)
  const offset = computed(() => (pageRef.value - 1) * PAGE_SIZE.value)
  const { data, pending, error } = useFetch<PokemonListResponse>(() => `https://pokeapi.co/api/v2/pokemon?limit=${PAGE_SIZE.value}&offset=${offset.value}`)

  const pokemons = ref<any[]>([])
  const count = ref(0)
  const isLoading = ref(true)

  watchEffect(async () => {
    isLoading.value = true
    const results = data.value?.results ?? []
    count.value = data.value?.count ?? 0
    if (results.length) {
      const details = await Promise.all(
        results.map(async (p) => {
          try {
            const res = await fetch(p.url)
            const detail = await res.json()
            return {
              name: p.name,
              url: p.url,
              id: detail.id,
              types: detail.types.map((t: any) => ({ name: t.type.name })),
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
