<template>
  <BaseLayout :seo-config="seoConfig" :show-navbar="true" hide-theme-toggle>
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">Compare Pokémon</h1>
        <p class="text-muted-foreground">Add up to 4 Pokémon to compare their stats, abilities, and more</p>
      </div>

      <!-- View Toggle -->
      <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="text-sm font-medium">View Mode:</span>
          <div class="flex gap-2">
            <Button :variant="viewMode === 'full' ? 'default' : 'outline'" size="sm" @click="viewMode = 'full'"
              class="gap-2">
              <Eye class="w-4 h-4" />
              Full View
            </Button>
            <Button :variant="viewMode === 'difference' ? 'default' : 'outline'" size="sm"
              @click="viewMode = 'difference'" class="gap-2">
              <Diff class="w-4 h-4" />
              Differences
            </Button>
          </div>
        </div>
        <Button v-if="selectedPokemon.length > 0" variant="outline" size="sm" @click="clearAll" class="gap-2">
          <Trash2 class="w-4 h-4" />
          Clear All
        </Button>
      </div>

      <!-- Search and Add Section -->
      <div class="mb-8">
        <div class="flex gap-2 flex-col sm:flex-row">
          <div class="flex-1 relative">
            <Input v-model="searchQuery" type="text" placeholder="Search Pokémon by name or number..."
              class="w-full pr-10" @input="handleSearch" @focus="showSearchResults = true" @blur="handleBlur"
              @keydown.escape="showSearchResults = false" />
            <Search class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />

            <!-- Search Results Dropdown -->
            <div v-if="showSearchResults && searchResults.length > 0"
              class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg max-h-64 overflow-y-auto">
              <div v-for="result in searchResults" :key="result.id"
                class="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                @click="addPokemon(result)">
                <img v-if="result.sprite" :src="result.sprite" :alt="result.name" class="w-10 h-10 object-contain" />
                <div class="flex-1 min-w-0">
                  <div class="font-medium capitalize truncate">{{ result.name }}</div>
                  <div class="text-xs text-muted-foreground">{{ result.index }}</div>
                </div>
              </div>
            </div>
          </div>
          <Button v-if="selectedPokemon.length < 4 && lastSearchResult" @click="addPokemon(lastSearchResult)"
            :disabled="selectedPokemon.some(p => p?.id === lastSearchResult?.id)" class="gap-2">
            <Plus class="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      <!-- Comparison Grid -->
      <div v-if="selectedPokemon.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="(pokemon, index) in selectedPokemon" :key="index" class="flex flex-col">
          <Card class="h-full">
            <CardHeader class="relative pb-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <CardTitle class="capitalize truncate text-lg">{{ pokemon?.name }}</CardTitle>
                  <p class="text-xs text-muted-foreground mt-1">{{ pokemon?.index }}</p>
                </div>
                <Button variant="ghost" size="sm" @click="removePokemon(index)" class="p-0 h-6 w-6 shrink-0">
                  <X class="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent class="space-y-4">
              <!-- Pokémon Sprite -->
              <div v-if="pokemon?.sprite" class="flex justify-center">
                <img :src="pokemon.sprite" :alt="pokemon.name" class="w-32 h-32 object-contain" />
              </div>

              <!-- Type Badges -->
              <div v-if="pokemon?.types && pokemon.types.length > 0" class="flex flex-wrap gap-2">
                <span v-for="type in pokemon.types" :key="type.type.name" :class="[
                  badgeClass(type.type.name),
                  // Improved button-like badge: border, rounded-md, shadow-xs, h-9, px-4, py-1, flex, gap-2, font-semibold, transition, etc.
                  'justify-center whitespace-nowrap disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs h-9 has-[>svg]:px-3 px-4 py-1 rounded-md hover:text-white text-md font-semibold flex items-center gap-2 duration-150 focus:outline-none cursor-pointer ring-0'
                ]">
                  <span class="text-sm leading-none">{{ getTypeEmoji(type.type.name) }}</span>
                  <span class="capitalize text-sm">{{ type.type.name }}</span>
                </span>
              </div>

              <!-- Stats Section -->
              <div v-if="pokemon?.stats" class="space-y-3">
                <!-- Full View: All Stats -->
                <div v-if="viewMode === 'full'" class="space-y-3">
                  <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="space-y-1">
                    <div class="flex items-center justify-between text-xs md:text-sm">
                      <span class="font-medium">{{ getStatLabel(stat.stat.name) }}</span>
                      <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ stat.base_stat }}</span>
                    </div>
                    <Progress :model-value="(stat.base_stat / 255) * 100" class="h-1.5" />
                  </div>
                  <div v-if="pokemon?.totalStats" class="pt-2 border-t">
                    <div class="flex items-center justify-between font-bold text-sm">
                      <span>Total</span>
                      <span class="text-emerald-600 dark:text-emerald-400">{{ pokemon.totalStats }}</span>
                    </div>
                  </div>
                </div>

                <!-- Difference View: Only highlight different stats -->
                <div v-else-if="viewMode === 'difference'" class="space-y-3">
                  <!-- Height & Weight -->
                  <div class="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs space-y-1">
                    <div class="flex justify-between">
                      <span class="font-medium">Height</span>
                      <span class="font-bold">{{ (pokemon.height / 10).toFixed(1) }}m</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-medium">Weight</span>
                      <span class="font-bold">{{ (pokemon.weight / 10).toFixed(1) }}kg</span>
                    </div>
                  </div>

                  <!-- Different Stats Only -->
                  <div class="space-y-2">
                    <div v-for="stat in getDifferentStats(pokemon)" :key="stat.stat.name"
                      class="bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-800">
                      <div class="flex items-center justify-between text-xs md:text-sm">
                        <span class="font-medium">{{ getStatLabel(stat.stat.name) }}</span>
                        <span class="font-bold text-amber-600 dark:text-amber-400">{{ stat.base_stat }}</span>
                      </div>
                      <Progress :model-value="(stat.base_stat / 255) * 100" class="h-1.5 mt-1" />
                    </div>
                    <div v-if="getDifferentStats(pokemon).length === 0"
                      class="text-xs text-muted-foreground p-2 text-center">
                      All stats are equal
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Info -->
              <div v-if="pokemon?.abilities && pokemon.abilities.length > 0" class="pt-4 border-t">
                <p class="text-xs font-semibold text-muted-foreground mb-2">Abilities</p>
                <div class="space-y-1 text-xs">
                  <div v-for="ability in pokemon.abilities" :key="ability.ability.name" class="capitalize">
                    {{ ability.ability.name }}<span v-if="ability.is_hidden"
                      class="text-amber-600 dark:text-amber-400 ml-1">(Hidden)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="flex flex-col items-center justify-center py-16 text-center">
        <BarChart3 class="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
        <h3 class="text-lg font-semibold mb-2">No Pokémon selected</h3>
        <p class="text-muted-foreground mb-4">Search and add up to 4 Pokémon to begin comparing</p>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { Search, X, Trash2, Diff, Eye, BarChart3, Plus } from 'lucide-vue-next'
  import Input from '@/components/ui/input/Input.vue'
  import Button from '@/components/ui/button/Button.vue'
  import Progress from '@/components/ui/progress/Progress.vue'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import BaseLayout from '@/layouts/BaseLayout.vue'
  import type { SEOConfig } from '@/utils/seo'
  import { useTypeStore, type PokemonName } from '@/stores/types'

  const typeStore = useTypeStore()
  const router = useRouter()
  const route = useRoute()

  // Types
  interface ComparisonPokemon {
    id: number
    name: string
    sprite: string
    index: string
    types: Array<{ slot: number; type: { name: string; url: string } }>
    stats: Array<{ base_stat: number; stat: { name: string; url: string } }>
    abilities: Array<{ ability: { name: string; url: string }; is_hidden: boolean; slot: number }>
    height: number
    weight: number
    totalStats: number
  }

  interface SearchResult {
    id: number
    name: string
    sprite: string
    index: string
  }

  // Reuse the same TYPE_CLASSES + badgeClass pattern used in TypeFilter.vue
  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 dark:hover:border-slate-300 text-white transition-all',
    fire: 'bg-orange-500 dark:bg-transparent dark:border-orange-500 dark:text-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500/20 dark:hover:border-orange-400 text-white transition-all',
    water: 'bg-blue-500 dark:bg-transparent dark:border-blue-400 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-400/20 dark:hover:border-blue-300 text-white transition-all',
    electric: 'bg-yellow-500 dark:bg-transparent dark:border-yellow-400 dark:text-yellow-400 hover:bg-yellow-600 dark:hover:bg-yellow-400/20 dark:hover:border-yellow-300 text-white dark:text-yellow-400 transition-all',
    grass: 'bg-green-500 dark:bg-transparent dark:border-green-500 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-500/20 dark:hover:border-green-400 text-white transition-all',
    ice: 'bg-cyan-500 dark:bg-transparent dark:border-cyan-400 dark:text-cyan-400 hover:bg-cyan-600 dark:hover:bg-cyan-400/20 dark:hover:border-cyan-300 text-white dark:text-cyan-400 transition-all',
    fighting: 'bg-red-600 dark:bg-transparent dark:border-red-600 dark:text-red-500 hover:bg-red-700 dark:hover:bg-red-600/20 dark:hover:border-red-500 text-white transition-all',
    poison: 'bg-purple-500 dark:bg-transparent dark:border-purple-500 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-500/20 dark:hover:border-purple-400 text-white transition-all',
    ground: 'bg-amber-600 dark:bg-transparent dark:border-amber-600 dark:text-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600/20 dark:hover:border-amber-500 text-white transition-all',
    flying: 'bg-indigo-400 dark:bg-transparent dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-400/20 dark:hover:border-indigo-300 text-white transition-all',
    psychic: 'bg-pink-500 dark:bg-transparent dark:border-pink-500 dark:text-pink-400 hover:bg-pink-600 dark:hover:bg-pink-500/20 dark:hover:border-pink-400 text-white transition-all',
    bug: 'bg-lime-500 dark:bg-transparent dark:border-lime-500 dark:text-lime-400 hover:bg-lime-600 dark:hover:bg-lime-500/20 dark:hover:border-lime-400 text-white transition-all',
    rock: 'bg-stone-600 dark:bg-transparent dark:border-stone-500 dark:text-stone-400 hover:bg-stone-700 dark:hover:bg-stone-500/20 dark:hover:border-stone-400 text-white transition-all',
    dragon: 'bg-violet-600 dark:bg-transparent dark:border-violet-600 dark:text-violet-400 hover:bg-violet-700 dark:hover:bg-violet-600/20 dark:hover:border-violet-500 text-white transition-all',
    ghost: 'bg-purple-600 dark:bg-transparent dark:border-purple-600 dark:text-purple-400 hover:bg-purple-700 dark:hover:bg-purple-600/20 dark:hover:border-purple-500 text-white transition-all',
    dark: 'bg-zinc-700 dark:bg-transparent dark:border-zinc-600 dark:text-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-600/20 dark:hover:border-zinc-500 text-white transition-all',
    steel: 'bg-slate-500 dark:bg-transparent dark:border-slate-500 dark:text-slate-400 hover:bg-slate-600 dark:hover:bg-slate-500/20 dark:hover:border-slate-400 text-white transition-all',
    fairy: 'bg-pink-400 dark:bg-transparent dark:border-pink-400 dark:text-pink-400 hover:bg-pink-500 dark:hover:bg-pink-400/20 dark:hover:border-pink-300 text-white transition-all',
  }

  const badgeClass = (key: string) => {
    return TYPE_CLASSES[key] || 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 text-white'
  }

  // Helper function to get type emoji
  const getTypeEmoji = (typeName: string): string => {
    const type = typeStore.byName(typeName as PokemonName)
    return type?.emoji || '✨'
  }

  // State
  const viewMode = ref<'full' | 'difference'>('full')
  const searchQuery = ref('')
  const showSearchResults = ref(false)
  const searchResults = ref<SearchResult[]>([])
  const lastSearchResult = ref<SearchResult | null>(null)
  const selectedPokemon = ref<(ComparisonPokemon | null)[]>([])
  // Helper: update ?compare=1,2,3 in URL (no reload)
  function updateCompareParam() {
    const ids = selectedPokemon.value.map(p => p?.id).filter(Boolean)
    router.replace({
      query: {
        ...route.query,
        compare: ids.length > 0 ? ids.join(',') : undefined
      }
    })
  }

  // Watch for changes to selectedPokemon to update URL
  watch(selectedPokemon, updateCompareParam, { deep: true })

  // On mount: parse ?compare=... and pre-populate
  onMounted(async () => {
    const compareParam = route.query.compare
    if (compareParam && typeof compareParam === 'string') {
      const ids = compareParam.split(',').map(s => parseInt(s, 10)).filter(Boolean).slice(0, 4)
      for (const id of ids) {
        // Avoid duplicates
        if (selectedPokemon.value.some(p => p?.id === id)) continue
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
          const pokemonData = await response.json()
          const totalStats = pokemonData.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
          const comparisonPokemon = {
            id: pokemonData.id,
            name: pokemonData.name,
            sprite: pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default,
            index: `${getPokemonGeneration(pokemonData.id)} • #${String(pokemonData.id).padStart(4, '0')}`,
            types: pokemonData.types,
            stats: pokemonData.stats,
            abilities: pokemonData.abilities,
            height: pokemonData.height,
            weight: pokemonData.weight,
            totalStats,
          }
          selectedPokemon.value.push(comparisonPokemon)
        } catch (e) {
          // ignore fetch errors
        }
      }
    }
  })

  // Cache for Pokemon list
  let pokemonCache: any[] | null = null

  // SEO Config
  const seoConfig = computed<Partial<SEOConfig>>(() => ({
    title: 'Compare Pokémon | PokéNux',
    description: 'Compare Pokémon side-by-side. Analyze stats, abilities, types, and more. View full details or focus on differences between up to 4 Pokémon.',
    ogTitle: 'Compare Pokémon - PokéNux',
    ogDescription: 'Compare Pokémon side-by-side. Analyze stats, abilities, types, and more.',
    ogUrl: 'https://pokenux.nuxt.dev/pokemon/compare',
  }))

  // Get stat label
  const statLabels: Record<string, string> = {
    'hp': 'HP',
    'attack': 'Attack',
    'defense': 'Defense',
    'special-attack': 'Sp. Atk',
    'special-defense': 'Sp. Def',
    'speed': 'Speed',
  }

  const getStatLabel = (statName: string): string => {
    return statLabels[statName] || statName
  }

  // Get Pokemon generation by ID
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

  // Get different stats between selected Pokemon
  const getDifferentStats = (pokemon: ComparisonPokemon) => {
    if (selectedPokemon.value.length < 2) return pokemon.stats

    const otherStats = selectedPokemon.value
      .filter(p => p && p.id !== pokemon.id)
      .flatMap(p => p?.stats || [])

    return pokemon.stats.filter(stat => {
      const baseStat = stat.base_stat
      return otherStats.some(otherStat =>
        otherStat.stat.name === stat.stat.name && otherStat.base_stat !== baseStat
      )
    })
  }

  // Search Pokemon
  const handleSearch = async () => {
    const query = searchQuery.value.trim().toLowerCase()

    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (!query) {
      searchResults.value = []
      showSearchResults.value = false
      return
    }

    showSearchResults.value = true

    debounceTimer = setTimeout(async () => {
      try {
        // Fetch all Pokemon (use cache if available)
        let pokemonList: any[]
        if (!pokemonCache) {
          const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
          const data = await response.json()
          pokemonList = data.results
          pokemonCache = pokemonList
        } else {
          pokemonList = pokemonCache
        }

        // Filter results
        const matches = pokemonList
          .map((p: any) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0', 10)
            return { ...p, id, index: `${getPokemonGeneration(id)} • #${String(id).padStart(4, '0')}` }
          })
          .filter((p: any) => {
            const matchesName = p.name.includes(query)
            const matchesId = String(p.id).includes(query)
            return matchesName || matchesId
          })
          .slice(0, 10)

        // Fetch sprites
        const results = await Promise.all(
          matches.map(async (p: any) => {
            try {
              const detailResponse = await fetch(p.url)
              const detail = await detailResponse.json()
              return {
                id: p.id,
                name: p.name,
                sprite: detail.sprites?.other?.['official-artwork']?.front_default || detail.sprites?.front_default || '',
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

        searchResults.value = results
        if (results.length > 0) {
          lastSearchResult.value = results[0] as SearchResult
        }
      } catch (error) {
        console.error('Search error:', error)
        searchResults.value = []
      }
    }, 300)
  }

  // Add Pokemon to comparison
  const addPokemon = async (result: SearchResult) => {
    if (selectedPokemon.value.length >= 4) return
    if (selectedPokemon.value.some(p => p?.id === result.id)) return

    try {
      // Fetch full Pokemon data
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${result.id}`)
      const pokemonData = await response.json()

      // Calculate total stats
      const totalStats = pokemonData.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)

      const comparisonPokemon: ComparisonPokemon = {
        id: pokemonData.id,
        name: pokemonData.name,
        sprite: pokemonData.sprites?.other?.['official-artwork']?.front_default || pokemonData.sprites?.front_default,
        index: result.index || `${getPokemonGeneration(pokemonData.id)} • #${String(pokemonData.id).padStart(4, '0')}`,
        types: pokemonData.types,
        stats: pokemonData.stats,
        abilities: pokemonData.abilities,
        height: pokemonData.height,
        weight: pokemonData.weight,
        totalStats,
      }

      selectedPokemon.value.push(comparisonPokemon)

      // Reset search state completely
      searchQuery.value = ''
      searchResults.value = []
      lastSearchResult.value = null
      showSearchResults.value = false
    } catch (error) {
      console.error('Error fetching Pokemon details:', error)
    }
  }

  // Remove Pokemon from comparison
  const removePokemon = (index: number) => {
    selectedPokemon.value.splice(index, 1)
    // updateCompareParam() will be called by watcher
  }

  // Clear all Pokemon
  const clearAll = () => {
    selectedPokemon.value = []
    searchQuery.value = ''
    searchResults.value = []
    // updateCompareParam() will be called by watcher
  }

  // Close search results when clicking outside
  const handleBlur = () => {
    setTimeout(() => {
      showSearchResults.value = false
    }, 150)
  }

  // Initialize a search timer id
  let debounceTimer: ReturnType<typeof setTimeout> | null = null
</script>

<style scoped>
  /* Type styles now use the type store dynamically */
</style>