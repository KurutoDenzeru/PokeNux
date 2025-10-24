<template>
  <div class="w-full mx-auto px-4 py-8 max-w-7xl">
    <!-- Brand heading: responsive, accessible gradient text -->
    <div class="w-full my-6">
      <div class="py-1 sm:py-2 lg:py-4">
        <a href="/" class="block text-center font-extrabold leading-tight tracking-tight
            text-7xl sm:text-8xl md:text-9xl lg:text-[5.5rem] xl:text-[6.5rem]
            bg-clip-text text-transparent
            bg-linear-to-r from-emerald-500 via-emerald-700 to-emerald-900
            dark:from-emerald-300 dark:via-emerald-500 dark:to-emerald-800">
          PokéNux
        </a>
      </div>
    </div>

    <!-- Search Bar (constrained width so internal w-full doesn't span entire page) -->
    <div class="w-full my-8 flex justify-center">
      <div class="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-2xl px-4">
        <PokemonSearch />
      </div>
    </div>

    <div class="w-full my-2">
      <Label class="w-full flex items-center justify-start text-lg sm:text-xl lg:text-2xl font-extrabold">Types:</Label>
    </div>

    <TypeFilter :types="TYPES" :order="TYPE_ORDER" v-model="selectedType" />

    <!-- Centered gradient divider: solid center, fading to both sides -->
    <div class="w-full my-8">
      <div class="relative flex items-center">
        <div class="flex-1 h-1 bg-linear-to-r from-transparent to-emerald-500 dark:to-emerald-600"></div>
        <div class="flex-1 h-1 bg-linear-to-l from-transparent to-emerald-500 dark:to-emerald-600"></div>
      </div>
    </div>

    <!-- Large selector label showing current range / total -->
    <div class="w-full my-4">
      <Label class="w-full flex items-center justify-start text-lg sm:text-xl lg:text-2xl font-extrabold">
        <span>Select your Pokémon:</span>
        <span v-if="itemsPerPage !== 'infinite'" class="text-lg sm:text-xl lg:text-2xl">
          <ClientOnly>
            <template #fallback>
              (<span class="font-extrabold">--</span> of <span class="font-extrabold">--</span>):
            </template>
            (<span class="font-extrabold">{{ showEnd }}</span> of <span class="font-extrabold">{{ totalCount }}</span>):
          </ClientOnly>
        </span>
        <span v-else class="text-lg sm:text-xl lg:text-2xl ml-2 text-blue-600 dark:text-blue-400">
          <ClientOnly>
            <template #fallback>
              (Infinite Scroll Mode)
            </template>
            (∞ Infinite Scroll)
          </ClientOnly>
        </span>
      </Label>
    </div>

    <!-- Generation + Sort: labels above their controls, both selects left-aligned -->
    <div class="w-full my-2 flex flex-col sm:flex-row sm:items-start sm:gap-8">
      <div class="flex flex-col items-start gap-2">
        <Label class="text-xs sm:text-sm lg:text-md font-extrabold">Game Generation:</Label>
        <GenerationFilter v-model="selectedGeneration" />
      </div>

      <div class="flex flex-col items-start gap-2 mt-3 sm:mt-0">
        <Label class="text-xs sm:text-sm lg:text-md font-extrabold">Sort Pokémon:</Label>
        <div class="flex items-center gap-2">
          <SortFilter v-model="selectedSort" />
          <FilterDialog v-model:items-per-page="itemsPerPage" />
          <ClearFiltersButton v-if="hasActiveFilters" @clear-filters="handleClearFilters" />
        </div>
      </div>
    </div>
    <!-- Use infinite scroll when itemsPerPage is 'infinite' -->
    <InfiniteScroll v-if="itemsPerPage === 'infinite'" :loaded-images="loadedImages"
      :selected-type="selectedType ?? undefined" :selected-generation="selectedGeneration ?? undefined"
      :selected-sort="selectedSort ?? undefined" :type-pokemon-list="typePokemonList ?? []"
      :generation-pokemon-list="generationPokemonList ?? []" />

    <!-- Regular paginated grid -->
    <template v-else>
      <!-- responsive grid: collapse further on smaller widths -->
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <template v-for="(slot, idx) in displaySlots" :key="idx">
          <!-- Improved skeleton loader with card structure -->
          <Card v-if="!slot" class="relative flex flex-col items-center animate-pulse">
            <CardHeader class="w-full flex flex-col items-center pb-0">
              <div class="w-24 h-24 flex items-center justify-center relative">
                <div class="w-20 h-20 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
              </div>
            </CardHeader>
            <CardContent class="w-full flex flex-col items-center p-0.5 pt-2 space-y-2">
              <div class="h-3 w-12 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              <div class="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
              <div class="flex gap-1 mt-1">
                <div class="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
                <div class="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-md"></div>
              </div>
            </CardContent>
          </Card>

          <Card v-else :aria-hidden="false"
            class="relative flex flex-col items-center transition-transform transform hover:-translate-y-1 focus-within:scale-[1.01] cursor-pointer"
            tabindex="0" @click="navigateToPokemon(slot.id)" @keyup.enter="navigateToPokemon(slot.id)">
            <CardHeader class="w-full flex flex-col items-center pb-0">
              <div class="w-24 h-24 flex items-center justify-center relative">
                <ImageSkeleton v-if="!isImageLoaded(slot)" />
                <img :src="getArtworkUrl(slot.url)" :alt="slot.name"
                  class="h-auto w-auto object-contain absolute inset-0 m-auto transition-opacity duration-200"
                  :class="{ 'opacity-0': !isImageLoaded(slot), 'opacity-100': isImageLoaded(slot) }" loading="lazy"
                  @load="() => markImageLoaded(slot)" @error="() => markImageLoaded(slot)" />
              </div>
            </CardHeader>
            <CardContent class="w-full flex flex-col items-center p-0.5 pt-0">
              <span class="text-xs font-mono text-zinc-400">{{ formatIndexForSlot(slot, idx) }}</span>
              <CardTitle class="capitalize font-semibold text-zinc-800 dark:text-zinc-100 text-base text-center">{{
                slot.name }}</CardTitle>
              <div class="flex flex-wrap gap-1 mt-1 justify-center sm:justify-center">
                <template v-for="(type, tIdx) in slot.types || []" :key="type.name + '-' + tIdx">
                  <Label
                    :class="['px-2 py-1 rounded-md text-white text-sm font-medium flex items-center gap-2 shrink-0', getTypeClass(type.name)]">
                    <span class="text-xs leading-none">{{ getTypeEmoji(type.name) }}</span>
                    <span class="capitalize text-xs">{{ type.name }}</span>
                  </Label>
                </template>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>
    </template>
    <!-- Pagination (hidden when using infinite scroll) -->
    <div v-if="itemsPerPage !== 'infinite'" class="relative w-full py-4">
      <ClientOnly>
        <template #fallback>
          <div
            class="w-full flex flex-wrap items-center sm:justify-end justify-center gap-2 mb-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
            <span class="whitespace-nowrap">Showing</span>
            <span class="font-semibold text-zinc-700 dark:text-zinc-200">--</span>
            <span class="whitespace-nowrap">to</span>
            <span class="font-semibold text-zinc-700 dark:text-zinc-200">--</span>
            <span class="whitespace-nowrap">of</span>
            <span class="font-semibold text-zinc-700 dark:text-zinc-200">--</span>
            <span class="whitespace-nowrap">Entries</span>
          </div>
        </template>
        <div
          class="w-full flex flex-wrap items-center sm:justify-end justify-center gap-2 mb-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span class="whitespace-nowrap">Showing</span>
          <span class="font-semibold text-zinc-700 dark:text-zinc-200">{{ showStart }}</span>
          <span class="whitespace-nowrap">to</span>
          <span class="font-semibold text-zinc-700 dark:text-zinc-200">{{ showEnd }}</span>
          <span class="whitespace-nowrap">of</span>
          <span class="font-semibold text-zinc-700 dark:text-zinc-200">{{ totalCount }}</span>
          <span class="whitespace-nowrap">Entries</span>
        </div>
        <PaginationControls :total="totalCount" :items-per-page="currentPageSize" v-model="page" />
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { TYPES } from '@/stores/types'
  import { getTypeClass } from '@/lib/type-classes'
  import { usePokemonGrid } from '@/composables/usePokemonGrid'
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useUserPreferencesStore } from '@/stores/userPreferences'
  import { fetchPokemonDetailsBatch, preloadImages } from '@/lib/pokeCache'

  // Components
  import Label from '@/components/ui/label/Label.vue'
  import TypeFilter from '@/components/pokemon/TypeFilter.vue'
  import SortFilter from '@/components/pokemon/SortFilter.vue'
  import FilterDialog from '@/components/pokemon/FilterDialog.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'
  import InfiniteScroll from '@/components/pokemon/InfiniteScrollNew.vue'
  import GenerationFilter from '@/components/pokemon/GenerationFilter.vue'
  import ClearFiltersButton from '@/components/pokemon/ClearFiltersButton.vue'
  import PaginationControls from '@/components/pokemon/PaginationControls.vue'
  import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

  const router = useRouter()

  const navigateToPokemon = (id: number) => {
    if (!id) return
    router.push(`/pokemon/${id}`)
  }

  // Initialize user preferences store
  const userPreferences = useUserPreferencesStore()

  // Ensure store is initialized from localStorage
  onMounted(() => {
    userPreferences.initializeFromStorage()
  })

  const page = ref(1)

  // Use store values directly - they're already reactive
  const itemsPerPage = computed({
    get: () => userPreferences.itemsPerPage,
    set: (value) => userPreferences.updateItemsPerPage(value)
  })

  const selectedType = computed({
    get: () => userPreferences.selectedType,
    set: (value) => userPreferences.updateSelectedType(value)
  })

  const selectedGeneration = computed({
    get: () => userPreferences.selectedGeneration,
    set: (value) => userPreferences.updateSelectedGeneration(value)
  })

  const selectedSort = computed({
    get: () => userPreferences.selectedSort,
    set: (value) => userPreferences.updateSelectedSort(value)
  })

  // Handle clear filters - reset everything to default including itemsPerPage to 24
  const handleClearFilters = () => {
    selectedType.value = null
    selectedGeneration.value = null
    selectedSort.value = null
    itemsPerPage.value = '24'
    page.value = 1

    // Update store to reset all preferences
    userPreferences.clearAllPreferences()
  }

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return selectedType.value !== null ||
      selectedGeneration.value !== null ||
      selectedSort.value !== null ||
      (itemsPerPage.value !== '24' && itemsPerPage.value !== 24)
  })

  // Computed page size for the composable
  const actualPageSize = computed(() => {
    if (itemsPerPage.value === 'infinite') return 100 // Use a large number for infinite scroll
    return Number(itemsPerPage.value) || 24
  })

  // base listing composable (used when no type filter is active)
  const { pokemons, count, isLoading, fetchPage } = usePokemonGrid(page, actualPageSize)

  // filters from FilterDialog
  const filters = ref<any>({
    experience: new Set<string>(),
    evolution: 'all',
    tags: new Set<string>(),
    colors: new Set<string>([]),
  })

  // order and keys for the filter buttons (match the provided snippet order)
  const TYPE_ORDER = [
    'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'ghost', 'dark', 'steel', 'fairy'
  ]

  // all types from PokeAPI
  const typeTotalCount = ref<number | null>(null)
  const typePokemonList = ref<Array<{ name: string; url: string }> | null>(null)
  const pageItems = ref<any[]>([])

  // generation filter lists (from PokeAPI generation endpoint)
  const generationTotalCount = ref<number | null>(null)
  const generationPokemonList = ref<Array<{ name: string; url: string }> | null>(null)

  const loadTypeList = async (typeName: string | null) => {
    typePokemonList.value = null
    typeTotalCount.value = null
    pageItems.value = []
    if (!typeName) return
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName.toLowerCase()}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.pokemon)) {
        typePokemonList.value = data.pokemon.map((p: any) => p.pokemon)
        typeTotalCount.value = typePokemonList.value ? typePokemonList.value.length : 0
        // reset to page 1 when new type selected
        page.value = 1
      }
    } catch (e) {
      // ignore
    }
  }

  const loadGenerationList = async (genKey: string | null) => {
    generationPokemonList.value = null
    generationTotalCount.value = null
    pageItems.value = []
    if (!genKey || genKey === 'all') return
    try {
      // map 'gen1' -> 1, etc.
      const genId = parseInt(String(genKey).replace(/^gen/, ''), 10)
      if (!genId || Number.isNaN(genId)) return
      const res = await fetch(`https://pokeapi.co/api/v2/generation/${genId}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.pokemon_species)) {
        generationPokemonList.value = data.pokemon_species.map((s: any) => {
          const idStr = String(s.url).split('/').filter(Boolean).pop()
          const idNum = idStr ? parseInt(idStr, 10) : NaN
          return { name: s.name, url: `https://pokeapi.co/api/v2/pokemon/${idNum}/`, id: idNum }
        }).sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
        generationTotalCount.value = generationPokemonList.value ? generationPokemonList.value.length : 0
        page.value = 1
      }
    } catch (e) {
      // ignore
    }
  }

  // watch selectedType and load the type list
  watch(selectedType, (v) => {
    if (!v) {
      typePokemonList.value = null
      typeTotalCount.value = null
      pageItems.value = []
      // ensure composable has the correct page loaded
      fetchPage(page.value)
      return
    }
    loadTypeList(v)
  }, { immediate: true })

  // watch selectedGeneration and load the generation list
  watch(selectedGeneration, (v) => {
    if (!v || v === 'all') {
      generationPokemonList.value = null
      generationTotalCount.value = null
      pageItems.value = []
      fetchPage(page.value)
      return
    }
    loadGenerationList(v)
  }, { immediate: true })

  // when page, type, or generation lists change, fetch details for the visible slice
  const PAGE_SIZE = computed(() => {
    if (itemsPerPage.value === 'infinite') return 24 // Default for infinite scroll initial load
    return Number(itemsPerPage.value) || 24
  })

  const currentPageSize = computed(() => Number(itemsPerPage.value) || 24)

  const fetchDetailsForList = async (list: Array<{ name: string; url: string }> | null) => {
    if (!list) return

    // create a shallow copy we can sort
    let working = [...list]
    if (selectedSort.value) {
      switch (selectedSort.value) {
        case 'asc-id':
          working.sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
          break
        case 'desc-id':
          working.sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
          break
        case 'az':
          working.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
          break
        case 'za':
          working.sort((a: any, b: any) => String(b.name).localeCompare(String(a.name)))
          break
      }
    }

    const start = (page.value - 1) * PAGE_SIZE.value
    const end = start + PAGE_SIZE.value
    const slice = working.slice(start, end)

    // Batch fetch with limited concurrency and caching
    const details = await fetchPokemonDetailsBatch(slice, 6)
    pageItems.value = details

    // Preload next page images for smoother UX
    const nextSlice = working.slice(end, end + PAGE_SIZE.value)
    const imageUrls = nextSlice.map(p => getArtworkUrl(p.url))
    preloadImages(imageUrls)
  }

  watch([page, typePokemonList, generationPokemonList, selectedType, selectedGeneration, itemsPerPage], async () => {
    // Determine active list:
    if (generationPokemonList.value || typePokemonList.value) {
      let activeList: Array<{ name: string; url: string }> | null = null
      if (generationPokemonList.value && typePokemonList.value) {
        const names = new Set(typePokemonList.value.map((p) => p.name))
        const intersect = generationPokemonList.value.filter((p) => names.has(p.name))
        activeList = intersect
      } else if (generationPokemonList.value) {
        activeList = generationPokemonList.value
      } else if (typePokemonList.value) {
        activeList = typePokemonList.value
      }

      await fetchDetailsForList(activeList)
    } else {
      // when no external filter, ensure we fetch the composable's page
      fetchPage(page.value)
    }
  }, { immediate: true })

  // Reset page when page size changes
  watch(itemsPerPage, () => {
    page.value = 1
  })

  const applyLocalFilters = (list: any[]) => {
    if (!list || !Array.isArray(list)) return []
    const out = list.filter((p: any) => !!p)
    if (filters.value.experience && filters.value.experience.size > 0) {
    }
    if (filters.value.evolution && filters.value.evolution !== 'all') {
    }
    return out
  }

  const filteredPokemons = computed(() => {
    const base = (generationPokemonList.value || typePokemonList.value) ? pageItems.value : pokemons.value
    return applyLocalFilters(base)
  })

  // Infinite scroll data management
  const infiniteScrollItems = ref<any[]>([])
  const infiniteScrollPage = ref(1)
  const infiniteScrollLoading = ref(false)
  const INFINITE_SCROLL_PAGE_SIZE = 24

  const fetchInfiniteScrollData = async (pageToFetch: number = 1) => {
    if (infiniteScrollLoading.value) return

    infiniteScrollLoading.value = true

    try {
      let activeList: Array<{ name: string; url: string }> | null = null

      if (generationPokemonList.value || typePokemonList.value) {
        // Use filtered lists
        if (generationPokemonList.value && typePokemonList.value) {
          const names = new Set(typePokemonList.value.map((p) => p.name))
          activeList = generationPokemonList.value.filter((p) => names.has(p.name))
        } else if (generationPokemonList.value) {
          activeList = generationPokemonList.value
        } else if (typePokemonList.value) {
          activeList = typePokemonList.value
        }

        if (activeList) {
          // Sort the list if needed
          let sortedList = [...activeList]
          if (selectedSort.value) {
            // For sorting, we need IDs, so let's fetch them first if not available
            const listWithIds = await Promise.all(sortedList.map(async (p) => {
              try {
                const idStr = String(p.url).split('/').filter(Boolean).pop()
                const id = idStr ? parseInt(idStr, 10) : NaN
                return { ...p, id }
              } catch (e) {
                return { ...p, id: 0 }
              }
            }))

            switch (selectedSort.value) {
              case 'asc-id':
                sortedList = listWithIds.sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
                break
              case 'desc-id':
                sortedList = listWithIds.sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
                break
              case 'az':
                sortedList = listWithIds.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
                break
              case 'za':
                sortedList = listWithIds.sort((a: any, b: any) => String(b.name).localeCompare(String(a.name)))
                break
            }
          }

          const start = (pageToFetch - 1) * INFINITE_SCROLL_PAGE_SIZE
          const end = start + INFINITE_SCROLL_PAGE_SIZE
          const slice = sortedList.slice(start, end)

          const details = await Promise.all(slice.map(async (p) => {
            try {
              const r = await fetch(p.url)
              if (!r.ok) return null
              const d = await r.json()
              const types = Array.isArray(d.types)
                ? d.types.map((t: any) => ({ name: t.type?.name ?? (t.name ?? '') }))
                : []
              return { name: p.name, url: p.url, id: d.id, types }
            } catch (e) {
              return null
            }
          }))

          const validDetails = details.filter(Boolean) as any[]

          if (pageToFetch === 1) {
            infiniteScrollItems.value = validDetails
          } else {
            infiniteScrollItems.value = [...infiniteScrollItems.value, ...validDetails]
          }
        }
      } else {
        // Use regular Pokemon API
        const offset = (pageToFetch - 1) * INFINITE_SCROLL_PAGE_SIZE
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${INFINITE_SCROLL_PAGE_SIZE}&offset=${offset}`)
        const data = await response.json()

        const details = await Promise.all(
          data.results.map(async (p: any) => {
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

        if (pageToFetch === 1) {
          infiniteScrollItems.value = details
        } else {
          infiniteScrollItems.value = [...infiniteScrollItems.value, ...details]
        }
      }
    } catch (error) {
      console.error('Error fetching infinite scroll data:', error)
    } finally {
      infiniteScrollLoading.value = false
    }
  }

  const handleLoadMore = () => {
    if (!infiniteScrollLoading.value) {
      infiniteScrollPage.value += 1
      fetchInfiniteScrollData(infiniteScrollPage.value)
    }
  }

  // Watch for changes that should reset infinite scroll
  watch([selectedType, selectedGeneration, selectedSort], () => {
    if (itemsPerPage.value === 'infinite') {
      infiniteScrollPage.value = 1
      infiniteScrollItems.value = []
      fetchInfiniteScrollData(1)
    }
  })

  // Watch for itemsPerPage changes
  watch(itemsPerPage, (newValue, oldValue) => {
    if (newValue === 'infinite') {
      // Switch to infinite scroll
      infiniteScrollPage.value = 1
      infiniteScrollItems.value = []
      fetchInfiniteScrollData(1)
    } else if (oldValue === 'infinite') {
      // Switch away from infinite scroll, reset to page 1
      page.value = 1
    }
  }, { immediate: true })

  const totalPages = computed(() => Math.max(1, Math.ceil((totalCount.value ?? 0) / PAGE_SIZE.value)))

  const totalCount = computed(() => {
    if (generationTotalCount.value != null) return generationTotalCount.value
    if (typeTotalCount.value != null) return typeTotalCount.value
    return count?.value ?? 0
  })
  const formatIndex = (idx: number) => `#${String((page.value - 1) * PAGE_SIZE.value + idx + 1).padStart(4, '0')}`

  const formatIndexForSlot = (slot: any, visibleIndex: number) => {
    if (slot && slot.id) return `#${String(slot.id).padStart(4, '0')}`
    return formatIndex(visibleIndex)
  }

  const showStart = computed(() => {
    // start is the first item index in the current page (placeholders count)
    const filled = displaySlots.value.filter(Boolean).length
    return filled > 0 ? (page.value - 1) * PAGE_SIZE.value + 1 : 0
  })

  const showEnd = computed(() => {
    const filled = displaySlots.value.filter(Boolean).length
    return filled > 0 ? (page.value - 1) * PAGE_SIZE.value + filled : 0
  })

  // responsive max buttons: 3 for mobile (<=640px), 5 otherwise
  const isMobile = ref(false)
  let mq: MediaQueryList | null = null
  const mediaChangeHandler = (e: MediaQueryListEvent | MediaQueryList) => {
    isMobile.value = !!(e.matches)
  }
  onMounted(() => {
    if (typeof window !== 'undefined') {
      mq = window.matchMedia('(max-width: 640px)')
      mediaChangeHandler(mq)
      mq.addEventListener?.('change', mediaChangeHandler)
      // fallback for older browsers
      mq.addListener?.(mediaChangeHandler as unknown as (e: MediaQueryListEvent) => void)
    }
  })
  onBeforeUnmount(() => {
    if (mq) {
      mq.removeEventListener?.('change', mediaChangeHandler)
      mq.removeListener?.(mediaChangeHandler as unknown as (e: MediaQueryListEvent) => void)
    }
  })

  // Always render PAGE_SIZE slots as placeholders or filled items
  const displaySlots = computed(() => {
    if (itemsPerPage.value === 'infinite') return [] // Infinite scroll handles its own display

    const out: any[] = []
    let source = (generationPokemonList.value || typePokemonList.value) ? pageItems.value : pokemons.value

    // Make a copy to avoid mutating original
    if (Array.isArray(source)) {
      source = [...source]
    }

    // Apply sorting
    if (selectedSort.value && Array.isArray(source)) {
      switch (selectedSort.value) {
        case 'asc-id':
          source.sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
          break
        case 'desc-id':
          source.sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
          break
        case 'az':
          source.sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
          break
        case 'za':
          source.sort((a: any, b: any) => String(b.name).localeCompare(String(a.name)))
          break
      }
    }

    for (let idx = 0; idx < PAGE_SIZE.value; idx++) {
      out.push(source[idx] ?? null)
    }
    return out
  })

  const getArtworkUrl = (url: string) => {
    // Extract pokemon id from url
    const id = url.split('/').filter(Boolean).pop()
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }

  const getTypeEmoji = (type: string) => {
    const t = TYPES[type as keyof typeof TYPES]
    return t ? t.emoji : ''
  }

  // image loading state map to avoid mutating API objects

  const loadedImages = reactive<Record<string, boolean>>({})

  const imageKey = (p: any) => {
    if (!p) return Math.random().toString(36).slice(2, 8)
    // prefer numeric id from url if available
    try {
      const parts = String(p.url || '').split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && /^[0-9]+$/.test(last)) return last
    } catch (e) {
      // ignore
    }
    return p?.name ?? p?.url ?? Math.random().toString(36).slice(2, 8)
  }
  const isImageLoaded = (p: any) => !!loadedImages[imageKey(p)]
  const markImageLoaded = (p: any) => {
    if (!p) return
    loadedImages[imageKey(p)] = true
  }
</script>
