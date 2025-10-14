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
        <div class="flex items-center gap-3">
          <div class="w-full">
            <PokemonSearch />
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Spinner shows immediately when loading (use ImageSkeleton) -->
      <div v-if="showSpinner || !showSkeleton" class="w-full flex flex-col items-center justify-center py-16 space-y-4">
        <div class="w-24 h-24">
          <ImageSkeleton />
        </div>
        <p class="text-muted-foreground text-center">Loading card details…</p>
      </div>

      <!-- Skeleton detail layout appears after skeletonDelay (bento + cards grid) -->
      <div v-if="showSkeleton" class="container mx-auto px-4 py-8 max-w-7xl">
        <div class="flex flex-col lg:flex-row gap-6 mt-6">
          <!-- Left: large image skeleton -->
          <div class="lg:w-80 lg:flex-shrink-0 flex flex-col gap-6 lg:order-2">
            <div
              class="w-full max-w-sm mx-auto lg:max-w-none aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg flex items-center justify-center">
              <div class="w-32 h-32">
                <ImageSkeleton />
              </div>
            </div>
            <div class="flex gap-3">
              <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
              <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
              <Skeleton class="w-1/3 h-12 bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>

          <!-- Right: details skeletons -->
          <div class="flex-1 flex flex-col gap-4 lg:order-1">
            <Skeleton class="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-700" />
            <Skeleton class="h-6 w-1/2 bg-zinc-200 dark:bg-zinc-700" />

            <div class="flex flex-col md:flex-row gap-6">
              <Skeleton class="flex-1 h-40 bg-zinc-200 dark:bg-zinc-700" />
              <Skeleton class="flex-1 h-40 bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <div class="grid grid-cols-3 gap-4">
              <Skeleton class="h-8 bg-zinc-200 dark:bg-zinc-700" />
              <Skeleton class="h-8 bg-zinc-200 dark:bg-zinc-700" />
              <Skeleton class="h-8 bg-zinc-200 dark:bg-zinc-700" />
            </div>

            <Skeleton class="h-36 bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>

        <!-- Cards grid skeleton (similar to PokemonTCGCards) -->
        <div class="mt-8">
          <Card>
            <CardHeader>
              <div class="flex items-center justify-between">
                <div>
                  <Skeleton class="h-6 w-48 bg-zinc-200 dark:bg-zinc-700" />
                  <Skeleton class="h-3 w-64 mt-2 bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                <div v-for="i in 6" :key="i" class="space-y-2">
                  <div
                    class="w-full aspect-[2.5/3.5] flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg">
                    <ImageSkeleton />
                  </div>
                  <div class="px-1">
                    <Skeleton class="h-4 w-3/4 mx-auto bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <!-- Card Details Content -->
    <div v-else-if="card" class="container mx-auto px-4 py-8 max-w-7xl">
      <!-- Main Content Grid -->
      <div class="flex flex-col lg:flex-row gap-6 mt-8">
        <!-- Right Column: Card Image -->
        <div class="lg:w-80 lg:flex-shrink-0 flex flex-col gap-6 lg:order-2">
          <!-- Card Info Card -->
          <Card class="w-full">
            <CardContent class="p-2 space-y-4">
              <!-- Card Image -->
              <div
                class="w-full max-w-sm mx-auto aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden">
                <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
                  class="w-full h-full object-contain" @error="handleImageError" />
              </div>

              <!-- Card Details -->
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-2 flex-1 min-w-0">
                  <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{{ card.name }}</h1>
                  <div v-if="card.set" class="space-y-1">
                    <p class="text-sm sm:text-base text-muted-foreground">{{ card.set.name }}</p>
                    <p class="text-sm sm:text-base text-muted-foreground">Card #{{ card.localId }}</p>
                  </div>
                </div>
                <div v-if="card.set?.symbol" class="flex-shrink-0">
                  <img :src="`${card.set.symbol}.webp`" :alt="`${card.set.name} symbol`"
                    class="w-10 h-10 sm:w-12 sm:h-12 object-contain" @error="handleImageError" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Left Column: Card Details -->
        <div class="flex-1 flex flex-col gap-6 lg:order-1">
          <!-- Card Stats Card -->
          <Card>
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <Sparkles class="w-5 h-5" />
                Card Stats
              </CardTitle>
            </CardHeader>
            <CardContent class="space-y-6">
              <!-- HP and Types Header -->
              <div v-if="card.category === 'Pokemon'" class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-semibold text-muted-foreground">HP</span>
                  <span class="text-2xl font-bold">{{ card.hp }}</span>
                </div>
                <div v-if="card.types && card.types.length > 0" class="flex gap-2">
                  <Badge v-for="type in card.types" :key="type" variant="secondary" class="capitalize">
                    {{ type }}
                  </Badge>
                </div>
              </div>

              <!-- Attacks Table -->
              <div v-if="card.attacks && card.attacks.length > 0" class="space-y-4">
                <h3 class="text-xl font-semibold">Attacks</h3>
                <div v-for="(attack, idx) in card.attacks" :key="idx" class="border rounded-lg p-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-semibold">{{ attack.name }}</h4>
                    <div v-if="attack.cost" class="flex gap-1">
                      <Badge v-for="cost in attack.cost" :key="cost" variant="outline" class="text-xs">
                        {{ cost }}
                      </Badge>
                    </div>
                  </div>
                  <p v-if="attack.effect" class="text-sm text-muted-foreground">{{ attack.effect }}</p>
                  <p v-if="attack.damage" class="text-lg font-bold">{{ attack.damage }}</p>
                </div>
              </div>

              <!-- Abilities -->
              <div v-if="card.abilities && card.abilities.length > 0" class="space-y-4">
                <h3 class="text-xl font-semibold">Abilities</h3>
                <div v-for="(ability, idx) in card.abilities" :key="idx" class="border rounded-lg p-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <h4 class="font-semibold">{{ ability.name }}</h4>
                    <Badge v-if="ability.type" variant="secondary">{{ ability.type }}</Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">{{ ability.effect }}</p>
                </div>
              </div>

              <!-- Weakness, Resistance, Retreat -->
              <div class="grid grid-cols-3 gap-4">
                <!-- Weakness -->
                <div>
                  <h4 class="font-semibold text-sm">Weakness</h4>
                  <div v-if="card.weaknesses && card.weaknesses.length > 0" class="flex gap-2 mt-1">
                    <Badge v-for="weak in card.weaknesses" :key="weak.type" variant="destructive">
                      {{ weak.type }} {{ weak.value }}
                    </Badge>
                  </div>
                  <p v-else class="text-sm text-muted-foreground">None</p>
                </div>

                <!-- Resistance -->
                <div>
                  <h4 class="font-semibold text-sm">Resistance</h4>
                  <div v-if="card.resistances && card.resistances.length > 0" class="flex gap-2 mt-1">
                    <Badge v-for="res in card.resistances" :key="res.type" variant="secondary">
                      {{ res.type }} {{ res.value }}
                    </Badge>
                  </div>
                  <p v-else class="text-sm text-muted-foreground">None</p>
                </div>

                <!-- Retreat Cost -->
                <div>
                  <h4 class="font-semibold text-sm">Retreat</h4>
                  <p class="text-lg font-bold mt-1">{{ card.retreat || 0 }}</p>
                </div>
              </div>

              <!-- Description -->
              <div v-if="card.description" class="border-t pt-4">
                <p class="text-sm italic text-muted-foreground">{{ card.description }}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <!-- Upper row: Legal Formats & Variants (2 columns on lg) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <!-- Legal Formats -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="w-5 h-5" />
              Legal Formats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge v-if="card.legal?.standard !== undefined"
                :variant="card.legal.standard ? 'default' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.legal.standard" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Standard
              </Badge>
              <Badge v-if="card.legal?.expanded !== undefined"
                :variant="card.legal.expanded ? 'default' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.legal.expanded" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Expanded
              </Badge>
              <Badge v-if="card.legal?.unlimited !== undefined"
                :variant="card.legal.unlimited ? 'default' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.legal.unlimited" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Unlimited
              </Badge>
              <span
                v-if="!card.legal || (card.legal.standard === undefined && card.legal.expanded === undefined && card.legal.unlimited === undefined)"
                class="text-sm text-muted-foreground">No legal formats available</span>
            </div>
          </CardContent>
        </Card>

        <!-- Variants -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Layers class="w-5 h-5" />
              Variants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge v-if="card.variants?.normal !== undefined"
                :variant="card.variants.normal ? 'default' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.variants.normal" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Normal
              </Badge>
              <Badge v-if="card.variants?.reverse !== undefined"
                :variant="card.variants.reverse ? 'default' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.variants.reverse" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Reverse
              </Badge>
              <Badge v-if="card.variants?.holo !== undefined" :variant="card.variants.holo ? 'default' : 'destructive'"
                class="flex items-center gap-1">
                <Check v-if="card.variants.holo" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                Holo
              </Badge>
              <Badge v-if="card.variants?.firstEdition !== undefined"
                :variant="card.variants.firstEdition ? 'secondary' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.variants.firstEdition" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                1st Edition
              </Badge>
              <Badge v-if="card.variants?.wPromo !== undefined"
                :variant="card.variants.wPromo ? 'destructive' : 'destructive'" class="flex items-center gap-1">
                <Check v-if="card.variants.wPromo" class="w-3 h-3" />
                <X v-else class="w-3 h-3" />
                W Promo
              </Badge>
              <span
                v-if="!card.variants || (card.variants.normal === undefined && card.variants.reverse === undefined && card.variants.holo === undefined && card.variants.firstEdition === undefined && card.variants.wPromo === undefined)"
                class="text-sm text-muted-foreground">No variants available</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Bottom row: Pokedex Data, Card Details, Set Information (3 columns on lg) -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <!-- Pokedex Data -->
        <Card v-if="pokedexList && pokedexList.length > 0">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Package class="w-5 h-5" />
              Pokedex Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <div v-for="p in pokedexList" :key="p.id"
                class="bg-card text-card-foreground gap-6 rounded-xl border py-6 shadow-sm relative flex flex-col items-center transition-transform transform hover:-translate-y-1 focus-within:scale-[1.01] cursor-pointer"
                @click="() => $router.push(`/pokemon/${p.id}`)" tabindex="0" role="button">
                <div class="w-24 h-24 flex items-center justify-center relative">
                  <img
                    :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`"
                    :alt="p.name"
                    class="h-auto w-auto object-contain absolute inset-0 m-auto transition-opacity duration-200 opacity-100"
                    loading="lazy" />
                </div>
                <div class="w-full flex flex-col items-center p-0.5 pt-0">
                  <span class="text-xs font-mono text-zinc-400">#{{ String(p.id).padStart(4, '0') }}</span>
                  <h3 class="capitalize font-semibold text-zinc-800 dark:text-zinc-100 text-base text-center">{{ p.name
                    }}</h3>
                  <div class="flex flex-wrap gap-1 mt-1 justify-center sm:justify-center">
                    <label v-for="(t, idx) in p.types" :key="t + '-' + idx"
                      :class="['px-2 py-1 rounded-md text-sm font-medium flex items-center gap-2 flex-shrink-0', getTypeClass(t)]">
                      <span class="text-xs leading-none">{{ getTypeEmojiLocal(t) }}</span>
                      <span class="capitalize text-xs">{{ t }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Card Details Table (single column, ordered) -->
        <Card class="mb-8">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Info class="w-5 h-5" />
              Card Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 gap-y-3 text-sm">
              <!-- Number -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Number:</span>
                <span>{{ card.localId || card.id }}</span>
              </div>

              <!-- Rarity -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Rarity:</span>
                <span>{{ card.rarity || 'N/A' }}</span>
              </div>

              <!-- Category -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Category:</span>
                <span>{{ card.category || 'N/A' }}</span>
              </div>

              <!-- State (Stage) -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">State:</span>
                <span>{{ card.stage || 'N/A' }}</span>
              </div>

              <!-- Evolves From -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Evolves From:</span>
                <span>{{ card.evolveFrom || 'N/A' }}</span>
              </div>

              <!-- Illustrator -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Illustrator:</span>
                <span>{{ card.illustrator || 'N/A' }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Set Information (single column, ordered) -->
        <Card v-if="card.set">
          <CardHeader>
            <div class="flex items-center gap-4 flex-wrap">
              <img v-if="card.set.logo" :src="`${card.set.logo}.webp`" :alt="`${card.set.name} logo`"
                class="h-12 object-contain" @error="handleImageError" />
              <div>
                <CardTitle class="flex items-center gap-2">
                  <Package class="w-5 h-5" />
                  {{ card.set.name }}
                </CardTitle>
                <p class="text-sm text-muted-foreground">{{ card.set.serie?.name }}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 gap-y-3 text-sm">
              <!-- Name -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Name:</span>
                <span>{{ card.set.name }}</span>
              </div>

              <!-- Series -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Series:</span>
                <span>{{ card.set.serie?.name || 'N/A' }}</span>
              </div>

              <!-- Card Count -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Card Count:</span>
                <span>{{ card.set.cardCount?.official || card.set.cardCount?.total || 'N/A' }}</span>
              </div>

              <!-- Release Date -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">Release Date:</span>
                <span>{{ card.set.releaseDate ? new Date(card.set.releaseDate).toLocaleDateString() : 'N/A' }}</span>
              </div>

              <!-- TCG Online Code -->
              <div class="flex justify-between border-b pb-2">
                <span class="font-semibold">TCG Online Code:</span>
                <span>{{ card.set.tcgOnline || 'N/A' }}</span>
              </div>

              <!-- Symbol -->
              <div class="flex justify-between items-center border-b pb-2">
                <span class="font-semibold">Symbol:</span>
                <div>
                  <img v-if="card.set.symbol" :src="`${card.set.symbol}.webp`" :alt="`${card.set.name} symbol`"
                    class="w-12 h-12 object-contain" @error="handleImageError" />
                  <span v-else class="text-sm text-muted-foreground">N/A</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
  import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import SiteFooter from '@/components/ui/SiteFooter.vue'
  import { Check, X, Sparkles, Shield, Layers, Info, Package } from 'lucide-vue-next'
  import { getTypeClass } from '@/lib/type-classes'
  import { TYPES } from '@/stores/types'

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
      serie?: {
        id: string
        name: string
      }
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
  const pokedexList = ref<Array<{ id: number; name: string; types: string[] }>>([])
  const isLoading = ref(true)
  const errorMessage = ref<string | null>(null)
  const showSpinner = ref(false)
  const showSkeleton = ref(false)

  const spinnerDelay = 800 // ms
  const skeletonDelay = 500 // ms after spinner

  let spinnerTimer: ReturnType<typeof setTimeout> | null = null
  let skeletonTimer: ReturnType<typeof setTimeout> | null = null

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

      // After we have the card, attempt to fetch richer set details from the tcgdex sets endpoint
      const fetchSetDetails = async (setId: string | number) => {
        const tryFetchSet = async (url: string) => {
          try {
            const res = await fetch(url)
            if (!res.ok) {
              if (res.status === 404) return null
              throw new Error(`HTTP ${res.status}`)
            }
            return await res.json()
          } catch (e) {
            console.warn('fetch error for set', url, e)
            return null
          }
        }

        const id = String(setId)
        // Try same knownLangs order used earlier
        for (const lang of knownLangs) {
          const url = `https://api.tcgdex.net/v2/${lang}/sets/${id}`
          const s = await tryFetchSet(url)
          if (s) return s
        }

        // Final fallback without language
        return await tryFetchSet(`https://api.tcgdex.net/v2/sets/${id}`)
      }

      try {
        const setId = (card.value as any)?.set?.id
        if (setId) {
          const setData = await fetchSetDetails(setId)
          if (setData) {
            // Merge fields defensively, mapping common variants from the API
            const s = card.value!.set = card.value!.set || ({} as any)
            s.name = setData.name || s.name
            // series/serie
            if (!s.serie) s.serie = {}
            s.serie.id = setData.serie?.id ?? setData.series?.id ?? s.serie.id
            s.serie.name = setData.serie?.name ?? setData.series?.name ?? setData.series ?? s.serie.name
            // card counts
            s.cardCount = s.cardCount || {}
            s.cardCount.official = setData.cardCount?.official ?? setData.card_count?.official ?? setData.total ?? s.cardCount.official
            s.cardCount.total = setData.cardCount?.total ?? setData.card_count?.total ?? setData.total_cards ?? setData.total ?? s.cardCount.total
            // release date
            s.releaseDate = setData.releaseDate ?? setData.release_date ?? s.releaseDate
            // tcg online code
            s.tcgOnline = setData.tcgOnline ?? setData.tcg_online ?? setData.tcg_code ?? setData.code ?? s.tcgOnline
            // logo/symbol (images may be nested)
            s.logo = s.logo || setData.logo || setData.images?.logo || setData.image || s.logo
            s.symbol = s.symbol || setData.symbol || setData.images?.symbol || s.symbol
          }
        }
      } catch (e) {
        // non-fatal
        console.warn('error fetching set details', e)
      }
    } catch (error: any) {
      console.error('Error fetching card details:', error)
      errorMessage.value = error?.message || 'Unknown error fetching card details'
      card.value = null
    } finally {
      isLoading.value = false
    }
  }

  const router = useRouter()

  const normalizeNameForApi = (name = '') => {
    return String(name).toLowerCase().replace(/[^a-z0-9- ]/g, '').replace(/\s+/g, '-').trim()
  }

  const getTypeEmojiLocal = (t: string) => {
    // TYPES is a typed object; use a const assertion to access safely
    // Provide fallback empty string when missing
    try {
      return (TYPES as any)[t]?.emoji || ''
    } catch (e) {
      return ''
    }
  }

  const fetchPokedexData = async (pokemonName: string) => {
    pokedexList.value = []
    if (!pokemonName) return
    const normalized = normalizeNameForApi(pokemonName)
    try {
      // try by name first
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`)
      if (!res.ok) {
        // try with lowercase/raw name fallback
        const res2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`)
        if (!res2.ok) return
        const d2 = await res2.json()
        pokedexList.value = [{ id: d2.id, name: d2.name, types: Array.isArray(d2.types) ? d2.types.map((t: any) => t.type.name) : [] }]
        return
      }
      const d = await res.json()
      pokedexList.value = [{ id: d.id, name: d.name, types: Array.isArray(d.types) ? d.types.map((t: any) => t.type.name) : [] }]
    } catch (e) {
      // ignore network errors
      console.warn('Error fetching pokedex data for', pokemonName, e)
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

  // When card is loaded, fetch pokedex data if applicable
  watch(card, (c) => {
    if (c && c.category === 'Pokemon') {
      // prefer card.name or try to parse from card.name
      fetchPokedexData(c.name)
    } else {
      pokedexList.value = []
    }
  })

  // Watch loading to show spinner then skeleton
  watch(isLoading, (loading) => {
    // clear existing timers
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
      // schedule skeleton after spinnerDelay + skeletonDelay to ensure spinner visible first
      if (skeletonTimer) clearTimeout(skeletonTimer)
      skeletonTimer = setTimeout(() => {
        showSkeleton.value = true
        skeletonTimer = null
      }, skeletonDelay)
    } else {
      showSpinner.value = false
      showSkeleton.value = false
    }
  }, { immediate: true })

  // Cleanup timers on unmount
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

  // SEO
  useHead(() => ({
    title: card.value ? `${card.value.name} - TCG Card | PokéHex` : 'TCG Card | PokéHex',
    meta: [
      { name: 'description', content: card.value?.description || 'Pokémon Trading Card Game card details' }
    ]
  }))
</script>
