<template>
  <div class="w-full min-h-screen bg-background">
    <!-- Navbar -->
    <nav
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="$router.back()">
            ← Back
          </Button>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-64 md:w-96">
            <PokemonSearch />
          </div>
          <div class="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto px-4 py-8 max-w-7xl">
      <div class="w-full flex flex-col items-center justify-center py-16 space-y-4">
        <ImageSkeleton />
        <p class="text-muted-foreground text-center">Loading card details…</p>
      </div>
    </div>

    <!-- Card Details Content -->
    <div v-else-if="card" class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="space-y-2">
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold">{{ card.name }}</h1>
          <p v-if="card.set" class="text-base sm:text-lg text-muted-foreground">
            {{ card.set.name }} • Card #{{ card.localId }}
          </p>
        </div>
        <div v-if="card.set?.symbol" class="flex-shrink-0">
          <img :src="card.set.symbol" :alt="`${card.set.name} symbol`" class="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            @error="handleImageError" />
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
        <!-- Left Column: Card Image -->
        <div class="flex flex-col gap-4">
          <div
            class="w-full max-w-sm mx-auto lg:max-w-none aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden shadow-2xl">
            <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
              class="w-full h-full object-contain p-4" @error="handleImageError" />
          </div>
        </div>

        <!-- Right Column: Card Details -->
        <div class="space-y-6 lg:col-span-2">
          <!-- HP and Types Header -->
          <div v-if="card.category === 'Pokemon'" class="flex items-center justify-between flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-semibold text-muted-foreground">HP</span>
              <span class="text-3xl sm:text-4xl font-bold">{{ card.hp }}</span>
            </div>
            <div v-if="card.types && card.types.length > 0" class="flex gap-2">
              <Badge v-for="type in card.types" :key="type" variant="secondary" class="text-lg px-4 py-1">
                {{ type }}
              </Badge>
            </div>
          </div>

          <!-- Attacks Table -->
          <div v-if="card.attacks && card.attacks.length > 0" class="space-y-4">
            <h3 class="text-xl font-semibold">Attacks</h3>
            <div v-for="(attack, idx) in card.attacks" :key="idx" class="border rounded-lg p-4 space-y-2">
              <div class="flex items-center justify-between flex-wrap gap-2">
                <div class="flex items-center gap-3 flex-wrap">
                  <div v-if="attack.cost && attack.cost.length > 0" class="flex gap-1">
                    <Badge v-for="(cost, cidx) in attack.cost" :key="cidx" variant="outline" class="text-sm">
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
          <div v-if="card.abilities && card.abilities.length > 0" class="space-y-4">
            <h3 class="text-xl font-semibold">Abilities</h3>
            <div v-for="(ability, idx) in card.abilities" :key="idx" class="border rounded-lg p-4 space-y-2">
              <div class="font-bold text-base">{{ ability.name }}</div>
              <p v-if="ability.effect" class="text-sm text-muted-foreground">{{ ability.effect }}</p>
            </div>
          </div>

          <!-- Weakness, Resistance, Retreat -->
          <div class="grid grid-cols-3 gap-4">
            <!-- Weakness -->
            <div>
              <h4 class="text-sm font-semibold mb-2">Weakness</h4>
              <div v-if="card.weaknesses && card.weaknesses.length > 0" class="space-y-1">
                <div v-for="(weak, idx) in card.weaknesses" :key="idx" class="flex items-center gap-2">
                  <Badge variant="destructive" class="text-sm">{{ weak.type }}</Badge>
                  <span class="text-sm font-semibold">{{ weak.value }}</span>
                </div>
              </div>
              <span v-else class="text-sm text-muted-foreground">N/A</span>
            </div>

            <!-- Resistance -->
            <div>
              <h4 class="text-sm font-semibold mb-2">Resistance</h4>
              <div v-if="card.resistances && card.resistances.length > 0" class="space-y-1">
                <div v-for="(res, idx) in card.resistances" :key="idx" class="flex items-center gap-2">
                  <Badge variant="secondary" class="text-sm">{{ res.type }}</Badge>
                  <span class="text-sm font-semibold">{{ res.value }}</span>
                </div>
              </div>
              <span v-else class="text-sm text-muted-foreground">N/A</span>
            </div>

            <!-- Retreat Cost -->
            <div>
              <h4 class="text-sm font-semibold mb-2">Retreat Cost</h4>
              <div v-if="card.retreat !== undefined && card.retreat !== null">
                <div v-if="card.retreat === 0" class="text-sm text-muted-foreground">Free</div>
                <div v-else class="flex gap-1 flex-wrap">
                  <Badge v-for="i in card.retreat" :key="i" variant="outline"
                    class="w-6 h-6 p-0 flex items-center justify-center text-xs">⚪</Badge>
                </div>
              </div>
              <span v-else class="text-sm text-muted-foreground">N/A</span>
            </div>
          </div>

          <!-- Description -->
          <div v-if="card.description" class="border-t pt-4">
            <p class="text-sm italic text-muted-foreground">{{ card.description }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom Sections Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Legal Formats -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">Legal Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge v-if="card.legal?.standard" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Standard
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Standard
              </Badge>

              <Badge v-if="card.legal?.expanded" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Expanded
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Expanded
              </Badge>

              <Badge v-if="card.legal?.unlimited" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Unlimited
              </Badge>
              <Badge v-else-if="card.legal && 'unlimited' in card.legal" variant="destructive"
                class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Unlimited
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
              <Badge v-if="card.variants?.normal" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Normal
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Normal
              </Badge>

              <Badge v-if="card.variants?.holo" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Holofoil
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Holofoil
              </Badge>

              <Badge v-if="card.variants?.reverse" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                Reverse Holo
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                Reverse Holo
              </Badge>

              <Badge v-if="card.variants?.firstEdition" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                First Edition
              </Badge>
              <Badge v-else variant="destructive" class="flex items-center gap-1">
                <X class="w-3 h-3" />
                First Edition
              </Badge>

              <Badge v-if="card.variants?.wPromo" variant="default"
                class="flex items-center gap-1 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                <Check class="w-3 h-3" />
                W Promo
              </Badge>
              <Badge v-else-if="card.variants && 'wPromo' in card.variants" variant="destructive"
                class="flex items-center gap-1">
                <X class="w-3 h-3" />
                W Promo
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Card Details Table -->
      <Card class="mb-8">
        <CardHeader>
          <CardTitle class="text-lg">Card Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold">Number:</span>
              <span>{{ card.localId }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold">Rarity:</span>
              <span>{{ card.rarity || 'N/A' }}</span>
            </div>
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold">Category:</span>
              <span>{{ card.category }}</span>
            </div>
            <div v-if="card.stage" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Stage:</span>
              <span>{{ card.stage }}</span>
            </div>
            <div v-if="card.evolveFrom" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Evolves From:</span>
              <span>{{ card.evolveFrom }}</span>
            </div>
            <div v-if="card.illustrator" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Illustrator:</span>
              <span class="truncate ml-2" :title="card.illustrator">{{ card.illustrator }}</span>
            </div>
            <div v-if="card.regulationMark" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Regulation Mark:</span>
              <span>{{ card.regulationMark }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Set Information -->
      <Card v-if="card.set">
        <CardHeader>
          <div class="flex items-center gap-4 flex-wrap">
            <img v-if="card.set.logo" :src="card.set.logo" :alt="`${card.set.name} logo`" class="h-12 object-contain"
              @error="handleImageError" />
            <div>
              <CardTitle class="text-lg">{{ card.set.name }}</CardTitle>
              <p v-if="card.set.serie" class="text-sm text-muted-foreground mt-1">{{ card.set.serie }}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            <div class="flex justify-between border-b pb-2">
              <span class="font-semibold">Set ID:</span>
              <span>{{ card.set.id }}</span>
            </div>
            <div v-if="card.set.cardCount" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Card Count:</span>
              <span>{{ card.set.cardCount.official }} ({{ card.set.cardCount.total }} total)</span>
            </div>
            <div v-if="card.set.releaseDate" class="flex justify-between border-b pb-2">
              <span class="font-semibold">Release Date:</span>
              <span>{{ card.set.releaseDate }}</span>
            </div>
            <div v-if="card.set.tcgOnline" class="flex justify-between border-b pb-2">
              <span class="font-semibold">TCG Online Code:</span>
              <span class="font-mono text-xs">{{ card.set.tcgOnline }}</span>
            </div>
            <div v-if="card.set.symbol" class="flex justify-between items-center border-b pb-2">
              <span class="font-semibold">Symbol:</span>
              <img :src="card.set.symbol" :alt="`${card.set.name} symbol`" class="h-6 object-contain"
                @error="handleImageError" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Error State -->
    <div v-else class="container mx-auto px-4 py-8 max-w-7xl">
      <div class="w-full text-center py-16">
        <p class="text-lg text-muted-foreground">{{ errorMessage || 'Card not found' }}</p>
        <Button @click="$router.back()" class="mt-4">Go Back</Button>
      </div>
    </div>

    <!-- Site Footer -->
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'
  import ThemeToggle from '@/components/ThemeToggle.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import SiteFooter from '@/components/ui/SiteFooter.vue'
  import { Check, X } from 'lucide-vue-next'

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

  const route = useRoute()
  const card = ref<TCGCard | null>(null)
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)

  const fetchCardDetails = async () => {
    isLoading.value = true
    errorMessage.value = null
    try {
      const cardId = route.params.cardId as string
      const parts = cardId.split('-')
      const possibleLang = parts[0]

      // Known language codes (try in this order)
      const knownLangs = ['en', 'es', 'fr', 'de', 'it', 'pt', 'jp', 'ja', 'zh', 'ko', 'ru']

      // Helper to try fetching a specific URL and return parsed JSON or null on 404
      const tryFetch = async (url: string) => {
        try {
          const res = await fetch(url)
          if (!res.ok) {
            if (res.status === 404) return null
            // For other statuses, throw to surface the error after trying fallbacks
            throw new Error(`HTTP ${res.status}`)
          }
          return await res.json()
        } catch (e) {
          // Network error or other problems
          console.warn('fetch error for', url, e)
          return null
        }
      }

      // If the first segment looks like a known language code, try it first
      let found: any = null
      if (possibleLang && knownLangs.includes(possibleLang)) {
        found = await tryFetch(`https://api.tcgdex.net/v2/${possibleLang}/cards/${cardId}`)
      }

      // Otherwise, or if that failed, try the preferred languages in order
      if (!found) {
        for (const lang of knownLangs) {
          // Skip the one we already tried
          if (lang === possibleLang) continue
          found = await tryFetch(`https://api.tcgdex.net/v2/${lang}/cards/${cardId}`)
          if (found) break
        }
      }

      // Final fallback: try endpoint without a language prefix (if supported)
      if (!found) {
        found = await tryFetch(`https://api.tcgdex.net/v2/cards/${cardId}`)
      }

      if (!found) {
        errorMessage.value = `Card "${cardId}" not found on the tcgdex API (tried multiple language endpoints).`
        card.value = null
        return
      }

      card.value = found as TCGCard
    } catch (error: any) {
      console.error('Error fetching card details:', error)
      errorMessage.value = error?.message || 'Unknown error fetching card details'
      card.value = null
    } finally {
      isLoading.value = false
    }
  }

  const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    // Hide broken images
    img.style.display = 'none'
  }

  onMounted(() => {
    fetchCardDetails()
  })

  // SEO
  useHead(() => ({
    title: card.value ? `${card.value.name} - TCG Card | PokéHex` : 'TCG Card | PokéHex',
    meta: [
      { name: 'description', content: card.value?.description || 'Pokémon Trading Card Game card details' }
    ]
  }))
</script>
