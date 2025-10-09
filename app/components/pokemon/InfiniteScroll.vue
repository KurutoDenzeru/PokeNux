<template>
  <div class="w-full">
    <!-- Grid content -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <template v-for="(slot, idx) in displayItems" :key="`${(slot as any)?.name || 'empty'}-${idx}`">
        <Card v-if="slot" :aria-hidden="false"
          class="relative flex flex-col items-center transition-transform transform hover:-translate-y-1 focus-within:scale-[1.01]"
          tabindex="0">
          <CardHeader class="w-full flex flex-col items-center pb-0">
            <div class="w-24 h-24 flex items-center justify-center relative">
              <ImageSkeleton v-if="!isImageLoaded(slot)" />
              <img :src="getArtworkUrl((slot as any).url)" :alt="(slot as any).name"
                class="h-auto w-auto object-contain absolute inset-0 m-auto transition-opacity duration-200"
                :class="{ 'opacity-0': !isImageLoaded(slot), 'opacity-100': isImageLoaded(slot) }" loading="lazy"
                @load="() => markImageLoaded(slot)" @error="() => markImageLoaded(slot)" />
            </div>
          </CardHeader>
          <CardContent class="w-full flex flex-col items-center p-0.5 pt-0">
            <span class="text-xs font-mono text-zinc-400">{{ formatIndex(slot, idx) }}</span>
            <CardTitle class="capitalize font-semibold text-zinc-800 dark:text-zinc-100 text-base text-center">
              {{ (slot as any).name }}
            </CardTitle>
            <div class="flex flex-wrap gap-1 mt-1 justify-center sm:justify-center">
              <template v-for="(type, tIdx) in (slot as any).types || []" :key="type.name + '-' + tIdx">
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
    <div v-if="isLoading && hasMoreItems" class="flex justify-center items-center py-8">
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
    // Provide allItems for pagination and progressive loading
    allItems: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    loadedImages: {
      type: Object,
      required: true
    },
    // Add props for filtering
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

  const emit = defineEmits(['loadMore'])

  const sentinelRef = ref<HTMLElement>()
  const loadedItemsCount = ref(24) // Start with 24 items
  const ITEMS_PER_LOAD = 24
  const detailedItems = ref<any[]>([]) // Store fetched detailed items

  const displayItems = computed(() => {
    return detailedItems.value.slice(0, loadedItemsCount.value)
  })

  const hasMoreItems = computed(() => {
    return loadedItemsCount.value < props.allItems.length
  })

  // Fetch details for Pokemon items
  const fetchDetails = async (items: any[]) => {
    const details = await Promise.all(items.map(async (item: any) => {
      try {
        // If item already has details, return it
        if (item.types) return item

        const response = await fetch(item.url)
        if (!response.ok) return null

        const data = await response.json()
        const types = Array.isArray(data.types)
          ? data.types.map((t: any) => ({ name: t.type?.name ?? (t.name ?? '') }))
          : []

        return {
          name: item.name,
          url: item.url,
          id: data.id,
          types
        }
      } catch (error) {
        console.error('Error fetching Pokemon details:', error)
        return null
      }
    }))

    return details.filter(Boolean)
  }

  // Intersection Observer for infinite scroll
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (sentinelRef.value) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasMoreItems.value && !props.isLoading) {
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

  const loadMore = async () => {
    if (hasMoreItems.value && !props.isLoading) {
      const nextBatch = props.allItems.slice(detailedItems.value.length, detailedItems.value.length + ITEMS_PER_LOAD)
      const newDetails = await fetchDetails(nextBatch)
      detailedItems.value.push(...newDetails)
      loadedItemsCount.value += ITEMS_PER_LOAD
      emit('loadMore')
    }
  }

  // Initial load and watch for allItems changes
  watch(() => props.allItems, async (newItems) => {
    if (newItems.length > 0) {
      detailedItems.value = []
      loadedItemsCount.value = Math.min(24, newItems.length)
      const initialBatch = newItems.slice(0, 24)
      const initialDetails = await fetchDetails(initialBatch)
      detailedItems.value = initialDetails
    }
  }, { immediate: true })

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