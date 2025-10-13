<template>
  <div class="relative w-full max-w-lg mx-auto">
    <div class="relative">
      <Input v-model="searchQuery" type="text" placeholder="Search Pokémon by name, number, or generation..."
        class="w-full pr-10" @input="handleSearch" @keydown.enter="handleEnterKey" @focus="showDropdown = true"
        @blur="handleBlur" />
      <Search class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
    </div>

    <!-- Search results dropdown -->
    <div v-if="showDropdown"
      class="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-[400px] overflow-y-auto">
      <!-- No results message -->
      <div v-if="searchResults.length === 0 && searchQuery.trim()" class="p-4 text-center text-muted-foreground">
        No results found for "{{ searchQuery.trim() }}"
      </div>

      <!-- Results -->
      <div v-for="result in searchResults" :key="result.id"
        class="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
        @mousedown.prevent="handleSelectPokemon(result)">
        <!-- Sprite -->
        <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center relative">
          <img v-if="result.sprite && !imageErrors[result.id]" :src="result.sprite" :alt="result.name"
            class="w-full h-full object-contain" loading="lazy" @error="() => imageErrors[result.id] = true" />
          <ImageSkeleton v-if="!result.sprite || imageErrors[result.id]" class="w-full h-full" />
        </div>

        <!-- Index and Name -->
        <div class="flex flex-col flex-1 min-w-0">
          <span class="text-xs font-mono text-zinc-400"
            v-html="highlightMatch(result.index, currentSearchQuery)"></span>
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize truncate"
            v-html="highlightMatch(result.name, currentSearchQuery)">
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Search } from 'lucide-vue-next'
  import Input from '@/components/ui/input/Input.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'

  const router = useRouter()

  const searchQuery = ref('')
  const currentSearchQuery = ref('')
  const searchResults = ref<Array<{ id: number | string; name: string; sprite: string; index: string; type: 'pokemon' | 'card' }>>([])
  const showDropdown = ref(false)
  const imageErrors = ref<Record<string | number, boolean>>({})

  // Debounce timer
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const getPokemonGeneration = (id: number): string => {
    if (id <= 151) return 'Generation I - Kanto'
    if (id <= 251) return 'Generation II - Johto'
    if (id <= 386) return 'Generation III - Hoenn'
    if (id <= 493) return 'Generation IV - Sinnoh'
    if (id <= 649) return 'Generation V - Unova'
    if (id <= 721) return 'Generation VI - Kalos'
    if (id <= 809) return 'Generation VII - Alola'
    if (id <= 905) return 'Generation VIII - Galar'
    return 'Generation IX - Paldea'
  }

  const handleSearch = async () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      searchResults.value = []
      showDropdown.value = false
      return
    }

    searchTimeout = setTimeout(async () => {
      try {
        // Reset image errors for new search
        imageErrors.value = {}

        // Store the current query for highlighting
        currentSearchQuery.value = query

        // Fetch all Pokémon (we'll use a reasonable limit)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
        const data = await response.json()

        // Filter results by name or ID
        const matches = data.results
          .map((p: any, idx: number) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0', 10)
            return { ...p, id, index: `${getPokemonGeneration(id)} • #${String(id).padStart(4, '0')}` }
          })
          .filter((p: any) => {
            const matchesName = p.name.includes(query)
            const matchesId = String(p.id).includes(query) || p.index.includes(query)
            return matchesName || matchesId
          })
          .slice(0, 10) // Limit to 10 Pokémon results

        // Fetch sprites for matches (pokemon)
        const pokemonResults = await Promise.all(
          matches.map(async (p: any) => {
            try {
              const detailResponse = await fetch(p.url)
              const detail = await detailResponse.json()
              return {
                id: p.id,
                name: p.name,
                sprite: detail.sprites.front_default || '',
                index: p.index,
                type: 'pokemon' as const,
              }
            } catch (e) {
              return {
                id: p.id,
                name: p.name,
                sprite: '',
                index: p.index,
                type: 'pokemon' as const,
              }
            }
          })
        )

        // --- TCG search (tcgdex) ---
        let tcgResults: Array<{ id: string; name: string; sprite: string; index: string; type: 'card' }> = []
        try {
          // Use the english endpoint for search; limit results client-side
          const tcgRes = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}`)
          if (tcgRes.ok) {
            const tcgJson = await tcgRes.json()
            if (Array.isArray(tcgJson) && tcgJson.length > 0) {
              // Fetch set details for each card to get set names
              const cardsWithSets = await Promise.all(
                tcgJson.slice(0, 10).map(async (c: any) => {
                  let setName = ''
                  if (c.set) {
                    setName = c.set.name
                  } else {
                    // Parse set ID from card ID (format: setId-localId)
                    const parts = c.id.split('-')
                    if (parts.length >= 2) {
                      const setId = parts.slice(0, -1).join('-')
                      try {
                        const setRes = await fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`)
                        if (setRes.ok) {
                          const setData = await setRes.json()
                          setName = setData.name || setId
                        }
                      } catch (e) {
                        console.warn('Failed to fetch set for', setId, e)
                      }
                    }
                  }
                  const localId = c.localId || c.id.split('-').pop() || c.id
                  const idxLabel = setName ? `${setName} • Card #${localId}` : `Card: ${c.id}`
                  // card.image may be a base url; fall back to set symbol if missing
                  const sprite = c.image ? `${c.image}/high.webp` : (c.set?.symbol || '')
                  return {
                    id: c.id,
                    name: c.name,
                    sprite,
                    index: idxLabel,
                    type: 'card' as const,
                  }
                })
              )
              tcgResults = cardsWithSets
            }
          }
        } catch (e) {
          // Don't fail the whole search if tcgdex is down
          console.warn('TCG search error:', e)
          tcgResults = []
        }

        // Merge results: show Pokémon first then TCG cards, limit total shown to 10
        const combined = [...pokemonResults, ...tcgResults].slice(0, 10)
        searchResults.value = combined
        showDropdown.value = true
      } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
      }
    }, 300)
  }

  const handleSelectPokemon = (result: { id: number | string; name: string; type: 'pokemon' | 'card' }) => {
    // Navigate depending on result type
    if (result.type === 'pokemon') {
      router.push(`/pokemon/${result.id}`)
    } else {
      router.push(`/tcg/${result.id}`)
    }
    searchQuery.value = ''
    searchResults.value = []
    showDropdown.value = false
  }

  const handleEnterKey = () => {
    // Navigate to the top result if available
    const topResult = searchResults.value[0]
    if (topResult && topResult.id) {
      if (topResult.type === 'pokemon') {
        router.push(`/pokemon/${topResult.id}`)
      } else {
        router.push(`/tcg/${topResult.id}`)
      }
      searchQuery.value = ''
      searchResults.value = []
      showDropdown.value = false
    }
  }

  const handleBlur = () => {
    // Delay to allow click event to fire
    setTimeout(() => {
      showDropdown.value = false
    }, 200)
  }

  const highlightMatch = (text: string, query: string): string => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<span class="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded">$1</span>')
  }
</script>
