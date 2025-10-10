<template>
  <Card class="w-full">
    <CardHeader>
      <div class="flex items-center justify-between">
        <div class="space-y-1.5">
          <CardTitle class="text-2xl font-bold flex items-center gap-2">
            <Sparkles class="w-7 h-7 text-emerald-500" />
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
          <div class="w-full aspect-[2.5/3.5] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
            <ImageSkeleton />
          </div>
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
      <DialogContent class="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <DialogTitle class="text-3xl font-bold">{{ selectedCard?.name }}</DialogTitle>
              <DialogDescription v-if="selectedCard?.set" class="text-base">
                {{ selectedCard.set.name }} • Card #{{ selectedCard.localId }}
              </DialogDescription>
            </div>
            <div v-if="selectedCard?.set?.symbol" class="flex-shrink-0">
              <img :src="selectedCard.set.symbol" :alt="`${selectedCard.set.name} symbol`"
                class="w-12 h-12 object-contain" />
            </div>
          </div>
        </DialogHeader>

        <div v-if="selectedCard" class="space-y-6 mt-4">
          <!-- Main Content Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Left Column: Card Details -->
            <div class="space-y-6">
              <!-- HP and Types Header -->
              <div v-if="selectedCard.category === 'Pokemon'" class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-muted-foreground">HP</span>
                  <span class="text-3xl font-bold">{{ selectedCard.hp }}</span>
                </div>
                <div v-if="selectedCard.types && selectedCard.types.length > 0" class="flex gap-2">
                  <Badge v-for="type in selectedCard.types" :key="type" variant="secondary" class="text-lg px-3 py-1">
                    {{ type }}
                  </Badge>
                </div>
              </div>

              <!-- Attacks Table -->
              <div v-if="selectedCard.attacks && selectedCard.attacks.length > 0" class="space-y-3">
                <div v-for="(attack, idx) in selectedCard.attacks" :key="idx" class="border rounded-lg p-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div v-if="attack.cost && attack.cost.length > 0" class="flex gap-1">
                        <Badge v-for="(cost, cidx) in attack.cost" :key="cidx" variant="outline" class="text-xs">
                          {{ cost }}
                        </Badge>
                      </div>
                      <span class="font-bold text-lg">{{ attack.name }}</span>
                    </div>
                    <span v-if="attack.damage" class="text-2xl font-bold">{{ attack.damage }}</span>
                  </div>
                  <p v-if="attack.effect" class="text-sm text-muted-foreground">{{ attack.effect }}</p>
                </div>
              </div>

              <!-- Abilities -->
              <div v-if="selectedCard.abilities && selectedCard.abilities.length > 0" class="space-y-3">
                <h3 class="text-lg font-semibold">Abilities</h3>
                <div v-for="(ability, idx) in selectedCard.abilities" :key="idx"
                  class="border rounded-lg p-4 space-y-2">
                  <div class="font-bold">{{ ability.name }}</div>
                  <p v-if="ability.effect" class="text-sm text-muted-foreground">{{ ability.effect }}</p>
                </div>
              </div>

              <!-- Weakness, Resistance, Retreat -->
              <div class="grid grid-cols-3 gap-4">
                <!-- Weakness -->
                <div>
                  <h4 class="text-sm font-semibold mb-2">Weakness</h4>
                  <div v-if="selectedCard.weaknesses && selectedCard.weaknesses.length > 0" class="space-y-1">
                    <div v-for="(weak, idx) in selectedCard.weaknesses" :key="idx" class="flex items-center gap-2">
                      <Badge variant="destructive" class="text-xs">{{ weak.type }}</Badge>
                      <span class="text-sm font-semibold">{{ weak.value }}</span>
                    </div>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">N/A</span>
                </div>

                <!-- Resistance -->
                <div>
                  <h4 class="text-sm font-semibold mb-2">Resistance</h4>
                  <div v-if="selectedCard.resistances && selectedCard.resistances.length > 0" class="space-y-1">
                    <div v-for="(res, idx) in selectedCard.resistances" :key="idx" class="flex items-center gap-2">
                      <Badge variant="secondary" class="text-xs">{{ res.type }}</Badge>
                      <span class="text-sm font-semibold">{{ res.value }}</span>
                    </div>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">N/A</span>
                </div>

                <!-- Retreat Cost -->
                <div>
                  <h4 class="text-sm font-semibold mb-2">Retreat Cost</h4>
                  <div v-if="selectedCard.retreat !== undefined && selectedCard.retreat !== null">
                    <div v-if="selectedCard.retreat === 0" class="text-sm text-muted-foreground">Free</div>
                    <div v-else class="flex gap-1">
                      <Badge v-for="i in selectedCard.retreat" :key="i" variant="outline"
                        class="w-6 h-6 p-0 flex items-center justify-center">⚪</Badge>
                    </div>
                  </div>
                  <span v-else class="text-sm text-muted-foreground">N/A</span>
                </div>
              </div>

              <!-- Description -->
              <div v-if="selectedCard.description" class="border-t pt-4">
                <p class="text-sm italic text-muted-foreground">{{ selectedCard.description }}</p>
              </div>
            </div>

            <!-- Right Column: Card Image -->
            <div class="flex flex-col gap-4">
              <div
                class="w-full aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden shadow-2xl">
                <img v-if="selectedCard.image" :src="`${selectedCard.image}/high.webp`" :alt="selectedCard.name"
                  class="w-full h-full object-contain p-4" />
              </div>
            </div>
          </div>

          <!-- Bottom Sections Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <!-- Legal Formats -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Legal Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="flex flex-wrap gap-2">
                  <Badge v-if="selectedCard.legal?.standard" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    Standard
                  </Badge>
                  <Badge v-else variant="destructive" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    Standard
                  </Badge>

                  <Badge v-if="selectedCard.legal?.expanded" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    Expanded
                  </Badge>
                  <Badge v-else variant="destructive" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    Expanded
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <!-- Variants -->
            <Card>
              <CardHeader>
                <CardTitle class="text-lg">Variants</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="flex flex-wrap gap-2">
                  <Badge v-if="selectedCard.variants?.normal" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    Normal
                  </Badge>
                  <Badge v-else variant="outline" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    Normal
                  </Badge>

                  <Badge v-if="selectedCard.variants?.holo" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    Holofoil
                  </Badge>
                  <Badge v-else variant="outline" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    Holofoil
                  </Badge>

                  <Badge v-if="selectedCard.variants?.reverse" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    Reverse Holo
                  </Badge>
                  <Badge v-else variant="outline" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    Reverse Holo
                  </Badge>

                  <Badge v-if="selectedCard.variants?.firstEdition" variant="default" class="flex items-center gap-1">
                    <Check class="w-3 h-3" />
                    First Edition
                  </Badge>
                  <Badge v-else variant="outline" class="flex items-center gap-1">
                    <X class="w-3 h-3" />
                    First Edition
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Card Details Table -->
          <Card>
            <CardHeader>
              <CardTitle class="text-lg">Card Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Number:</span>
                  <span>{{ selectedCard.localId }}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Category:</span>
                  <span>{{ selectedCard.category }}</span>
                </div>
                <div v-if="selectedCard.rarity" class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Rarity:</span>
                  <span>{{ selectedCard.rarity }}</span>
                </div>
                <div v-if="selectedCard.stage" class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Stage:</span>
                  <span>{{ selectedCard.stage }}</span>
                </div>
                <div v-if="selectedCard.evolveFrom" class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Evolves From:</span>
                  <span>{{ selectedCard.evolveFrom }}</span>
                </div>
                <div v-if="selectedCard.illustrator" class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Illustrator:</span>
                  <span>{{ selectedCard.illustrator }}</span>
                </div>
                <div v-if="selectedCard.regulationMark" class="flex justify-between border-b pb-2">
                  <span class="font-semibold">Regulation Mark:</span>
                  <span>{{ selectedCard.regulationMark }}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Set Information -->
          <Card v-if="selectedCard.set">
            <CardHeader>
              <div class="flex items-center gap-4">
                <img v-if="selectedCard.set.logo" :src="selectedCard.set.logo" :alt="`${selectedCard.set.name} logo`"
                  class="h-12 object-contain" />
                <CardTitle class="text-lg">Set: {{ selectedCard.set.name }}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex justify-between">
                  <span class="font-semibold">Set ID:</span>
                  <span>{{ selectedCard.set.id }}</span>
                </div>
                <div v-if="selectedCard.set.symbol" class="flex justify-between items-center">
                  <span class="font-semibold">Symbol:</span>
                  <img :src="selectedCard.set.symbol" :alt="`${selectedCard.set.name} symbol`"
                    class="h-6 object-contain" />
                </div>
              </div>
            </CardContent>
          </Card>
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
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import { Sparkles, Check, X } from 'lucide-vue-next'

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
    variants?: {
      normal?: boolean
      reverse?: boolean
      holo?: boolean
      firstEdition?: boolean
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
  const selectedLanguage = ref('en')
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
      const lang = selectedLanguage.value

      // First, fetch all cards for this Pokemon (without pagination to get total count)
      const allCardsResponse = await fetch(
        `https://api.tcgdex.net/v2/${lang}/cards?name=${pokemonName}`
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
