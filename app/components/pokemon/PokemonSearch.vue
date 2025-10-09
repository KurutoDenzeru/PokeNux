<template>
  <div class="relative w-full max-w-lg mx-auto">
    <div class="relative">
      <Input v-model="searchQuery" type="text" placeholder="Search Pokémon by name or number..." class="w-full pr-10"
        @input="handleSearch" @keydown.enter="handleEnterKey" @focus="showDropdown = true" @blur="handleBlur" />
      <Search class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
    </div>

    <!-- Search results dropdown -->
    <div v-if="showDropdown && searchResults.length > 0"
      class="absolute z-50 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-[400px] overflow-y-auto">
      <div v-for="result in searchResults" :key="result.id"
        class="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
        @mousedown.prevent="handleSelectPokemon(result)">
        <!-- Sprite -->
        <div class="flex-shrink-0 w-12 h-12 flex items-center justify-center">
          <img :src="result.sprite" :alt="result.name" class="w-full h-full object-contain" loading="lazy" />
        </div>

        <!-- Index and Name -->
        <div class="flex flex-col flex-1 min-w-0">
          <span class="text-xs font-mono text-zinc-400">{{ result.index }}</span>
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize truncate">
            {{ result.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { Search } from 'lucide-vue-next'
  import Input from '@/components/ui/input/Input.vue'

  const router = useRouter()

  const searchQuery = ref('')
  const searchResults = ref<Array<{ id: number; name: string; sprite: string; index: string }>>([])
  const showDropdown = ref(false)

  // Debounce timer
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

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
        // Fetch all Pokémon (we'll use a reasonable limit)
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
        const data = await response.json()

        // Filter results by name or ID
        const matches = data.results
          .map((p: any, idx: number) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0', 10)
            return { ...p, id, index: `#${String(id).padStart(4, '0')}` }
          })
          .filter((p: any) => {
            const matchesName = p.name.includes(query)
            const matchesId = String(p.id).includes(query) || p.index.includes(query)
            return matchesName || matchesId
          })
          .slice(0, 10) // Limit to 10 results

        // Fetch sprites for matches
        const resultsWithSprites = await Promise.all(
          matches.map(async (p: any) => {
            try {
              const detailResponse = await fetch(p.url)
              const detail = await detailResponse.json()
              return {
                id: p.id,
                name: p.name,
                sprite: detail.sprites.front_default || '',
                index: p.index,
              }
            } catch (e) {
              return {
                id: p.id,
                name: p.name,
                sprite: '',
                index: p.index,
              }
            }
          })
        )

        searchResults.value = resultsWithSprites
        showDropdown.value = true
      } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
      }
    }, 300)
  }

  const handleSelectPokemon = (pokemon: { id: number; name: string }) => {
    // Navigate to Pokémon detail page
    router.push(`/pokemon/${pokemon.id}`)
    searchQuery.value = ''
    searchResults.value = []
    showDropdown.value = false
  }

  const handleEnterKey = () => {
    // Navigate to the top result if available
    const topResult = searchResults.value[0]
    if (topResult && topResult.id) {
      router.push(`/pokemon/${topResult.id}`)
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
</script>
