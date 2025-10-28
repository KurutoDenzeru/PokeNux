<template>
  <Card v-if="member.pokemonId" draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd"
    @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" :class="[
      'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm relative flex flex-col items-center transition-all transform hover:-translate-y-1 focus-within:scale-[1.01] cursor-move rounded-xl',
      isDragging && 'opacity-50 bg-zinc-100 dark:bg-zinc-800',
      isDragOverThis && 'ring-2 ring-emerald-400 scale-105 bg-emerald-50 dark:bg-emerald-950/20'
    ]">
    <!-- Pokemon Image -->
    <div class="w-24 h-24 flex items-center justify-center relative">
      <NuxtImg v-if="pokemonImage" :src="pokemonImage" :alt="member.pokemonName"
        class="h-auto w-auto object-contain absolute inset-0 m-auto" />
    </div>

    <!-- Pokemon ID and Name -->
    <div class="w-full flex flex-col items-center">
      <span class="text-sm font-mono text-zinc-400">#{{ String(member.pokemonId).padStart(4, '0') }}</span>
      <h3 class="capitalize font-semibold text-zinc-800 dark:text-zinc-100 text-base text-center mt-0.5">{{
        member.pokemonName }}</h3>
      <div class="flex flex-wrap justify-center gap-2 mt-2">
        <label v-for="type in types" :key="`${type}-${member.pokemonId}`" :class="getTypeClasses(type)"
          class="select-none px-1.5 py-0.5 rounded-md text-sm font-medium flex items-center gap-1 shrink-0 hover:scale-105 hover:text-white transition-all text-white border">
          <span class="text-sm leading-none">{{ getTypeEmoji(type) }}</span>
          <span class="capitalize text-sm">{{ type }}</span>
        </label>
      </div>
    </div>

    <!-- Remove Button (Hidden on hover) -->
    <Button size="sm" variant="ghost" @click="clearSlot" class="absolute top-2 right-2 h-8 w-8 p-0 opacity-80 hover:opacity-100 transition-opacity
    text-zinc-500 dark:text-zinc-300
    hover:bg-zinc-200 dark:hover:bg-zinc-700
    focus-visible:ring-2 focus-visible:ring-emerald-500">
      <X class="w-4 h-4" />
    </Button>

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

  <!-- Pokemon Search Dialog (for empty slots) -->
  <Dialog v-else v-model:open="pokemonSearchOpen">
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

        <!-- Loading State -->
        <div v-if="pokemonSearchLoading" class="flex flex-col gap-2">
          <div v-for="i in 5" :key="i" class="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>

        <!-- Results -->
        <div v-else-if="searchResults.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
          <div v-for="pokemon in searchResults" :key="pokemon.id" @click="selectPokemon(pokemon)"
            class="p-3 rounded-lg border cursor-pointer hover:bg-emerald-50 dark:hover:bg-zinc-800 transition-colors border-zinc-200 dark:border-zinc-700">
            <div class="flex items-center gap-3">
              <NuxtImg
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`"
                :alt="pokemon.name" class="w-12 h-12 object-contain" />
              <div class="flex-1">
                <p class="font-semibold capitalize text-zinc-900 dark:text-zinc-100"
                  v-html="highlightMatch(pokemon.name, pokemonSearch)"></p>
                <p class="text-xs text-zinc-600 dark:text-zinc-400">{{ pokemon.generation }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="pokemonSearch.trim()" class="text-center text-muted-foreground text-sm">
          No Pokémon found matching "{{ pokemonSearch }}"
        </div>
      </div>
    </DialogContent>
  </Dialog>
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

  // Drag and drop state
  const isDragging = ref(false)
  const isDragOverThis = ref(false)
  let dragSourceSlotIndex: number | null = null

  const pokemonSearchOpen = ref(false)
  const pokemonSearch = ref('')
  const searchResults = ref<any[]>([])
  const pokemonSearchLoading = ref(false)
  const types = ref<string[]>([])
  const pokemonImage = ref<string>('')
  let pokemonCache: any[] | null = null
  let searchTimeout: ReturnType<typeof setTimeout> | null = null

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

  // Get pokemon generation from ID
  const getPokemonGeneration = (id: number): string => {
    if (id <= 151) return 'Gen I - Kanto'
    if (id <= 251) return 'Gen II - Johto'
    if (id <= 386) return 'Gen III - Hoenn'
    if (id <= 493) return 'Gen IV - Sinnoh'
    if (id <= 649) return 'Gen V - Unova'
    if (id <= 721) return 'Gen VI - Kalos'
    if (id <= 809) return 'Gen VII - Alola'
    if (id <= 905) return 'Gen VIII - Galar'
    return 'Gen IX - Paldea'
  }

  // Search Pokemon with debouncing
  const searchPokemon = async () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const query = pokemonSearch.value.trim().toLowerCase()

    if (!query) {
      searchResults.value = []
      return
    }

    pokemonSearchLoading.value = true

    searchTimeout = setTimeout(async () => {
      try {
        // Fetch all Pokémon (use cache if available)
        let pokemonList: any[]
        if (!pokemonCache) {
          const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302')
          const data = await response.json()
          pokemonList = data.results
          pokemonCache = pokemonList
        } else {
          pokemonList = pokemonCache
        }

        // Filter results by name or ID
        const matches = pokemonList
          .map((p: any) => {
            const id = parseInt(p.url.split('/').filter(Boolean).pop() || '0', 10)
            return { ...p, id, index: `${getPokemonGeneration(id)} • #${String(id).padStart(4, '0')}` }
          })
          .filter((p: any) => {
            const matchesName = p.name.includes(query)
            const matchesId = String(p.id).includes(query) || p.index.includes(query)
            return matchesName || matchesId
          })
          .slice(0, 10) // Limit to 10 results

        // Fetch generation data for each result
        const resultsWithGen = await Promise.all(
          matches.map(async (pokemon: any) => {
            try {
              const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
              const speciesData = await speciesRes.json()
              const genNum = parseInt(speciesData.generation.url.split('/').filter((s: string) => s).pop())
              return {
                ...pokemon,
                generation: generationMap[genNum] || `Gen ${genNum}`
              }
            } catch (error) {
              return { ...pokemon, generation: getPokemonGeneration(pokemon.id) }
            }
          })
        )

        searchResults.value = resultsWithGen
      } catch (error) {
        console.error('Failed to search pokemon:', error)
      } finally {
        pokemonSearchLoading.value = false
      }
    }, 300)
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

  // Type emoji mapping
  const TYPE_EMOJI: Record<string, string> = {
    normal: '⭐',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄️',
    fighting: '🥊',
    poison: '🧪',
    ground: '🌍',
    flying: '🕊️',
    psychic: '🔮',
    bug: '🐛',
    rock: '🗿',
    dragon: '🐉',
    ghost: '👻',
    dark: '🌙',
    steel: '⚙️',
    fairy: '🧚'
  }

  // Get type emoji
  const getTypeEmoji = (type: string): string => {
    return TYPE_EMOJI[type] || '⭐'
  }

  // Type styling - light and dark mode support (like TypeFilter.vue)
  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400',
    fire: 'bg-orange-500 dark:bg-transparent dark:border-orange-500 dark:text-orange-500',
    water: 'bg-blue-500 dark:bg-transparent dark:border-blue-400 dark:text-blue-400',
    electric: 'bg-yellow-500 dark:bg-transparent dark:border-yellow-400 dark:text-yellow-400',
    grass: 'bg-green-500 dark:bg-transparent dark:border-green-500 dark:text-green-400',
    ice: 'bg-cyan-500 dark:bg-transparent dark:border-cyan-400 dark:text-cyan-400',
    fighting: 'bg-red-600 dark:bg-transparent dark:border-red-600 dark:text-red-500',
    poison: 'bg-purple-500 dark:bg-transparent dark:border-purple-500 dark:text-purple-400',
    ground: 'bg-amber-600 dark:bg-transparent dark:border-amber-600 dark:text-amber-500',
    flying: 'bg-indigo-400 dark:bg-transparent dark:border-indigo-400 dark:text-indigo-400',
    psychic: 'bg-pink-500 dark:bg-transparent dark:border-pink-500 dark:text-pink-400',
    bug: 'bg-lime-500 dark:bg-transparent dark:border-lime-500 dark:text-lime-400',
    rock: 'bg-stone-600 dark:bg-transparent dark:border-stone-500 dark:text-stone-400',
    dragon: 'bg-violet-600 dark:bg-transparent dark:border-violet-600 dark:text-violet-400',
    ghost: 'bg-purple-600 dark:bg-transparent dark:border-purple-600 dark:text-purple-400',
    dark: 'bg-zinc-700 dark:bg-transparent dark:border-zinc-600 dark:text-zinc-400',
    steel: 'bg-slate-500 dark:bg-transparent dark:border-slate-500 dark:text-slate-400',
    fairy: 'bg-pink-400 dark:bg-transparent dark:border-pink-400 dark:text-pink-400'
  }

  // Get type classes with light/dark mode support
  const getTypeClasses = (type: string): string => {
    return TYPE_CLASSES[type] || 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400'
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

  // Drag and drop handlers
  const handleDragStart = (event: DragEvent) => {
    isDragging.value = true
    dragSourceSlotIndex = props.slotIndex
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(props.slotIndex))
    }
  }

  const handleDragEnd = () => {
    isDragging.value = false
    isDragOverThis.value = false
    dragSourceSlotIndex = null
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
    isDragOverThis.value = true
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDragOverThis.value = false
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDragOverThis.value = false

    const data = event.dataTransfer?.getData('text/plain')
    if (!data) return

    const fromIndex = parseInt(data, 10)
    if (isNaN(fromIndex) || fromIndex === props.slotIndex) return

    // Reorder team members
    teamBuilderStore.reorderTeamMembers(props.teamId, fromIndex, props.slotIndex)
  }

  // Expose methods for parent component
  defineExpose({
    openPokemonSearch
  })
</script>
