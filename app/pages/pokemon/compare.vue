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
            <Button :variant="viewMode === 'full' ? 'emerald' : 'emerald-outline'" size="sm" @click="viewMode = 'full'"
              class="gap-2">
              <Eye class="w-4 h-4" />
              Full View
            </Button>
            <Button :variant="viewMode === 'difference' ? 'emerald' : 'emerald-outline'" size="sm"
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
                  <div class="text-sm text-muted-foreground">{{ result.index }}</div>
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
      <div v-if="selectedPokemon.length > 0" :class="getGridClasses() + ' gap-6'">
        <div v-for="(pokemon, index) in selectedPokemon" :key="index" class="flex flex-col">
          <Card class="h-full">
            <CardHeader class="relative pb-3">
              <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                  <CardTitle class="capitalize truncate text-lg">{{ pokemon?.name }}</CardTitle>
                  <p class="text-sm text-muted-foreground mt-1">{{ pokemon?.index }}</p>
                </div>
                <Button variant="ghost" size="sm" @click="removePokemon(index)" class="p-0 h-6 w-6 shrink-0">
                  <X class="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent class="space-y-4">
              <!-- Pokémon Sprite -->
              <div v-if="pokemon?.sprite" class="flex justify-center">
                <img
                  :src="pokemonShinyState[pokemon?.id || 0]
                    ? (pokemon.sprites?.other?.['official-artwork']?.front_shiny || pokemon.sprites?.front_shiny || pokemon.sprite)
                    : (pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default || pokemon.sprite)"
                  :alt="pokemon.name" class="w-32 h-32 object-contain" />
              </div>

              <!-- Type Badges - 50/50 layout -->
              <div v-if="pokemon?.types && pokemon.types.length > 0" class="flex gap-2 flex-wrap">
                <Badge v-for="type in pokemon.types" :key="type.type.name"
                  :class="[getTypeClass(type.type.name) + ' flex-1 px-3 py-1 text-white hover:text-white font-semibold justify-center', (viewMode === 'difference' && !areDifferentTypes(pokemon)) ? 'opacity-50' : '']">
                  <span class="mr-1">{{ getTypeEmoji(type.type.name) }}</span>
                  {{ capitalize(type.type.name) }}
                </Badge>
              </div>

              <!-- Normal/Shiny Toggle -->
              <div class="flex gap-2">
                <Button :variant="!pokemonShinyState[pokemon?.id || 0] ? 'emerald' : 'emerald-outline'" size="sm"
                  class="flex-1" @click="pokemonShinyState[pokemon?.id || 0] = false">
                  Normal
                </Button>
                <Button :variant="pokemonShinyState[pokemon?.id || 0] ? 'emerald' : 'emerald-outline'" size="sm"
                  class="flex-1" @click="pokemonShinyState[pokemon?.id || 0] = true">
                  ✨ Shiny
                </Button>
              </div>

              <!-- Cry Buttons -->
              <div v-if="pokemon?.cries" class="flex gap-2">
                <Button v-if="pokemon.cries.latest" variant="emerald-outline" size="sm"
                  class="flex-1 flex items-center justify-center gap-2" @click="playCry(pokemon.cries.latest)">
                  <Volume2 class="w-4 h-4" />
                  Latest
                </Button>
                <Button v-if="pokemon.cries.legacy" variant="emerald-outline" size="sm"
                  class="flex-1 flex items-center justify-center gap-2" @click="playCry(pokemon.cries.legacy)">
                  <Radio class="w-4 h-4" />
                  Legacy
                </Button>
              </div>

              <!-- Pokemon Information Table -->
              <div v-if="pokemon?.speciesData" class="space-y-3 border-t pt-3">
                <!-- Info Table Header with Icon -->
                <div class="flex items-center gap-2 mb-2">
                  <Info class="w-4 h-4" />
                  <h3 class="text-sm font-semibold">Pokémon Information:</h3>
                </div>
                <Table class="text-sm">
                  <TableBody>
                    <TableRow>
                      <TableCell class="font-semibold">Pokémon No.</TableCell>
                      <TableCell>#{{ String(pokemon.id).padStart(4, '0') }}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Introduced</TableCell>
                      <TableCell
                        :class="viewMode === 'difference' && !areDifferentAttribute(pokemon, 'generation', pokemon.speciesData?.generation?.name) ? 'opacity-50 text-muted-foreground' : ''">
                        {{ pokemon.speciesData?.generation?.name ?
                          formatGenerationFromAPI(pokemon.speciesData.generation.name) : 'Unknown' }}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Category</TableCell>
                      <TableCell
                        :class="viewMode === 'difference' && !areDifferentAttribute(pokemon, 'category', pokemon.speciesData?.genera?.find(g => g.language.name === 'en')?.genus) ? 'opacity-50 text-muted-foreground' : ''">
                        {{pokemon.speciesData?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Weight</TableCell>
                      <TableCell
                        :class="viewMode === 'difference' && !areDifferentAttribute(pokemon, 'weight', pokemon.weight) ? 'opacity-50 text-muted-foreground' : ''">
                        {{ (pokemon.weight / 10).toFixed(1) }} kg</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Height</TableCell>
                      <TableCell
                        :class="viewMode === 'difference' && !areDifferentAttribute(pokemon, 'height', pokemon.height) ? 'opacity-50 text-muted-foreground' : ''">
                        {{ (pokemon.height / 10).toFixed(1) }} m</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Shape</TableCell>
                      <TableCell
                        :class="['capitalize', viewMode === 'difference' && !areDifferentAttribute(pokemon, 'shape', pokemon.speciesData?.shape?.name) ? 'opacity-50 text-muted-foreground' : '']">
                        {{ pokemon.speciesData?.shape?.name || 'Unknown' }}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell class="font-semibold">Color</TableCell>
                      <TableCell
                        :class="['capitalize', viewMode === 'difference' && !areDifferentAttribute(pokemon, 'color', pokemon.speciesData?.color?.name) ? 'opacity-50 text-muted-foreground' : '']">
                        {{ pokemon.speciesData?.color?.name || 'Unknown' }}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <!-- Abilities -->
                <div v-if="pokemon.abilities && pokemon.abilities.length > 0" class="border-t pt-2">
                  <div class="flex items-center gap-2 mb-2">
                    <Zap class="w-4 h-4" />
                    <p class="text-sm font-semibold">Abilities:</p>
                  </div>
                  <div class="space-y-2 text-sm">
                    <div v-for="ability in pokemon.abilities" :key="ability.ability.name" class="flex flex-col">
                      <div class="flex items-center gap-2">
                        <span class="capitalize font-medium">{{ ability.ability.name.replace(/-/g, ' ') }}</span>
                        <Badge v-if="ability.is_hidden" variant="secondary" class="text-sm">Hidden</Badge>
                      </div>
                      <p v-if="pokemon.abilityDescriptions?.[ability.ability.name]"
                        class="text-sm text-muted-foreground mt-1 leading-snug">
                        {{ pokemon.abilityDescriptions[ability.ability.name] }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stats Section -->
              <div v-if="pokemon?.stats" class="space-y-3 border-t pt-3">
                <!-- Stats Header with Icon -->
                <div class="flex items-center gap-2 mb-2">
                  <BarChart3 class="w-4 h-4" />
                  <h3 class="text-sm font-semibold">Base Stats:</h3>
                </div>
                <!-- Full View: All Stats -->
                <div v-if="viewMode === 'full'" class="space-y-3">
                  <div v-for="stat in pokemon.stats" :key="stat.stat.name" class="space-y-1">
                    <div class="flex items-center justify-between text-sm md:text-sm">
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

                  <!-- All Stats -->
                  <div class="space-y-2">
                    <div v-for="stat in pokemon.stats" :key="stat.stat.name"
                      :class="['p-2 rounded border', getDifferentStats(pokemon).some(s => s.stat.name === stat.stat.name) ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800' : 'bg-zinc-100 dark:bg-zinc-800 opacity-50 border-zinc-200 dark:border-zinc-700']">
                      <div class="flex items-center justify-between text-sm md:text-sm">
                        <span class="font-medium">{{ getStatLabel(stat.stat.name) }}</span>
                        <span
                          :class="['font-bold', getDifferentStats(pokemon).some(s => s.stat.name === stat.stat.name) ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground']">{{
                            stat.base_stat }}</span>
                      </div>
                      <Progress :model-value="(stat.base_stat / 255) * 100" class="h-1.5 mt-1" />
                    </div>
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
  import { Search, X, Trash2, Diff, Eye, BarChart3, Plus, Volume2, Radio, Info, Zap, Heart } from 'lucide-vue-next'
  import Input from '@/components/ui/input/Input.vue'
  import Button from '@/components/ui/button/Button.vue'
  import Progress from '@/components/ui/progress/Progress.vue'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
  import BaseLayout from '@/layouts/BaseLayout.vue'
  import type { SEOConfig } from '@/utils/seo'
  import { useTypeStore, type PokemonName, TYPES } from '@/stores/types'
  import { getTypeClass as getTypeClassUtil } from '@/lib/type-classes'

  const typeStore = useTypeStore()
  const router = useRouter()
  const route = useRoute()

  // Types
  interface SpeciesData {
    id: number
    name: string
    generation: { name: string; url: string }
    color: { name: string; url: string }
    shape: { name: string; url: string }
    flavor_text_entries: Array<{
      flavor_text: string
      language: { name: string; url: string }
      version: { name: string; url: string }
    }>
    genera: Array<{
      genus: string
      language: { name: string; url: string }
    }>
  }

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
    speciesData?: SpeciesData | null
    cries?: { latest?: string; legacy?: string }
    sprites?: any
    abilityDescriptions?: Record<string, string>
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

  // Helper to get type class for styling
  const getTypeClass = (typeName: string) => {
    return getTypeClassUtil(typeName)
  }

  // Helper to capitalize string
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  // Helper to play cry sound
  const playCry = (url: string) => {
    if (typeof Audio !== 'undefined') {
      const audio = new Audio(url)
      audio.play().catch(e => console.error('Failed to play cry:', e))
    }
  }

  // State
  const viewMode = ref<'full' | 'difference'>('full')
  const searchQuery = ref('')
  const showSearchResults = ref(false)
  const searchResults = ref<SearchResult[]>([])
  const lastSearchResult = ref<SearchResult | null>(null)
  const selectedPokemon = ref<(ComparisonPokemon | null)[]>([])
  const pokemonShinyState = ref<Record<number, boolean>>({})

  // Helper: update ?compare=1,2,3&view=full/difference in URL (no reload)
  function updateCompareParam() {
    const ids = selectedPokemon.value.map(p => p?.id).filter(Boolean)
    router.replace({
      query: {
        ...route.query,
        compare: ids.length > 0 ? ids.join(',') : undefined,
        view: viewMode.value
      }
    })
  }

  // Watch for changes to selectedPokemon to update URL
  watch(selectedPokemon, updateCompareParam, { deep: true })

  // Watch for changes to viewMode to update URL
  watch(viewMode, updateCompareParam)

  // On mount: parse ?compare=... and ?view=... and pre-populate
  onMounted(async () => {
    // Restore view mode from URL query parameter
    const viewParam = route.query.view
    if (viewParam === 'full' || viewParam === 'difference') {
      viewMode.value = viewParam
    }

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

          // Fetch species data
          let speciesData: SpeciesData | null = null
          try {
            if (pokemonData.species?.url) {
              const speciesRes = await fetch(pokemonData.species.url)
              speciesData = await speciesRes.json()
            }
          } catch (e) {
            console.warn('Failed to fetch species data:', e)
          }

          // Fetch ability descriptions
          const abilityDescriptions: Record<string, string> = {}
          for (const ability of pokemonData.abilities) {
            try {
              const res = await fetch(ability.ability.url)
              if (res.ok) {
                const data = await res.json()
                const entry = data.effect_entries?.find((e: any) => e.language.name === 'en')
                if (entry) {
                  abilityDescriptions[ability.ability.name] = entry.short_effect || entry.effect
                }
              }
            } catch (e) {
              // ignore
            }
          }

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
            speciesData,
            cries: pokemonData.cries,
            sprites: pokemonData.sprites,
            abilityDescriptions,
          }
          selectedPokemon.value.push(comparisonPokemon)
          pokemonShinyState.value[pokemonData.id] = false
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

  // Roman numerals mapping
  const romanNumerals: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
  }

  const generationNames: Record<number, string> = {
    1: 'Kanto',
    2: 'Johto',
    3: 'Hoenn',
    4: 'Sinnoh',
    5: 'Unova',
    6: 'Kalos',
    7: 'Alola',
    8: 'Galar',
    9: 'Paldea',
  }

  // Get Pokemon generation by ID
  const getPokemonGeneration = (id: number): string => {
    let genNum = 1
    if (id <= 151) genNum = 1
    else if (id <= 251) genNum = 2
    else if (id <= 386) genNum = 3
    else if (id <= 493) genNum = 4
    else if (id <= 649) genNum = 5
    else if (id <= 721) genNum = 6
    else if (id <= 809) genNum = 7
    else if (id <= 905) genNum = 8
    else genNum = 9

    return `${romanNumerals[genNum]} - ${generationNames[genNum]}`
  }

  // Format generation name from API response (e.g., "generation-iii" -> "Gen - III - Hoenn")
  const formatGenerationFromAPI = (genName: string): string => {
    const match = genName.match(/generation-(\w+)/)
    if (!match || !match[1]) return 'Unknown'
    const firstChar = match[1].charAt(0)
    const genNum = parseInt(firstChar)
    if (!romanNumerals[genNum]) return 'Unknown'
    return `Gen - ${romanNumerals[genNum]} - ${generationNames[genNum]}`
  }

  // Get dynamic grid classes based on number of selected Pokemon
  const getGridClasses = (): string => {
    const count = selectedPokemon.value.length
    if (count === 1) return 'grid grid-cols-1'
    if (count === 2) return 'grid grid-cols-1 md:grid-cols-2'
    if (count === 3) return 'grid grid-cols-1 md:grid-cols-3'
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4' // 4 Pokemon
  }

  // Check if a type differs across Pokemon
  const areDifferentTypes = (pokemon: ComparisonPokemon): boolean => {
    if (selectedPokemon.value.length < 2) return true

    const currentTypes = pokemon.types.map(t => t.type.name).sort()
    return selectedPokemon.value.some(p => {
      if (!p || p.id === pokemon.id) return false
      const otherTypes = p.types.map(t => t.type.name).sort()
      return JSON.stringify(currentTypes) !== JSON.stringify(otherTypes)
    })
  }

  // Check if an attribute value differs across Pokemon
  const areDifferentAttribute = (pokemon: ComparisonPokemon, attrName: string, attrValue: any): boolean => {
    if (selectedPokemon.value.length < 2) return true

    return selectedPokemon.value.some(p => {
      if (!p || p.id === pokemon.id) return false
      let otherValue: any

      switch (attrName) {
        case 'height':
          otherValue = p.height
          break
        case 'weight':
          otherValue = p.weight
          break
        case 'shape':
          otherValue = p.speciesData?.shape?.name
          break
        case 'color':
          otherValue = p.speciesData?.color?.name
          break
        case 'category':
          otherValue = p.speciesData?.genera?.find(g => g.language.name === 'en')?.genus
          break
        case 'generation':
          otherValue = p.speciesData?.generation?.name
          break
        default:
          return false
      }

      return otherValue !== attrValue
    })
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

      // Fetch species data
      let speciesData: SpeciesData | null = null
      try {
        if (pokemonData.species?.url) {
          const speciesRes = await fetch(pokemonData.species.url)
          speciesData = await speciesRes.json()
        }
      } catch (e) {
        console.warn('Failed to fetch species data:', e)
      }

      // Fetch ability descriptions
      const abilityDescriptions: Record<string, string> = {}
      for (const ability of pokemonData.abilities) {
        try {
          const res = await fetch(ability.ability.url)
          if (res.ok) {
            const data = await res.json()
            const entry = data.effect_entries?.find((e: any) => e.language.name === 'en')
            if (entry) {
              abilityDescriptions[ability.ability.name] = entry.short_effect || entry.effect
            }
          }
        } catch (e) {
          // ignore
        }
      }

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
        speciesData,
        cries: pokemonData.cries,
        sprites: pokemonData.sprites,
        abilityDescriptions,
      }

      selectedPokemon.value.push(comparisonPokemon)
      pokemonShinyState.value[pokemonData.id] = false

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