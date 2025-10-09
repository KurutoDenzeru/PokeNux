<template>
  <div class="w-full min-h-screen bg-background">
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="$router.push('/')">
            ← Back
          </Button>
          <Select v-model="selectedVersion">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Game Version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="version in gameVersions" :key="version.value" :value="version.value">
                {{ version.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="flex items-center gap-4">
          <Input v-model="searchQuery" type="search" placeholder="Search Pokémon..." class="w-[200px] md:w-[300px]"
            @keyup.enter="handleSearch" />
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto px-4 py-8">
      <div class="flex items-center justify-center min-h-[400px]">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4">
          </div>
          <p class="text-muted-foreground">Loading Pokémon data...</p>
        </div>
      </div>
    </div>

    <!-- Main Content - Bento Box Layout with Flexbox -->
    <div v-else-if="pokemonData" class="container mx-auto px-4 py-8 max-w-7xl">

      <!-- Bento Box Layout: Dynamic Flexbox -->
      <div class="flex flex-col lg:flex-row gap-6 mt-8">
        <!-- Right Column: Sticky Artwork Panel (Mobile First) -->
        <div class="lg:w-80 lg:flex-shrink-0 flex flex-col gap-6 lg:order-2">
          <PokemonArtworkPanel :pokemon="pokemonData" :species="speciesData" :cry-latest="cryLatest"
            :cry-legacy="cryLegacy" v-model:is-shiny="isShiny" @prev="navigateToPokemon(pokemonData.id - 1)"
            @next="navigateToPokemon(pokemonData.id + 1)" />
        </div>

        <!-- Left Column: Info + Tables -->
        <div class="flex-1 flex flex-col gap-6 lg:order-1">
          <!-- Info Table -->
          <PokemonInfoTable :pokemon="pokemonData" :species="speciesData" />

          <!-- Two Tables in Flex Row (Breeding + Training) -->
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <PokemonBreedingTable :pokemon="pokemonData" :species="speciesData" />
            </div>
            <div class="flex-1">
              <PokemonTrainingTable :pokemon="pokemonData" :species="speciesData" />
            </div>
          </div>

          <!-- Forms & Base Stats in Flex Row -->
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="lg:w-1/3">
              <PokemonForms :pokemon="pokemonData" :species="speciesData" :is-shiny="isShiny" />
            </div>
            <div class="lg:w-2/3">
              <PokemonBaseStats :pokemon="pokemonData" />
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Sections -->
      <div class="flex flex-col gap-6 mt-8">
        <PokemonTypeRelations :pokemon="pokemonData" />
        <PokemonEvolutionChain :species="speciesData" :pokemon="pokemonData" :is-shiny="isShiny" />
        <PokemonMovePool :pokemon="pokemonData" :selected-version="selectedVersion" />
        <PokemonSprites :pokemon="pokemonData" :is-shiny="isShiny" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { usePokemonDetail } from '@/composables/usePokemonDetail'
  import Button from '@/components/ui/button/Button.vue'
  import Input from '@/components/ui/input/Input.vue'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

  // Lazy load heavy components
  const PokemonInfoTable = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonInfoTable.vue'))
  const PokemonArtworkPanel = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonArtworkPanel.vue'))
  const PokemonBreedingTable = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonBreedingTable.vue'))
  const PokemonTrainingTable = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonTrainingTable.vue'))
  const PokemonTypeRelations = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonTypeRelations.vue'))
  const PokemonForms = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonForms.vue'))
  const PokemonBaseStats = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonBaseStats.vue'))
  const PokemonEvolutionChain = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonEvolutionChain.vue'))
  const PokemonMovePool = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonMovePool.vue'))
  const PokemonSprites = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonSprites.vue'))

  const route = useRoute()
  const router = useRouter()

  const pokemonId = computed(() => {
    const id = route.params.id
    if (!id) return 1
    return typeof id === 'string' ? parseInt(id, 10) : Array.isArray(id) ? parseInt(id[0] || '1', 10) : 1
  })

  const {
    pokemonData,
    speciesData,
    isLoading,
    cryLatest,
    cryLegacy,
    fetchPokemonDetail
  } = usePokemonDetail(pokemonId)

  const isShiny = ref(false)
  const selectedVersion = ref('red-blue')
  const searchQuery = ref('')

  const gameVersions = ref([
    { label: 'Red/Blue', value: 'red-blue' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Gold/Silver', value: 'gold-silver' },
    { label: 'Crystal', value: 'crystal' },
    { label: 'Ruby/Sapphire', value: 'ruby-sapphire' },
    { label: 'Emerald', value: 'emerald' },
    { label: 'FireRed/LeafGreen', value: 'firered-leafgreen' },
    { label: 'Diamond/Pearl', value: 'diamond-pearl' },
    { label: 'Platinum', value: 'platinum' },
    { label: 'HeartGold/SoulSilver', value: 'heartgold-soulsilver' },
    { label: 'Black/White', value: 'black-white' },
    { label: 'Black 2/White 2', value: 'black-2-white-2' },
    { label: 'X/Y', value: 'x-y' },
    { label: 'Omega Ruby/Alpha Sapphire', value: 'omega-ruby-alpha-sapphire' },
    { label: 'Sun/Moon', value: 'sun-moon' },
    { label: 'Ultra Sun/Ultra Moon', value: 'ultra-sun-ultra-moon' },
    { label: 'Sword/Shield', value: 'sword-shield' },
    { label: 'Scarlet/Violet', value: 'scarlet-violet' },
  ])

  const navigateToPokemon = (id: number) => {
    if (id < 1 || id > 1025) return
    router.push(`/pokemon/${id}`)
  }

  const handleSearch = () => {
    if (!searchQuery.value.trim()) return
    const normalized = searchQuery.value.toLowerCase().trim()
    router.push(`/?search=${encodeURIComponent(normalized)}`)
  }

  // Fetch data when route changes
  watch(pokemonId, (newId) => {
    if (newId) {
      fetchPokemonDetail(newId)
    }
  }, { immediate: true })

  // SEO
  useHead(() => ({
    title: pokemonData.value ? `${pokemonData.value.name} | PokéHex` : 'PokéHex',
    meta: [
      { name: 'description', content: speciesData.value?.flavor_text_entries?.[0]?.flavor_text || 'Pokémon details' }
    ]
  }))
</script>
