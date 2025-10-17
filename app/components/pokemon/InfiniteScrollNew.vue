<template>
  <div class="w-full">
    <!-- Grid content -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <template v-for="(slot, idx) in displayItems" :key="`${slot?.name || 'empty'}-${idx}`">
        <Card v-if="slot" :aria-hidden="false"
          class="relative flex flex-col items-center transition-transform transform hover:-translate-y-1 focus-within:scale-[1.01]"
          tabindex="0">
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
            <span class="text-xs font-mono text-zinc-400">{{ formatIndex(slot, idx) }}</span>
            <CardTitle class="capitalize font-semibold text-zinc-800 dark:text-zinc-100 text-base text-center">
              {{ slot.name }}
            </CardTitle>
            <div class="flex flex-wrap gap-1 mt-1 justify-center sm:justify-center">
              <template v-for="(type, tIdx) in slot.types || []" :key="type.name + '-' + tIdx">
                <Label
                  :class="['px-2 py-1 rounded-md text-white text-sm font-medium flex items-center gap-2 flex-shrink-0']"
                  :style="{ background: (TYPES[type.name as keyof typeof TYPES]?.dark.bg) || (TYPES[type.name as keyof typeof TYPES]?.light.bg), color: '#ffffff', boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.08)' }">
                  <span class="text-xs leading-none">{{ getTypeEmoji(type.name) }}</span>
                  <span class="capitalize text-xs">{{ type.name }}</span>
                </Label>
              </template>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>

    <!-- Loading indicator for infinite scroll -->
    <div v-if="isLoadingMore && hasMoreItems" class="flex justify-center items-center py-8">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
        <span class="text-sm text-zinc-500">Loading more Pokémon...</span>
      </div>
    </div>

    <!-- End of results indicator -->
    <div v-if="!hasMoreItems && displayItems.length > 0" class="flex justify-center items-center py-8">
      <span class="text-sm text-zinc-500">You've reached the end! No more Pokémon to load.</span>
    </div>

    <!-- Intersection observer target -->
    <div ref="sentinelRef" class="h-1"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
  import { TYPES } from '@/stores/types'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import Label from '@/components/ui/label/Label.vue'
  import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'

  const props = defineProps({
    loadedImages: {
      type: Object,
      required: true
    },
    selectedType: {
      type: String,
      default: null
    },
    selectedGeneration: {
      type: String,
      default: null
    },
    selectedSort: {
      type: String,
      default: null
    },
    typePokemonList: {
      type: Array,
      default: () => []
    },
    generationPokemonList: {
      type: Array,
      default: () => []
    }
  })

  const sentinelRef = ref<HTMLElement>()
  const detailedItems = ref<any[]>([])
  const currentPage = ref(1)
  const isLoadingMore = ref(false)
  const hasMoreItems = ref(true)
  const ITEMS_PER_LOAD = 24

  // Use shared cached batched fetch helper
  import { fetchPokemonDetailsBatch, preloadImages } from '@/lib/pokeCache'

  const fetchPokemonDetails = async (pokemonList: any[], startIndex: number, count: number) => {
    const slice = pokemonList.slice(startIndex, startIndex + count)
    const details = await fetchPokemonDetailsBatch(slice, 6)

    // Preload images for the next batch
    const nextSlice = pokemonList.slice(startIndex + count, startIndex + count + count)
    preloadImages(nextSlice.map(p => getArtworkUrl(p.url)))

    return details
  }

  // Get the active list based on current filters
  const getActiveList = () => {
    if (props.generationPokemonList.length > 0 || props.typePokemonList.length > 0) {
      let activeList: Array<{ name: string; url: string }> = []

      if (props.generationPokemonList.length > 0 && props.typePokemonList.length > 0) {
        const names = new Set((props.typePokemonList as any[]).map((p: any) => p.name))
        activeList = (props.generationPokemonList as any[]).filter((p: any) => names.has(p.name))
      } else if (props.generationPokemonList.length > 0) {
        activeList = props.generationPokemonList as any[]
      } else if (props.typePokemonList.length > 0) {
        activeList = props.typePokemonList as any[]
      }

      // Apply sorting if needed
      if (props.selectedSort && activeList.length > 0) {
        const sortedList = [...activeList]

        // Add IDs for sorting if not present
        const listWithIds = sortedList.map((p: any) => {
          const idStr = String(p.url || '').split('/').filter(Boolean).pop()
          const id = idStr ? parseInt(idStr, 10) : 0
          return { ...p, id }
        })

        switch (props.selectedSort) {
          case 'asc-id':
            return listWithIds.sort((a: any, b: any) => (a.id || 0) - (b.id || 0))
          case 'desc-id':
            return listWithIds.sort((a: any, b: any) => (b.id || 0) - (a.id || 0))
          case 'az':
            return listWithIds.sort((a: any, b: any) => String(a.name || '').localeCompare(String(b.name || '')))
          case 'za':
            return listWithIds.sort((a: any, b: any) => String(b.name || '').localeCompare(String(a.name || '')))
        }
      }

      return activeList
    }

    return null
  }

  // Load more items
  const loadMore = async () => {
    if (isLoadingMore.value || !hasMoreItems.value) return

    isLoadingMore.value = true

    try {
      const activeList = getActiveList()

      if (activeList) {
        // Using filtered lists
        const startIndex = (currentPage.value - 1) * ITEMS_PER_LOAD
        const newItems = await fetchPokemonDetails(activeList, startIndex, ITEMS_PER_LOAD)

        if (newItems.length > 0) {
          detailedItems.value = [...detailedItems.value, ...newItems]
          currentPage.value += 1
        }

        // Check if we've reached the end
        if (startIndex + newItems.length >= activeList.length) {
          hasMoreItems.value = false
        }
      } else {
        // Using general Pokemon API
        const offset = (currentPage.value - 1) * ITEMS_PER_LOAD
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${ITEMS_PER_LOAD}&offset=${offset}`)
        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const newItems = await fetchPokemonDetails(data.results, 0, data.results.length)
          detailedItems.value = [...detailedItems.value, ...newItems]
          currentPage.value += 1

          // Check if we've reached the end (Pokemon API has ~1300 Pokemon)
          if (offset + data.results.length >= data.count) {
            hasMoreItems.value = false
          }
        } else {
          hasMoreItems.value = false
        }
      }
    } catch (error) {
      console.error('Error loading more items:', error)
    } finally {
      isLoadingMore.value = false
    }
  }

  // Reset and load initial data
  const resetAndLoad = async () => {
    detailedItems.value = []
    currentPage.value = 1
    hasMoreItems.value = true
    await loadMore()
  }

  // Watch for filter changes
  watch([() => props.selectedType, () => props.selectedGeneration, () => props.selectedSort, () => props.typePokemonList, () => props.generationPokemonList], () => {
    resetAndLoad()
  }, { immediate: true })

  const displayItems = computed(() => detailedItems.value)

  // Intersection Observer for infinite scroll
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (sentinelRef.value) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMoreItems.value && !isLoadingMore.value) {
            loadMore()
          }
        },
        {
          threshold: 0.1,
          rootMargin: '100px'
        }
      )
      observer.observe(sentinelRef.value)
    }
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  // Image loading functions
  const imageKey = (p: any) => {
    if (!p) return Math.random().toString(36).slice(2, 8)
    try {
      const parts = String(p.url || '').split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && /^[0-9]+$/.test(last)) return last
    } catch (e) {
      // ignore
    }
    return p?.name ?? p?.url ?? Math.random().toString(36).slice(2, 8)
  }

  const isImageLoaded = (p: any) => !!props.loadedImages[imageKey(p)]
  const markImageLoaded = (p: any) => {
    if (!p) return
    props.loadedImages[imageKey(p)] = true
  }

  const getArtworkUrl = (url: string) => {
    const id = url.split('/').filter(Boolean).pop()
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
  }

  const getTypeEmoji = (type: string) => {
    const t = TYPES[type as keyof typeof TYPES]
    return t ? t.emoji : ''
  }

  const formatIndex = (slot: any, visibleIndex: number) => {
    if (slot && slot.id) return `#${String(slot.id).padStart(4, '0')}`
    return `#${String(visibleIndex + 1).padStart(4, '0')}`
  }
</script>