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
            class="w-full aspect-[2.5/3.5] flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg">
            <ImageSkeleton />
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
        <div v-for="card in cards" :key="card.id"
          class="group cursor-pointer transition-all duration-300 hover:-translate-y-2" @click="selectedCard = card">
          <!-- Card Image -->
          <div
            class="relative w-full aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300">
            <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
              class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy" @error="(e) => handleImageError(e, card)" />
            <div v-else class="w-full h-full flex items-center justify-center text-5xl opacity-30">🎴</div>

            <!-- Rarity Badge -->
            <div v-if="card.rarity"
              class="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-black/80 text-white backdrop-blur-sm">
              {{ card.rarity }}
            </div>
          </div>

          <!-- Card Name -->
          <div class="mt-2 px-1">
            <p class="text-sm font-bold line-clamp-2 text-center group-hover:text-primary transition-colors">
              {{ card.name }}
            </p>
          </div>
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

    <!-- Card Detail Dialog -->
    <Dialog v-model:open="showCardDetail">
      <DialogContent class="max-w-[95vw] sm:max-w-[90vw] lg:max-w-6xl max-h-[95vh] p-0 flex flex-col overflow-hidden">
        <DialogHeader class="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b flex-shrink-0">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <DialogTitle class="text-xl sm:text-2xl lg:text-3xl font-bold">{{ selectedCard?.name }}</DialogTitle>
              <DialogDescription v-if="selectedCard?.set" class="text-sm sm:text-base">
                {{ selectedCard.set.name }} • Card #{{ selectedCard.localId }}
              </DialogDescription>
            </div>
            <div v-if="selectedCard?.set?.symbol" class="flex-shrink-0">
              <img :src="selectedCard.set.symbol" :alt="`${selectedCard.set.name} symbol`"
                class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain" />
            </div>
          </div>
        </DialogHeader>

        <ScrollArea class="flex-1 overflow-auto">
          <div v-if="selectedCard" class="px-4 sm:px-6 py-4 sm:py-6 space-y-6">
            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <!-- Left Column: Card Image -->
              <div class="flex flex-col gap-4 lg:order-1">
                <div
                  class="w-full max-w-sm mx-auto lg:max-w-none aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden shadow-2xl">
                  <img v-if="selectedCard.image" :src="`${selectedCard.image}/high.webp`" :alt="selectedCard.name"
                    class="w-full h-full object-contain" />
                </div>
              </div>

              <!-- Right Column: Card Details -->
              <div class="space-y-6 lg:col-span-2 lg:order-2">
                <!-- HP and Types Header -->
                <div v-if="selectedCard.category === 'Pokemon'"
                  class="flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-muted-foreground">HP</span>
                    <span class="text-2xl sm:text-3xl font-bold">{{ selectedCard.hp }}</span>
                  </div>
                  <div v-if="selectedCard.types && selectedCard.types.length > 0" class="flex gap-2">
                    <Badge v-for="type in selectedCard.types" :key="type" variant="secondary"
                      class="text-base sm:text-lg px-3 py-1">
                      {{ type }}
                    </Badge>
                  </div>
                </div>

                <!-- Attacks Table -->
                <div v-if="selectedCard.attacks && selectedCard.attacks.length > 0" class="space-y-3">
                  <h3 class="text-base sm:text-lg font-semibold">Attacks</h3>
                  <div v-for="(attack, idx) in selectedCard.attacks" :key="idx"
                    class="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                      <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div v-if="attack.cost && attack.cost.length > 0" class="flex gap-1">
                          <Badge v-for="(cost, cidx) in attack.cost" :key="cidx" variant="outline"
                            class="text-xs sm:text-sm">
                            {{ cost }}
                          </Badge>
                        </div>
                        <span class="font-bold text-base sm:text-lg">{{ attack.name }}</span>
                      </div>
                      <span v-if="attack.damage" class="text-xl sm:text-2xl font-bold">{{ attack.damage }}</span>
                    </div>
                    <p v-if="attack.effect" class="text-xs sm:text-sm text-muted-foreground">{{ attack.effect }}</p>
                  </div>
                </div>

                <!-- Abilities -->
                <div v-if="selectedCard.abilities && selectedCard.abilities.length > 0" class="space-y-3">
                  <h3 class="text-base sm:text-lg font-semibold">Abilities</h3>
                  <div v-for="(ability, idx) in selectedCard.abilities" :key="idx"
                    class="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div class="font-bold text-sm sm:text-base">{{ ability.name }}</div>
                    <p v-if="ability.effect" class="text-xs sm:text-sm text-muted-foreground">{{ ability.effect }}</p>
                  </div>
                </div>

                <!-- Weakness, Resistance, Retreat -->
                <div class="grid grid-cols-3 gap-3 sm:gap-4">
                  <!-- Weakness -->
                  <div>
                    <h4 class="text-xs sm:text-sm font-semibold mb-2">Weakness</h4>
                    <div v-if="selectedCard.weaknesses && selectedCard.weaknesses.length > 0" class="space-y-1">
                      <div v-for="(weak, idx) in selectedCard.weaknesses" :key="idx"
                        class="flex items-center gap-1 sm:gap-2">
                        <Badge variant="destructive" class="text-xs">{{ weak.type }}</Badge>
                        <span class="text-xs sm:text-sm font-semibold">{{ weak.value }}</span>
                      </div>
                    </div>
                    <span v-else class="text-xs sm:text-sm text-muted-foreground">N/A</span>
                  </div>

                  <!-- Resistance -->
                  <div>
                    <h4 class="text-xs sm:text-sm font-semibold mb-2">Resistance</h4>
                    <div v-if="selectedCard.resistances && selectedCard.resistances.length > 0" class="space-y-1">
                      <div v-for="(res, idx) in selectedCard.resistances" :key="idx"
                        class="flex items-center gap-1 sm:gap-2">
                        <Badge variant="secondary" class="text-xs">{{ res.type }}</Badge>
                        <span class="text-xs sm:text-sm font-semibold">{{ res.value }}</span>
                      </div>
                    </div>
                    <span v-else class="text-xs sm:text-sm text-muted-foreground">N/A</span>
                  </div>

                  <!-- Retreat Cost -->
                  <div>
                    <h4 class="text-xs sm:text-sm font-semibold mb-2">Retreat Cost</h4>
                    <div v-if="selectedCard.retreat !== undefined && selectedCard.retreat !== null">
                      <div v-if="selectedCard.retreat === 0" class="text-xs sm:text-sm text-muted-foreground">Free</div>
                      <div v-else class="flex gap-1 flex-wrap">
                        <Badge v-for="i in selectedCard.retreat" :key="i" variant="outline"
                          class="w-5 h-5 sm:w-6 sm:h-6 p-0 flex items-center justify-center text-xs">⚪</Badge>
                      </div>
                    </div>
                    <span v-else class="text-xs sm:text-sm text-muted-foreground">N/A</span>
                  </div>
                </div>

                <!-- Description -->
                <div v-if="selectedCard.description" class="border-t pt-4">
                  <p class="text-xs sm:text-sm italic text-muted-foreground">{{ selectedCard.description }}</p>
                </div>
              </div>
            </div>

            <!-- Bottom Sections Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-6 border-t">
              <!-- Legal Formats -->
              <Card>
                <CardHeader>
                  <CardTitle class="text-base sm:text-lg">Legal Formats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="flex flex-wrap gap-2">
                    <Badge v-if="selectedCard.legal?.standard" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Standard
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Standard
                    </Badge>

                    <Badge v-if="selectedCard.legal?.expanded" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Expanded
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Expanded
                    </Badge>

                    <Badge v-if="selectedCard.legal?.unlimited" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Unlimited
                    </Badge>
                    <Badge v-else-if="selectedCard.legal && 'unlimited' in selectedCard.legal" variant="destructive"
                      class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Unlimited
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <!-- Variants -->
              <Card>
                <CardHeader>
                  <CardTitle class="text-base sm:text-lg">Variants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="flex flex-wrap gap-2">
                    <Badge v-if="selectedCard.variants?.normal" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Normal
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Normal
                    </Badge>

                    <Badge v-if="selectedCard.variants?.holo" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Holofoil
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Holofoil
                    </Badge>

                    <Badge v-if="selectedCard.variants?.reverse" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      Reverse Holo
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      Reverse Holo
                    </Badge>

                    <Badge v-if="selectedCard.variants?.firstEdition" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      First Edition
                    </Badge>
                    <Badge v-else variant="destructive" class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      First Edition
                    </Badge>

                    <Badge v-if="selectedCard.variants?.wPromo" variant="default"
                      class="flex items-center gap-1 text-xs sm:text-sm bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                      <Check class="w-3 h-3" />
                      W Promo
                    </Badge>
                    <Badge v-else-if="selectedCard.variants && 'wPromo' in selectedCard.variants" variant="destructive"
                      class="flex items-center gap-1 text-xs sm:text-sm">
                      <X class="w-3 h-3" />
                      W Promo
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <!-- Card Details Table -->
            <Card>
              <CardHeader>
                <CardTitle class="text-base sm:text-lg">Card Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
                  <div class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Number:</span>
                    <span>{{ selectedCard.localId }}</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Rarity:</span>
                    <span>{{ selectedCard.rarity || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Category:</span>
                    <span>{{ selectedCard.category }}</span>
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
                    <span class="truncate ml-2" :title="selectedCard.illustrator">{{ selectedCard.illustrator }}</span>
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
                <div class="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <img v-if="selectedCard.set.logo" :src="selectedCard.set.logo" :alt="`${selectedCard.set.name} logo`"
                    class="h-10 sm:h-12 object-contain" />
                  <div>
                    <CardTitle class="text-base sm:text-lg">{{ selectedCard.set.name }}</CardTitle>
                    <p v-if="selectedCard.set.serie" class="text-xs text-muted-foreground mt-1">{{
                      selectedCard.set.serie }}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-3 text-xs sm:text-sm">
                  <div class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Set ID:</span>
                    <span>{{ selectedCard.set.id }}</span>
                  </div>
                  <div v-if="selectedCard.set.cardCount" class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Card Count:</span>
                    <span>{{ selectedCard.set.cardCount.official }} ({{ selectedCard.set.cardCount.total }}
                      total)</span>
                  </div>
                  <div v-if="selectedCard.set.releaseDate" class="flex justify-between border-b pb-2">
                    <span class="font-semibold">Release Date:</span>
                    <span>{{ selectedCard.set.releaseDate }}</span>
                  </div>
                  <div v-if="selectedCard.set.tcgOnline" class="flex justify-between border-b pb-2">
                    <span class="font-semibold">TCG Online Code:</span>
                    <span class="font-mono text-xs">{{ selectedCard.set.tcgOnline }}</span>
                  </div>
                  <div v-if="selectedCard.set.symbol" class="flex justify-between items-center border-b pb-2">
                    <span class="font-semibold">Symbol:</span>
                    <img :src="selectedCard.set.symbol" :alt="`${selectedCard.set.name} symbol`"
                      class="h-5 sm:h-6 object-contain" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
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
  import { ScrollArea } from '@/components/ui/scroll-area'
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
