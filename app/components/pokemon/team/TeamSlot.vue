<template>
  <Card class="overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
    <!-- Pokemon Header -->
    <div v-if="member.pokemonId" class="bg-linear-to-br from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900 p-4">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex-1">
          <p class="text-lg font-bold capitalize text-zinc-900 dark:text-zinc-100">{{ member.pokemonName }}</p>
        </div>
        <Button size="sm" variant="ghost" @click="clearSlot" class="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 h-8 w-8 p-0">
          <X class="w-4 h-4" />
        </Button>
      </div>

      <!-- Pokemon Image -->
      <div class="flex justify-center mb-2">
        <NuxtImg v-if="pokemonImage" :src="pokemonImage" :alt="member.pokemonName" class="w-20 h-20 object-contain" />
      </div>

      <!-- Types -->
      <div v-if="types.length" class="flex gap-2 justify-center flex-wrap">
        <div v-for="type in types" :key="`${type}-${member.pokemonId}`" :class="getTypeClasses(type)"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all">
          {{ type }}
        </div>
      </div>

      <!-- Footer Info -->
      <div class="mt-3 text-center text-xs text-zinc-600 dark:text-zinc-400">
        <p>#{{ member.pokemonId }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-6 text-center bg-linear-to-br from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900">
      <div class="text-zinc-600 dark:text-zinc-400 mb-3">
        <Zap class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">Slot {{ slotIndex + 1 }}</p>
      </div>
      <Button size="sm" @click="openPokemonSearch"
        class="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors duration-200">
        <Plus class="w-4 h-4" />
        Add Pokémon
      </Button>
    </div>

    <!-- Pokemon Search Dialog -->
    <Dialog v-model:open="pokemonSearchOpen">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <Circle class="w-5 h-5 fill-red-500 text-red-500" />
            Select Pokémon
          </DialogTitle>
          <DialogDescription>Search and select a Pokémon for this slot</DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <!-- Search Input -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input v-model="pokemonSearch" @input="searchPokemon" type="text" placeholder="Search Pokémon..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <!-- Results -->
          <div class="max-h-64 overflow-y-auto space-y-1">
            <!-- Loaded Results -->
            <button v-for="pokemon in searchResults" :key="pokemon.id" @click="selectPokemon(pokemon)"
              class="w-full flex items-center gap-3 p-2 rounded hover:bg-secondary transition-colors cursor-pointer">
              <img
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`"
                :alt="pokemon.name" class="w-10 h-10 object-contain" />
              <div class="text-left flex-1">
                <p class="font-medium capitalize" v-html="highlightMatch(pokemon.name, pokemonSearch)" />
                <p class="text-xs text-muted-foreground">{{ pokemon.generation }}</p>
              </div>
            </button>

            <!-- Loading Skeleton State -->
            <div v-if="pokemonSearchLoading" class="space-y-2">
              <div v-for="i in 5" :key="`skeleton-${i}`" class="flex items-center gap-3 p-2 rounded">
                <div class="w-10 h-10 bg-secondary rounded animate-pulse shrink-0" />
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-secondary rounded animate-pulse w-3/4" />
                  <div class="h-3 bg-secondary rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!pokemonSearchLoading && searchResults.length === 0 && pokemonSearch" class="text-center py-4">
              <p class="text-sm text-muted-foreground">No Pokémon found</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </Card>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { Card } from '../../ui/card'
  import { Badge } from '../../ui/badge'
  import { Button } from '../../ui/button'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../ui/dialog'
  import { useTeamBuilderStore, type TeamMember } from '../../../stores/teamBuilder'
  import { X, Zap, Search, Circle, Plus } from 'lucide-vue-next'

  interface Props {
    teamId: string
    slotIndex: number
    member: TeamMember
  }

  const props = defineProps<Props>()
  const teamBuilderStore = useTeamBuilderStore()

  const pokemonSearchOpen = ref(false)
  const pokemonSearch = ref('')
  const searchResults = ref<any[]>([])
  const pokemonSearchLoading = ref(false)
  const types = ref<string[]>([])
  const pokemonImage = ref<string>('')

  // Generation data mapping
  const generationMap: Record<number, string> = {
    1: 'Gen I - Kanto',
    2: 'Gen II - Johto',
    3: 'Gen III - Hoenn',
    4: 'Gen IV - Sinnoh',
    5: 'Gen V - Unova',
    6: 'Gen VI - Kalos',
    7: 'Gen VII - Alola',
    8: 'Gen VIII - Galar',
    9: 'Gen IX - Paldea'
  }

  // Search Pokemon
  const searchPokemon = async () => {
    if (!pokemonSearch.value.trim()) {
      searchResults.value = []
      return
    }

    pokemonSearchLoading.value = true
    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=2000`
      )
      const data = await response.json()
      const query = pokemonSearch.value.toLowerCase()
      const results = data.results
        .map((p: any) => ({
          name: p.name,
          id: parseInt(p.url.split('/').filter((s: string) => s).pop())
        }))
        .filter((p: any) => p.name.toLowerCase().includes(query))
        .slice(0, 10)

      // Fetch generation data for each result
      const resultsWithGen = await Promise.all(
        results.map(async (pokemon: any) => {
          try {
            const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
            const speciesData = await speciesRes.json()
            const genNum = parseInt(speciesData.generation.url.split('/').filter((s: string) => s).pop())
            return {
              ...pokemon,
              generation: generationMap[genNum] || `Gen ${genNum}`
            }
          } catch (error) {
            console.error(`Failed to fetch generation for ${pokemon.name}:`, error)
            return { ...pokemon, generation: 'Unknown' }
          }
        })
      )

      searchResults.value = resultsWithGen
    } catch (error) {
      console.error('Failed to search pokemon:', error)
    } finally {
      pokemonSearchLoading.value = false
    }
  }

  // Select Pokemon
  const selectPokemon = async (pokemon: any) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
      const data = await response.json()

      teamBuilderStore.updateTeamMember(props.teamId, props.slotIndex, {
        pokemonId: pokemon.id,
        pokemonName: pokemon.name
      })

      pokemonSearchOpen.value = false
      pokemonSearch.value = ''
    } catch (error) {
      console.error('Failed to select pokemon:', error)
    }
  }

  // Clear Slot
  const clearSlot = () => {
    teamBuilderStore.clearTeamMember(props.teamId, props.slotIndex)
  }

  // Open Pokemon Search
  const openPokemonSearch = () => {
    pokemonSearchOpen.value = true
    pokemonSearch.value = ''
    searchResults.value = []
  }

  // Load pokemon data
  const loadPokemonData = async () => {
    if (props.member.pokemonId) {
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${props.member.pokemonId}`
        )
        const data = await response.json()
        types.value = data.types.map((t: any) => t.type.name)
        pokemonImage.value = data.sprites?.other?.['official-artwork']?.front_default || ''
      } catch (error) {
        console.error('Failed to load pokemon data:', error)
      }
    }
  }

  watch(() => props.member.pokemonId, loadPokemonData, { immediate: true })

  // Type styling - light and dark mode support (like TypeFilter.vue)
  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-slate-400 dark:bg-transparent dark:border dark:border-slate-500 dark:text-slate-400',
    fire: 'bg-orange-500 dark:bg-transparent dark:border dark:border-orange-500 dark:text-orange-500',
    water: 'bg-blue-500 dark:bg-transparent dark:border dark:border-blue-500 dark:text-blue-400',
    electric: 'bg-yellow-500 dark:bg-transparent dark:border dark:border-yellow-500 dark:text-yellow-400',
    grass: 'bg-green-500 dark:bg-transparent dark:border dark:border-green-500 dark:text-green-400',
    ice: 'bg-cyan-500 dark:bg-transparent dark:border dark:border-cyan-500 dark:text-cyan-400',
    fighting: 'bg-red-600 dark:bg-transparent dark:border dark:border-red-600 dark:text-red-500',
    poison: 'bg-purple-500 dark:bg-transparent dark:border dark:border-purple-500 dark:text-purple-400',
    ground: 'bg-amber-600 dark:bg-transparent dark:border dark:border-amber-600 dark:text-amber-500',
    flying: 'bg-indigo-400 dark:bg-transparent dark:border dark:border-indigo-400 dark:text-indigo-400',
    psychic: 'bg-pink-500 dark:bg-transparent dark:border dark:border-pink-500 dark:text-pink-400',
    bug: 'bg-lime-500 dark:bg-transparent dark:border dark:border-lime-500 dark:text-lime-400',
    rock: 'bg-stone-600 dark:bg-transparent dark:border dark:border-stone-500 dark:text-stone-400',
    dragon: 'bg-violet-600 dark:bg-transparent dark:border dark:border-violet-600 dark:text-violet-400',
    ghost: 'bg-purple-600 dark:bg-transparent dark:border dark:border-purple-600 dark:text-purple-400',
    dark: 'bg-zinc-700 dark:bg-transparent dark:border dark:border-zinc-600 dark:text-zinc-400',
    steel: 'bg-slate-500 dark:bg-transparent dark:border dark:border-slate-500 dark:text-slate-400',
    fairy: 'bg-pink-400 dark:bg-transparent dark:border dark:border-pink-400 dark:text-pink-400'
  }

  // Get type classes with light/dark mode support
  const getTypeClasses = (type: string): string => {
    return TYPE_CLASSES[type] || 'bg-slate-400 dark:bg-transparent dark:border dark:border-slate-400 dark:text-slate-400'
  }

  // Helper to get type color (legacy support)
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      normal: 'bg-gray-400',
      fire: 'bg-red-500',
      water: 'bg-blue-500',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-cyan-400',
      fighting: 'bg-red-700',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-400',
      psychic: 'bg-pink-500',
      bug: 'bg-lime-500',
      rock: 'bg-amber-600',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-600',
      dark: 'bg-gray-800',
      steel: 'bg-slate-400',
      fairy: 'bg-pink-400'
    }
    return colors[type] || 'bg-gray-500'
  }

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string): string => {
    if (!query.trim()) return text
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<span class="bg-yellow-200 dark:bg-yellow-600 px-0.5 rounded">$1</span>')
  }
</script>
