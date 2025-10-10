<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="text-2xl font-bold flex items-center gap-2">
        <span class="text-3xl">🎴</span>
        Trading Card Game Cards
      </CardTitle>
      <CardDescription>
        Browse all TCG cards featuring {{ pokemon?.name || 'this Pokémon' }}
      </CardDescription>
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

      <!-- Loading State: Spinner (appears after 500ms) -->
      <div v-if="isLoading && !showSkeleton" class="w-full flex flex-col items-center justify-center py-16 space-y-4">
        <div
          class="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin dark:border-emerald-400 dark:border-t-transparent">
        </div>
        <p class="text-muted-foreground text-center">Loading TCG cards…</p>
      </div>

      <!-- Loading State: Skeleton (appears 500ms after spinner) -->
      <div v-if="isLoading && showSkeleton" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card v-for="i in Number(itemsPerPage)" :key="i" class="overflow-hidden">
          <Skeleton class="w-full aspect-[2.5/3.5] bg-zinc-200 dark:bg-zinc-700" />
          <CardContent class="p-4 space-y-2">
            <Skeleton class="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-700" />
          </CardContent>
        </Card>
      </div>

      <!-- No Results -->
      <div v-if="!isLoading && cards.length === 0" class="w-full text-center py-16">
        <p class="text-lg text-muted-foreground">No TCG cards found for {{ pokemon?.name }}</p>
        <p class="text-sm text-muted-foreground mt-2">This Pokémon may not have any trading cards yet.</p>
      </div>

      <!-- Cards Grid -->
      <div v-if="!isLoading && cards.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card v-for="card in cards" :key="card.id"
          class="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          @click="selectedCard = card">
          <!-- Card Image -->
          <div
            class="relative w-full aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
            <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
              class="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              loading="lazy" @error="(e) => handleImageError(e, card)" />
            <div v-else class="w-full h-full flex items-center justify-center text-4xl">🎴</div>

            <!-- Rarity Badge -->
            <div v-if="card.rarity"
              class="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold bg-black/70 text-white backdrop-blur-sm">
              {{ card.rarity }}
            </div>
          </div>

          <!-- Card Info -->
          <CardContent class="p-4 space-y-2">
            <CardTitle class="text-base font-bold line-clamp-1">{{ card.name }}</CardTitle>

            <div class="flex items-center justify-between text-sm text-muted-foreground">
              <span class="font-mono">#{{ card.localId }}</span>
              <span v-if="card.hp" class="font-semibold">HP {{ card.hp }}</span>
            </div>

            <div v-if="card.set" class="text-xs text-muted-foreground line-clamp-1">
              {{ card.set.name }}
            </div>

            <!-- Types -->
            <div v-if="card.types && card.types.length > 0" class="flex flex-wrap gap-1">
              <Badge v-for="type in card.types" :key="type" variant="secondary" class="text-xs">
                {{ type }}
              </Badge>
            </div>
          </CardContent>
        </Card>
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

    <!-- Card Detail Dialog -->
    <Dialog v-model:open="showCardDetail">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="text-2xl">{{ selectedCard?.name }}</DialogTitle>
          <DialogDescription v-if="selectedCard?.set">
            {{ selectedCard.set.name }} • #{{ selectedCard.localId }}
          </DialogDescription>
        </DialogHeader>

        <div v-if="selectedCard" class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <!-- Left: Card Image -->
          <div class="flex flex-col gap-4">
            <div
              class="w-full aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden">
              <img v-if="selectedCard.image" :src="`${selectedCard.image}/high.webp`" :alt="selectedCard.name"
                class="w-full h-full object-contain p-4" />
            </div>
          </div>

          <!-- Right: Card Details -->
          <div class="space-y-4">
            <!-- Basic Info -->
            <div class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Card Information</h3>
              <div class="grid grid-cols-2 gap-2 text-sm">
                <div class="font-semibold">Category:</div>
                <div>{{ selectedCard.category }}</div>

                <template v-if="selectedCard.hp">
                  <div class="font-semibold">HP:</div>
                  <div>{{ selectedCard.hp }}</div>
                </template>

                <template v-if="selectedCard.rarity">
                  <div class="font-semibold">Rarity:</div>
                  <div>{{ selectedCard.rarity }}</div>
                </template>

                <template v-if="selectedCard.illustrator">
                  <div class="font-semibold">Artist:</div>
                  <div>{{ selectedCard.illustrator }}</div>
                </template>

                <template v-if="selectedCard.stage">
                  <div class="font-semibold">Stage:</div>
                  <div>{{ selectedCard.stage }}</div>
                </template>

                <template v-if="selectedCard.evolveFrom">
                  <div class="font-semibold">Evolves From:</div>
                  <div>{{ selectedCard.evolveFrom }}</div>
                </template>

                <template v-if="selectedCard.regulationMark">
                  <div class="font-semibold">Regulation:</div>
                  <div>{{ selectedCard.regulationMark }}</div>
                </template>
              </div>
            </div>

            <!-- Types -->
            <div v-if="selectedCard.types && selectedCard.types.length > 0" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Types</h3>
              <div class="flex flex-wrap gap-2">
                <Badge v-for="type in selectedCard.types" :key="type" variant="secondary">
                  {{ type }}
                </Badge>
              </div>
            </div>

            <!-- Description -->
            <div v-if="selectedCard.description" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Description</h3>
              <p class="text-sm italic">{{ selectedCard.description }}</p>
            </div>

            <!-- Attacks -->
            <div v-if="selectedCard.attacks && selectedCard.attacks.length > 0" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Attacks</h3>
              <div class="space-y-3">
                <div v-for="(attack, idx) in selectedCard.attacks" :key="idx" class="p-3 bg-muted rounded-lg space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold">{{ attack.name }}</span>
                    <span v-if="attack.damage" class="font-bold text-lg">{{ attack.damage }}</span>
                  </div>
                  <div v-if="attack.cost && attack.cost.length > 0" class="flex gap-1">
                    <Badge v-for="(cost, cidx) in attack.cost" :key="cidx" variant="outline" class="text-xs">
                      {{ cost }}
                    </Badge>
                  </div>
                  <p v-if="attack.effect" class="text-sm text-muted-foreground">{{ attack.effect }}</p>
                </div>
              </div>
            </div>

            <!-- Abilities -->
            <div v-if="selectedCard.abilities && selectedCard.abilities.length > 0" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Abilities</h3>
              <div class="space-y-3">
                <div v-for="(ability, idx) in selectedCard.abilities" :key="idx" class="p-3 bg-muted rounded-lg">
                  <div class="font-semibold">{{ ability.name }}</div>
                  <p v-if="ability.effect" class="text-sm text-muted-foreground">{{ ability.effect }}</p>
                </div>
              </div>
            </div>

            <!-- Weaknesses & Resistances -->
            <div
              v-if="(selectedCard.weaknesses && selectedCard.weaknesses.length > 0) || (selectedCard.resistances && selectedCard.resistances.length > 0)"
              class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Weaknesses & Resistances</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div v-if="selectedCard.weaknesses && selectedCard.weaknesses.length > 0">
                  <div class="font-semibold mb-1">Weakness:</div>
                  <div v-for="(weak, idx) in selectedCard.weaknesses" :key="idx" class="flex items-center gap-2">
                    <Badge variant="destructive">{{ weak.type }}</Badge>
                    <span>{{ weak.value }}</span>
                  </div>
                </div>
                <div v-if="selectedCard.resistances && selectedCard.resistances.length > 0">
                  <div class="font-semibold mb-1">Resistance:</div>
                  <div v-for="(res, idx) in selectedCard.resistances" :key="idx" class="flex items-center gap-2">
                    <Badge variant="secondary">{{ res.type }}</Badge>
                    <span>{{ res.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Retreat Cost -->
            <div v-if="selectedCard.retreat !== undefined && selectedCard.retreat !== null" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Retreat Cost</h3>
              <div class="flex gap-1">
                <Badge v-for="i in selectedCard.retreat" :key="i" variant="outline">⚪</Badge>
              </div>
            </div>

            <!-- Legal Formats -->
            <div v-if="selectedCard.legal" class="space-y-2">
              <h3 class="text-lg font-semibold border-b pb-2">Legal Formats</h3>
              <div class="flex gap-2 text-sm">
                <Badge v-if="selectedCard.legal.standard" variant="default">Standard</Badge>
                <Badge v-if="selectedCard.legal.expanded" variant="secondary">Expanded</Badge>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onBeforeUnmount } from 'vue'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Label } from '@/components/ui/label'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
  import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

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
    }
    illustrator?: string
    stage?: string
    evolveFrom?: string
    description?: string
    attacks?: Array<{
      name: string
      cost?: string[]
      damage?: number
      effect?: string
    }>
    abilities?: Array<{
      name: string
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
    }
  }

  const props = defineProps<{
    pokemon: any
  }>()

  // State
  const cards = ref<TCGCard[]>([])
  const totalCards = ref(0)
  const currentPage = ref(1)
  const itemsPerPage = ref('24')
  const isLoading = ref(false)
  const showSkeleton = ref(false)
  const selectedCard = ref<TCGCard | null>(null)
  const showCardDetail = computed({
    get: () => !!selectedCard.value,
    set: (val) => {
      if (!val) selectedCard.value = null
    }
  })

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

    // Show spinner after 500ms
    spinnerTimer = setTimeout(() => {
      if (isLoading.value) {
        // Spinner is implicitly shown when isLoading is true and showSkeleton is false
        // Now schedule skeleton
        skeletonTimer = setTimeout(() => {
          if (isLoading.value) {
            showSkeleton.value = true
          }
          skeletonTimer = null
        }, 500)
      }
      spinnerTimer = null
    }, 500)

    try {
      const pokemonName = props.pokemon.name.toLowerCase()

      // First, fetch all cards for this Pokemon (without pagination to get total count)
      const allCardsResponse = await fetch(
        `https://api.tcgdex.net/v2/en/cards?name=${pokemonName}`
      )

      if (!allCardsResponse.ok) {
        throw new Error('Failed to fetch TCG cards')
      }

      const allCards: TCGCard[] = await allCardsResponse.json()
      totalCards.value = allCards.length

      // Now apply client-side pagination
      const start = startIndex.value
      const end = endIndex.value
      cards.value = allCards.slice(start, end)

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

  watch([currentPage, itemsPerPage], () => {
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
