<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div class="space-y-1.5">
          <CardTitle class="font-bold flex items-center gap-2">
            <Sparkles class="w-5 h-5 " />
            Trading Card Game Cards
          </CardTitle>
          <CardDescription>
            Browse all TCG cards featuring {{ pokemon?.name || 'this Pokémon' }}
          </CardDescription>
        </div>

        <!-- Language Selector -->
        <div class="flex items-center gap-2">
          <Label class="text-sm font-semibold whitespace-nowrap">Language:</Label>
          <Select v-model="selectedLanguage">
            <SelectTrigger class="w-[140px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="it">Italiano</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="ko">한국어</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardHeader>

    <CardContent class="space-y-6">
      <!-- Controls: Items per page selector -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <Label class="text-sm font-semibold whitespace-nowrap">Cards per page:</Label>
          <Select v-model="itemsPerPage">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
              <SelectItem value="96">96</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Total count display -->
        <div v-if="!isLoading && totalCards > 0" class="text-sm text-muted-foreground">
          Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, totalCards) }} of {{ totalCards }} cards
        </div>
      </div>

      <!-- Loading State: Spinner (appears first) -->
      <div v-if="isLoading && !showSkeleton" class="w-full flex flex-col items-center justify-center py-16 space-y-4">
        <ImageSkeleton />
        <p class="text-muted-foreground text-center">Loading TCG cards…</p>
      </div>

      <!-- Loading State: Skeleton (appears 500ms after spinner) -->
      <div v-if="isLoading && showSkeleton"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="i in Number(itemsPerPage)" :key="i" class="space-y-2">
          <div
            class="w-full aspect-[2.5/3.5] flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden">
            <img src="/card.webp" alt="card placeholder"
              class="w-full h-full object-contain opacity-60 animate-pulse" />
          </div>
          <div class="px-1">
            <Skeleton class="h-4 w-3/4 mx-auto bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>

      <!-- No Results -->
      <div v-if="!isLoading && cards.length === 0" class="w-full text-center py-16">
        <p class="text-lg text-muted-foreground">No TCG cards found for {{ pokemon?.name }}</p>
        <p class="text-sm text-muted-foreground mt-2">This Pokémon may not have any trading cards yet.</p>
      </div>

      <!-- Cards Grid -->
      <div v-if="!isLoading && cards.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <div v-for="card in cards" :key="card.id" class="group">
          <a :href="`/tcg/${card.id}`" target="_blank" rel="noopener noreferrer" class="block"
            @click="$event && onCardLinkClick($event, card.id)">
            <!-- Glare wrapper only around image to preserve aspect-ratio control on the inner element -->
            <GlareCard>
              <div
                class="relative w-full aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-sm overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300">
                <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
                  class="w-full h-full object-contain transition-transform duration-300"
                  loading="lazy" @error="(e) => handleImageError(e, card)" />
                <img v-else src="/card.webp" alt="card placeholder" class="w-full h-full object-contain opacity-80" />
              </div>
            </GlareCard>

            <!-- Card Name (outside GlareCard) -->
            <div class="mt-2 px-1">
              <p class="text-sm font-bold line-clamp-2 text-center group-hover:text-primary transition-colors">
                {{ card.name }}
              </p>
            </div>
          </a>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div v-if="!isLoading && totalPages > 1" class="flex flex-col items-center gap-4 pt-4">
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="goToPage(1)">
            «
          </Button>
          <Button variant="outline" size="sm" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
            ‹
          </Button>

          <div class="flex items-center gap-1">
            <template v-for="page in visiblePages" :key="page">
              <Button v-if="typeof page === 'number'" :variant="page === currentPage ? 'default' : 'outline'" size="sm"
                @click="goToPage(page)">
                {{ page }}
              </Button>
              <span v-else class="px-2">...</span>
            </template>
          </div>

          <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
            ›
          </Button>
          <Button variant="outline" size="sm" :disabled="currentPage === totalPages" @click="goToPage(totalPages)">
            »
          </Button>
        </div>

        <p class="text-sm text-muted-foreground">
          Page {{ currentPage }} of {{ totalPages }}
        </p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onBeforeUnmount } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
  import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import { Sparkles } from 'lucide-vue-next'
  import GlareCard from '@/components/ui/GlareCard.vue'

  interface TCGCard {
    id: string
    localId: string
    name: string
    image?: string
    category: string
    hp?: number
    types?: string[]
    rarity?: string
    set?: {
      id: string
      name: string
      logo?: string
      symbol?: string
      serie?: string
      cardCount?: {
        total: number
        official: number
      }
      releaseDate?: string
      tcgOnline?: string
    }
    illustrator?: string
    stage?: string
    evolveFrom?: string
    description?: string
    attacks?: Array<{
      name: string
      cost?: string[]
      damage?: number | string
      effect?: string
    }>
    abilities?: Array<{
      name: string
      type?: string
      effect?: string
    }>
    weaknesses?: Array<{
      type: string
      value: string
    }>
    resistances?: Array<{
      type: string
      value: string
    }>
    retreat?: number
    regulationMark?: string
    legal?: {
      standard?: boolean
      expanded?: boolean
      unlimited?: boolean
    }
    variants?: {
      normal?: boolean
      reverse?: boolean
      holo?: boolean
      firstEdition?: boolean
      wPromo?: boolean
    }
  }

  const props = defineProps<{
    pokemon: any
  }>()

  const router = useRouter()

  // State
  const cards = ref<TCGCard[]>([])
  const totalCards = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref('24')
  const selectedLanguage = ref('en')
  const isLoading = ref(false)
  const showSkeleton = ref(false)

  // Timers for loading states
  let spinnerTimer: ReturnType<typeof setTimeout> | null = null
  let skeletonTimer: ReturnType<typeof setTimeout> | null = null

  // Computed
  const totalPages = computed(() => Math.ceil(totalCards.value / Number(itemsPerPage.value)))
  const startIndex = computed(() => (currentPage.value - 1) * Number(itemsPerPage.value))
  const endIndex = computed(() => startIndex.value + Number(itemsPerPage.value))

  // Pagination visible pages logic
  const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages: (number | string)[] = []

    if (total <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (current > 3) {
        pages.push('...')
      }

      // Show pages around current
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < total - 2) {
        pages.push('...')
      }

      // Always show last page
      pages.push(total)
    }

    return pages
  })

  // Fetch TCG cards from tcgdex.dev API
  const fetchTCGCards = async () => {
    if (!props.pokemon?.name) return

    // Clear existing timers
    if (spinnerTimer) clearTimeout(spinnerTimer)
    if (skeletonTimer) clearTimeout(skeletonTimer)

    isLoading.value = true
    showSkeleton.value = false

    // Show spinner immediately, then skeleton after 500ms
    skeletonTimer = setTimeout(() => {
      if (isLoading.value) {
        showSkeleton.value = true
      }
      skeletonTimer = null
    }, 500)

    try {
      const pokemonName = props.pokemon.name.toLowerCase()
      const lang = selectedLanguage.value

      // Fetch all cards for this Pokemon with full details
      const allCardsResponse = await fetch(
        `https://api.tcgdex.net/v2/${lang}/cards?name=${pokemonName}`
      )

      if (!allCardsResponse.ok) {
        throw new Error('Failed to fetch TCG cards')
      }

      const allCards: TCGCard[] = await allCardsResponse.json()

      // Fetch complete details for each card to get set information
      const detailedCards = await Promise.all(
        allCards.map(async (card) => {
          try {
            const detailResponse = await fetch(`https://api.tcgdex.net/v2/${lang}/cards/${card.id}`)
            if (detailResponse.ok) {
              return await detailResponse.json()
            }
            return card
          } catch (error) {
            console.error(`Error fetching details for card ${card.id}:`, error)
            return card
          }
        })
      )

      totalCards.value = detailedCards.length

      // Apply client-side pagination
      const start = startIndex.value
      const end = endIndex.value
      cards.value = detailedCards.slice(start, end)

    } catch (error) {
      console.error('Error fetching TCG cards:', error)
      cards.value = []
      totalCards.value = 0
    } finally {
      // Clear timers
      if (spinnerTimer) {
        clearTimeout(spinnerTimer)
        spinnerTimer = null
      }
      if (skeletonTimer) {
        clearTimeout(skeletonTimer)
        skeletonTimer = null
      }
      isLoading.value = false
      showSkeleton.value = false
    }
  }

  // Navigate to page
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    // Scroll to top of cards section
    const element = document.querySelector('[data-tcg-cards]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Navigate to card detail page
  const navigateToCard = (cardId: string) => {
    router.push(`/tcg/${cardId}`)
  }

  // Allow opening card link in new tab while keeping SPA navigation for normal clicks
  const onCardLinkClick = (event: MouseEvent, cardId: string) => {
    // If user used modifier keys or middle click, let the browser handle it
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) {
      return
    }
    event.preventDefault()
    navigateToCard(cardId)
  }

  // Handle image load errors
  const handleImageError = (event: Event, card: TCGCard) => {
    const img = event.target as HTMLImageElement
    // Try fallback to regular quality
    if (img.src.includes('/high.webp')) {
      img.src = card.image || ''
    }
  }

  // Watch for changes
  watch(() => props.pokemon?.name, () => {
    currentPage.value = 1
    fetchTCGCards()
  }, { immediate: true })

  watch([currentPage, itemsPerPage, selectedLanguage], () => {
    fetchTCGCards()
  })

  // Cleanup on unmount
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
</script>
