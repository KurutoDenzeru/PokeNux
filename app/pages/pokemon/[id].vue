<template>
  <div class="w-full min-h-screen bg-background">
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="$router.push('/')">
            ← Back
          </Button>
        </div>
        <div class="flex-1 flex items-center gap-3">
          <div class="ml-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl">
            <PokemonSearch />
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading / Skeleton State -->
    <div v-if="isLoading" class="container mx-auto px-4 py-8">
      <!-- spinner + label centered (appears after spinnerDelay) -->
      <div v-if="showSpinner" class="w-full flex flex-col items-center justify-center mb-6 space-y-4">
        <div class="w-24 h-24">
          <ImageSkeleton />
        </div>
        <p class="text-muted-foreground text-center">Loading Pokémon data…</p>
      </div>

      <!-- Skeleton layout appears after skeletonDelay (once spinner has been visible for skeletonDelay) -->
      <div v-if="showSkeleton" class="flex flex-col lg:flex-row gap-6 mt-4">
        <!-- Artwork skeleton (right column) -->
        <div class="lg:w-80 lg:flex-shrink-0 flex flex-col gap-6 lg:order-2">
          <Skeleton class="w-full h-64 bg-zinc-200 dark:bg-zinc-700" />
          <div class="flex gap-3">
            <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>

        <!-- Left column skeletons -->
        <div class="flex-1 flex flex-col gap-6 lg:order-1">
          <Skeleton class="w-full h-32 bg-zinc-200 dark:bg-zinc-700" />

          <div class="flex flex-col md:flex-row gap-6">
            <Skeleton class="flex-1 h-40 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="flex-1 h-40 bg-zinc-200 dark:bg-zinc-700" />
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <Skeleton class="lg:w-1/3 h-36 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="lg:w-2/3 h-36 bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>

      <!-- Full width skeleton sections -->
      <div class="flex flex-col gap-6 mt-8">
        <Skeleton class="w-full h-36 bg-zinc-200 dark:bg-zinc-700" />
        <Skeleton class="w-full h-36 bg-zinc-200 dark:bg-zinc-700" />
        <Skeleton class="w-full h-36 bg-zinc-200 dark:bg-zinc-700" />
        <Skeleton class="w-full h-36 bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>

    <!-- Main Content - Bento Box Layout with Flexbox -->
    <div v-else-if="pokemonData" class="mx-auto px-4 py-8 max-w-7xl">

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
        <PokemonMovePool :pokemon="pokemonData" />
        <PokemonSprites :pokemon="pokemonData" :is-shiny="isShiny" />
        <PokemonTCGCards :pokemon="pokemonData" />
      </div>
    </div>
    <!-- Site footer (shared) - placed directly, footer provides its own padding -->
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { usePokemonDetail } from '@/composables/usePokemonDetail'
  import Button from '@/components/ui/button/Button.vue'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'
  import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import SiteFooter from '@/components/ui/SiteFooter.vue'

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
  const PokemonTCGCards = defineAsyncComponent(() => import('@/components/pokemon/detail/PokemonTCGCards.vue'))

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

  // Two-stage loading sequence:
  // 1) Wait `spinnerDelay` before showing spinner/text (avoid flicker for very fast loads)
  // 2) After spinner is visible, wait `skeletonDelay` before showing skeleton blocks
  const showSpinner = ref(false)
  const showSkeleton = ref(false)

  const spinnerDelay = 1000 // ms before showing spinner
  const skeletonDelay = 500 // ms after spinner shows before skeleton

  let spinnerTimer: ReturnType<typeof setTimeout> | null = null
  let skeletonTimer: ReturnType<typeof setTimeout> | null = null

  watch(isLoading, (loading) => {
    // clear any existing timers whenever loading state changes
    if (spinnerTimer) {
      clearTimeout(spinnerTimer)
      spinnerTimer = null
    }
    if (skeletonTimer) {
      clearTimeout(skeletonTimer)
      skeletonTimer = null
    }

    if (loading) {
      // show spinner immediately
      showSpinner.value = true
      showSkeleton.value = false
      // schedule skeleton after skeletonDelay
      if (skeletonTimer) clearTimeout(skeletonTimer)
      skeletonTimer = setTimeout(() => {
        showSkeleton.value = true
        skeletonTimer = null
      }, skeletonDelay)
    } else {
      // stop everything and hide both
      showSpinner.value = false
      showSkeleton.value = false
    }
  }, { immediate: true })

  onBeforeUnmount(() => {
    if (spinnerTimer) {
      clearTimeout(spinnerTimer)
      spinnerTimer = null
    }
    if (skeletonTimer) {
      clearTimeout(skeletonTimer)
      skeletonTimer = null
    }
  })

  const navigateToPokemon = (id: number) => {
    if (id < 1 || id > 1025) return
    router.push(`/pokemon/${id}`)
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
