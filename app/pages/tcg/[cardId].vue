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
              <!-- Card Image (Glare) -->
              <GlareCard>
                <div
                  class="w-full max-w-sm mx-auto aspect-[2.5/3.5] bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-sm overflow-hidden">
                  <div class="relative w-full h-full">
                    <img src="/card.webp" alt="card skeleton"
                      class="w-full h-full object-contain absolute inset-0 transition-opacity duration-500"
                      :style="{ opacity: imageLoaded ? 0 : 1 }" />
                    <img v-if="card.image" :src="`${card.image}/high.webp`" :alt="card.name"
                      class="w-full h-full object-contain absolute inset-0 transition-opacity duration-500"
                      @error="handleCardImageError" @load="imageLoaded = true"
                      :style="{ opacity: imageLoaded ? 1 : 0 }" />
                  </div>
                </div>
              </GlareCard>
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
                    class="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain"
                    @error="handleImageError" />
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
                class="h-10 w-auto sm:h-12 md:h-14 lg:h-16 object-contain" @error="handleImageError" />
              <!-- <div>
                <CardTitle class="flex items-center gap-2">
                  <Package class="w-5 h-5" />
                  {{ card.set.name }}
                </CardTitle>
                <p class="text-sm text-muted-foreground">{{ card.set.serie?.name }}</p>
              </div> -->
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

      <!-- Collection Card List (series/set based) -->
      <div class="w-full mt-8">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between w-full">
              <div class="space-y-1.5">
                <CardTitle class="font-bold flex items-center gap-2">
                  <Sparkles class="w-5 h-5" />
                  {{ card.set?.serie?.name || card.set?.name || 'Collection' }} Card List:
                </CardTitle>
                <p class="text-sm text-muted-foreground">Other TCG cards from {{ card.set?.serie?.name || card.set?.name
                  || 'this set/series' }}</p>
              </div>

              <div class="flex items-center gap-3">
                <div class="flex items-center gap-3">
                  <div v-if="card.set?.logo" class="flex items-center">
                    <img :src="`${card.set.logo}.webp`" :alt="`${card.set.name} logo`"
                      class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain"
                      @error="handleImageError" />
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <!-- Controls: items per page and language -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div class="flex items-center gap-3">
                <Label class="text-sm font-semibold">Cards per page:</Label>
                <Select v-model="collectionItemsPerPage">
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

              <div class="flex items-center gap-4">
                <div class="text-sm text-muted-foreground">
                  Showing {{ (collectionCurrentPage - 1) * Number(collectionItemsPerPage) + 1 }} -
                  {{ Math.min(collectionTotal, (collectionCurrentPage - 1) * Number(collectionItemsPerPage) +
                    Number(collectionItemsPerPage)) }} of {{ collectionTotal }}
                </div>

                <div class="flex items-center gap-3">
                  <Label class="text-sm font-semibold">Language:</Label>
                  <Select v-model="collectionSelectedLanguage">
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
            </div>

            <!-- Loading / Skeleton -->
            <div v-if="collectionLoading && !collectionShowSkeleton" class="w-full flex flex-col items-center py-8">
              <ImageSkeleton />
              <p class="text-muted-foreground mt-2">Loading collection…</p>
            </div>

            <div v-if="collectionLoading && collectionShowSkeleton"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div v-for="i in Number(collectionItemsPerPage)" :key="i" class="space-y-2">
                <div
                  class="w-full aspect-[2.5/3.5] flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 rounded-lg overflow-hidden">
                  <img src="/card.webp" alt="card placeholder"
                    class="w-full h-full object-contain opacity-60 animate-pulse" />
                </div>
                <div class="px-1">
                  <Skeleton class="h-4 w-3/4 mx-auto" />
                </div>
              </div>
            </div>

            <!-- Grid -->
            <div v-if="!collectionLoading && collectionCards.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div v-for="c in collectionCards" :key="c.id" class="group">
                <a :href="`/tcg/${c.id}`" target="_blank" rel="noopener noreferrer" class="block"
                  @click="$event && onCollectionCardClick($event, c.id)">
                  <GlareCard>
                    <div
                      class="relative w-full aspect-[2.5/3.5] rounded-lg overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 md:shadow-md md:transition-shadow md:duration-300 md:hover:shadow-2xl mx-auto">
                      <img v-if="c.image" :src="`${c.image}/high.webp`" :alt="c.name"
                        class="w-full h-full object-contain" loading="lazy" @error="handleCardImageError" />
                      <img v-else src="/card.webp" alt="card placeholder"
                        class="w-full h-full object-contain opacity-80" />
                    </div>
                  </GlareCard>
                  <div class="mt-2 px-1">
                    <p class="text-sm font-bold line-clamp-2 text-center">{{ c.name }}</p>
                  </div>
                </a>
              </div>
            </div>

            <!-- No results -->
            <div v-if="!collectionLoading && collectionCards.length === 0" class="w-full text-center py-8">
              <p class="text-muted-foreground">No collection cards found.</p>
            </div>

            <!-- Pagination -->
            <div v-if="!collectionLoading && collectionTotal > Number(collectionItemsPerPage)"
              class="flex flex-col items-center gap-4 pt-4">
              <div class="flex items-center gap-2">
                <Button variant="outline" size="sm" :disabled="collectionCurrentPage === 1"
                  @click="collectionGoToPage(1)">
                  «
                </Button>
                <Button variant="outline" size="sm" :disabled="collectionCurrentPage === 1"
                  @click="collectionGoToPage(collectionCurrentPage - 1)">
                  ‹
                </Button>

                <div class="flex items-center gap-1">
                  <template v-for="page in collectionVisiblePages" :key="page">
                    <Button v-if="typeof page === 'number'"
                      :variant="page === collectionCurrentPage ? 'default' : 'outline'" size="sm"
                      @click="collectionGoToPage(page as number)">
                      {{ page }}
                    </Button>
                    <span v-else class="px-2">...</span>
                  </template>
                </div>

                <Button variant="outline" size="sm" :disabled="collectionCurrentPage === collectionTotalPages"
                  @click="collectionGoToPage(collectionCurrentPage + 1)">
                  ›
                </Button>
                <Button variant="outline" size="sm" :disabled="collectionCurrentPage === collectionTotalPages"
                  @click="collectionGoToPage(collectionTotalPages)">
                  »
                </Button>
              </div>

              <p class="text-sm text-muted-foreground">
                Page {{ collectionCurrentPage }} of {{ collectionTotalPages }}
              </p>
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
  import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'
  import ImageSkeleton from '@/components/pokemon/ImageSkeleton.vue'
  import SiteFooter from '@/components/ui/SiteFooter.vue'
  import GlareCard from '@/components/ui/GlareCard.vue'
  import { Check, X, Sparkles, Shield, Layers, Info, Package } from 'lucide-vue-next'
  import { getTypeClass } from '@/lib/type-classes'
  import { TYPES } from '@/stores/types'
  import TCGdex, { Query } from '@tcgdex/sdk'
  import { Label } from '@/components/ui/label'
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

      // Use the official SDK to fetch the card with language fallbacks.
      const tcgdexClientFor = (lang?: string) => new TCGdex((lang || 'en') as any)

      let found: any = null
      // If the first segment looks like a language code, try it first
      if (possibleLang && knownLangs.includes(possibleLang)) {
        try {
          found = await tcgdexClientFor(possibleLang).card.get(cardId)
        } catch (e) {
          found = null
        }
      }

      // Try other known languages in order
      if (!found) {
        for (const lang of knownLangs) {
          if (lang === possibleLang) continue
          try {
            const res = await tcgdexClientFor(lang).card.get(cardId)
            if (res) { found = res; break }
          } catch (e) {
            // ignore
          }
        }
      }

      // Final fallback: default client
      if (!found) {
        try {
          found = await new TCGdex().card.get(cardId)
        } catch (e) {
          found = null
        }
      }

      if (!found) {
        errorMessage.value = `Card "${cardId}" not found on the tcgdex API (tried multiple language endpoints).`
        card.value = null
        return
      }

      card.value = found as TCGCard

      // After we have the card, attempt to fetch richer set details from the tcgdex sets endpoint
      const fetchSetDetails = async (setId: string | number) => {
        const id = String(setId)
        for (const lang of knownLangs) {
          try {
            const sdk = new TCGdex(lang as any)
            const s = await sdk.set.get(id)
            if (s) return s
          } catch (e) {
            // ignore
          }
        }

        try {
          const sdk = new TCGdex()
          return await sdk.set.get(id)
        } catch (e) {
          return null
        }
      }

      try {
        const setId = (card.value as any)?.set?.id
        if (setId) {
          const setData = await fetchSetDetails(setId)
          if (setData) {
            // Merge fields defensively using SDK's Set shape
            const s = card.value!.set = card.value!.set || ({} as any)
            s.name = setData.name || s.name
            if (!s.serie) s.serie = {}
            s.serie.id = setData.serie?.id ?? s.serie.id
            s.serie.name = setData.serie?.name ?? s.serie.name
            s.cardCount = s.cardCount || {}
            s.cardCount.official = setData.cardCount?.official ?? s.cardCount.official
            s.cardCount.total = setData.cardCount?.total ?? s.cardCount.total
            s.releaseDate = setData.releaseDate ?? s.releaseDate
            s.tcgOnline = setData.tcgOnline ?? s.tcgOnline
            s.logo = s.logo || setData.logo
            s.symbol = s.symbol || setData.symbol
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

  // Specialized handler for card artwork images (Glare and collection thumbnails).
  // When the remote image fails, swap to the local placeholder `/card.webp` instead
  // of hiding the element so the GlareCard and grid maintain layout.
  // For fade-in skeleton effect
  const imageLoaded = ref(false)

  const handleCardImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (!img) return
    // If already using placeholder, hide to avoid infinite loop
    if (img.src && img.src.includes('/card.webp')) {
      img.style.display = 'none'
      return
    }
    img.src = '/card.webp'
    img.alt = 'card placeholder'
    imageLoaded.value = true // Show skeleton only
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

  // -------------------------
  // Collection Card List
  // -------------------------
  const collectionCards = ref<any[]>([])
  const collectionTotal = ref(0)
  const collectionCurrentPage = ref(1)
  const collectionItemsPerPage = ref('24')
  const collectionSelectedLanguage = ref('en')
  const collectionLoading = ref(false)
  const collectionShowSkeleton = ref(false)

  let collSpinnerTimer: ReturnType<typeof setTimeout> | null = null
  let collSkeletonTimer: ReturnType<typeof setTimeout> | null = null

  const fetchCollectionCards = async () => {
    // determine pokemon name to search: prefer pokedexList first
    const pokemonName = (pokedexList.value && pokedexList.value.length > 0 && pokedexList.value[0]) ? pokedexList.value[0].name : (card.value?.name ?? '')
    if (!pokemonName) return

    // clear timers
    if (collSpinnerTimer) clearTimeout(collSpinnerTimer)
    if (collSkeletonTimer) clearTimeout(collSkeletonTimer)

    collectionLoading.value = true
    collectionShowSkeleton.value = false

    collSkeletonTimer = setTimeout(() => {
      if (collectionLoading.value) collectionShowSkeleton.value = true
      collSkeletonTimer = null
    }, 500)

    try {
      const lang = collectionSelectedLanguage.value

      // Prefer querying by set id if available
      const setId = (card.value as any)?.set?.id
      const serieName = (card.value as any)?.set?.serie?.name || (card.value as any)?.set?.serie || (card.value as any)?.set?.series

      let allCards: any[] = []

      const tryFetchCards = async (url: string) => {
        try {
          const r = await fetch(url)
          if (!r.ok) return null
          return await r.json()
        } catch (e) {
          return null
        }
      }

      if (setId && !String(setId).includes('.')) {
        // Prefer using SDK: try to get the set and its cards
        for (const lg of ['', 'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh']) {
          try {
            const sdk = lg ? new TCGdex(lg as any) : new TCGdex()
            const set = await sdk.set.get(String(setId))
            if (set && Array.isArray(set.cards) && set.cards.length > 0) {
              allCards = set.cards.map((r: any) => r)
              break
            }
          } catch (e) {
            // ignore and try next lang
          }
        }
      }

      // Next try series/serie queries
      if (allCards.length === 0 && serieName) {
        const serie = String(serieName)
        // Try SDK queries for serie/series
        for (const key of ['serie', 'series', 'seriesName']) {
          try {
            const sdk = new TCGdex(collectionSelectedLanguage.value as any)
            const q: any = Query.create()
            q.contains('serie.name', serie)
            const res = await sdk.card.list(q)
            if (Array.isArray(res) && res.length > 0) { allCards = res; break }
            if ((res as any)?.data && Array.isArray((res as any).data)) { allCards = (res as any).data; break }
          } catch (e) {
            // ignore
          }
        }
      }

      // Fallback: search by pokemon name
      if (allCards.length === 0 && pokemonName) {
        try {
          const sdk = new TCGdex(collectionSelectedLanguage.value as any)
          const q = Query.create().contains('name', String(pokemonName).toLowerCase())
          const res = await sdk.card.list(q)
          if (Array.isArray(res)) allCards = res
          else if ((res as any)?.data && Array.isArray((res as any).data)) allCards = (res as any).data
        } catch (e) {
          // ignore
        }
      }

      // If still empty, set totals to zero
      if (!allCards || allCards.length === 0) {
        collectionCards.value = []
        collectionTotal.value = 0
        return
      }

      // Optionally fetch details for each card (to ensure image fields, etc.)
      const detailed = await Promise.all(allCards.map(async (c: any) => {
        try {
          const sdk = new TCGdex(collectionSelectedLanguage.value as any)
          const dr = await sdk.card.get(c.id)
          if (dr) return dr
        } catch (e) {
          // ignore
        }
        return c
      }))

      collectionTotal.value = detailed.length

      // client-side paginate
      const start = (collectionCurrentPage.value - 1) * Number(collectionItemsPerPage.value)
      const end = start + Number(collectionItemsPerPage.value)
      collectionCards.value = detailed.slice(start, end)
    } catch (e) {
      console.error('Error fetching collection cards', e)
      collectionCards.value = []
      collectionTotal.value = 0
    } finally {
      if (collSpinnerTimer) { clearTimeout(collSpinnerTimer); collSpinnerTimer = null }
      if (collSkeletonTimer) { clearTimeout(collSkeletonTimer); collSkeletonTimer = null }
      collectionLoading.value = false
      collectionShowSkeleton.value = false
    }
  }



  const collectionNavigateToCard = (cardId: string) => {
    router.push(`/tcg/${cardId}`)
  }

  const onCollectionCardClick = (event: MouseEvent, cardId: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) {
      return
    }
    event.preventDefault()
    collectionNavigateToCard(cardId)
  }

  // Pagination helpers for the collection list (copied/adapted from PokemonTCGCards.vue)
  const collectionTotalPages = computed(() => Math.max(1, Math.ceil(collectionTotal.value / Number(collectionItemsPerPage.value))))

  const collectionStartIndex = computed(() => (collectionCurrentPage.value - 1) * Number(collectionItemsPerPage.value))
  const collectionEndIndex = computed(() => collectionStartIndex.value + Number(collectionItemsPerPage.value))

  const collectionVisiblePages = computed(() => {
    const total = collectionTotalPages.value
    const current = collectionCurrentPage.value
    const pages: (number | string)[] = []

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (current > 3) {
        pages.push('...')
      }

      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (current < total - 2) {
        pages.push('...')
      }

      pages.push(total)
    }

    return pages
  })

  const collectionGoToPage = (page: number) => {
    if (page < 1 || page > collectionTotalPages.value) return
    collectionCurrentPage.value = page
    const element = document.querySelector('[data-tcg-cards]')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // watch relevant inputs
  watch([() => pokedexList.value.length, collectionSelectedLanguage, collectionCurrentPage, collectionItemsPerPage], () => {
    // Reset to page 1 when name changes
    if (collectionCurrentPage.value < 1) collectionCurrentPage.value = 1
    fetchCollectionCards()
  })

  // Also refetch when card.name becomes available
  watch(card, () => {
    fetchCollectionCards()
  })

  // cleanup collection timers on unmount
  onBeforeUnmount(() => {
    if (collSpinnerTimer) clearTimeout(collSpinnerTimer)
    if (collSkeletonTimer) clearTimeout(collSkeletonTimer)
  })
</script>
