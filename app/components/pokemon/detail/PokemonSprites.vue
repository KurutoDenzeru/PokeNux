<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <CardTitle class="flex items-center gap-2">
          <Image class="w-5 h-5" />
          Sprites
        </CardTitle>
        <Button variant="outline" size="sm" @click="toggleAllAccordions" class="flex items-center gap-2">
          <component :is="allExpanded ? ChevronsUp : ChevronsDown" class="w-4 h-4" />
          {{ allExpanded ? 'Collapse All' : 'Expand All' }}
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <Accordion type="multiple" class="w-full" v-model="openAccordions">
        <!-- Main Sprites -->
        <AccordionItem value="main">
          <AccordionTrigger>Main Sprites</AccordionTrigger>
          <AccordionContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpriteCard v-if="sprites.front_default" :src="sprites.front_default" label="Front Default" />
              <SpriteCard v-if="sprites.back_default" :src="sprites.back_default" label="Back Default" />
              <SpriteCard v-if="sprites.front_shiny" :src="sprites.front_shiny" label="Front Shiny" />
              <SpriteCard v-if="sprites.back_shiny" :src="sprites.back_shiny" label="Back Shiny" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- Showdown Sprites -->
        <AccordionItem v-if="showdownSprites" value="showdown">
          <AccordionTrigger>Showdown Sprites</AccordionTrigger>
          <AccordionContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpriteCard v-if="showdownSprites.front_default" :src="showdownSprites.front_default" label="Front" />
              <SpriteCard v-if="showdownSprites.back_default" :src="showdownSprites.back_default" label="Back" />
              <SpriteCard v-if="showdownSprites.front_shiny" :src="showdownSprites.front_shiny" label="Front Shiny" />
              <SpriteCard v-if="showdownSprites.back_shiny" :src="showdownSprites.back_shiny" label="Back Shiny" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- Official Artwork -->
        <AccordionItem v-if="officialArtwork" value="artwork">
          <AccordionTrigger>Official Artwork</AccordionTrigger>
          <AccordionContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpriteCard v-if="officialArtwork.front_default" :src="officialArtwork.front_default" label="Front"
                large />
              <SpriteCard v-if="officialArtwork.front_shiny" :src="officialArtwork.front_shiny" label="Front Shiny"
                large />
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- HOME Sprites -->
        <AccordionItem v-if="homeSprites" value="home">
          <AccordionTrigger>Pokémon HOME</AccordionTrigger>
          <AccordionContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpriteCard v-if="homeSprites.front_default" :src="homeSprites.front_default" label="Front" />
              <SpriteCard v-if="homeSprites.front_shiny" :src="homeSprites.front_shiny" label="Front Shiny" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- Dream World -->
        <AccordionItem v-if="dreamWorld" value="dream">
          <AccordionTrigger>Dream World</AccordionTrigger>
          <AccordionContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpriteCard v-if="dreamWorld.front_default" :src="dreamWorld.front_default" label="Front" />
              <SpriteCard v-if="dreamWorld.front_shiny" :src="dreamWorld.front_shiny" label="Front Shiny" />
            </div>
          </AccordionContent>
        </AccordionItem>

        <!-- Generation Sprites -->
        <AccordionItem v-for="(genSprites, gen) in generationSprites" :key="gen" :value="`gen-${gen}`">
          <AccordionTrigger>Generation {{ String(gen).replace('generation-', '').toUpperCase() }}</AccordionTrigger>
          <AccordionContent>
            <div class="space-y-6">
              <!-- Static sprites (always show for Gen V, conditional for others) -->
              <div>
                <p v-if="gen === 'generation-v' && genSprites.animated" class="text-sm font-semibold mb-3 text-primary">
                  Static Sprites</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpriteCard v-if="genSprites.front_default" :src="genSprites.front_default" label="Front Default" />
                  <SpriteCard v-if="genSprites.back_default" :src="genSprites.back_default" label="Back Default" />
                  <SpriteCard v-if="genSprites.front_shiny" :src="genSprites.front_shiny" label="Front Shiny" />
                  <SpriteCard v-if="genSprites.back_shiny" :src="genSprites.back_shiny" label="Back Shiny" />
                </div>
              </div>

              <!-- Animated sprites for Gen V only -->
              <div v-if="gen === 'generation-v' && genSprites.animated">
                <p class="text-sm font-semibold mb-3 text-primary">Animated Sprites</p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SpriteCard v-if="genSprites.animated.front_default" :src="genSprites.animated.front_default"
                    label="Front Default" />
                  <SpriteCard v-if="genSprites.animated.back_default" :src="genSprites.animated.back_default"
                    label="Back Default" />
                  <SpriteCard v-if="genSprites.animated.front_shiny" :src="genSprites.animated.front_shiny"
                    label="Front Shiny" />
                  <SpriteCard v-if="genSprites.animated.back_shiny" :src="genSprites.animated.back_shiny"
                    label="Back Shiny" />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, defineComponent, h, watch } from 'vue'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
  import { Button } from '@/components/ui/button'
  import { Image, ChevronsUp, ChevronsDown } from 'lucide-vue-next'
  import type { PokemonDetailData } from '@/composables/usePokemonDetail'

  const props = defineProps<{
    pokemon: PokemonDetailData
    isShiny?: boolean
  }>()

  const openAccordions = ref<string[]>(['main'])
  const allExpanded = ref(false)

  const allAccordionValues = computed(() => {
    const values = ['main']
    if (showdownSprites.value) values.push('showdown')
    if (officialArtwork.value) values.push('artwork')
    if (homeSprites.value) values.push('home')
    if (dreamWorld.value) values.push('dream')
    Object.keys(generationSprites.value).forEach(gen => values.push(`gen-${gen}`))
    return values
  })

  const toggleAllAccordions = () => {
    if (allExpanded.value) {
      openAccordions.value = []
      allExpanded.value = false
    } else {
      openAccordions.value = allAccordionValues.value
      allExpanded.value = true
    }
  }

  // Watch for changes in openAccordions to update allExpanded state
  watch(openAccordions, (newVal) => {
    allExpanded.value = newVal.length === allAccordionValues.value.length
  }, { deep: true })

  const sprites = computed(() => props.pokemon.sprites || {})

  const showdownSprites = computed(() => {
    const showdown = sprites.value.other?.showdown
    if (!showdown) return null

    const hasSprites = showdown.front_default || showdown.back_default ||
      showdown.front_shiny || showdown.back_shiny
    return hasSprites ? showdown : null
  })

  const officialArtwork = computed(() => {
    const artwork = sprites.value.other?.['official-artwork']
    if (!artwork) return null

    const hasSprites = artwork.front_default || artwork.front_shiny
    return hasSprites ? artwork : null
  })

  const homeSprites = computed(() => {
    const home = sprites.value.other?.home
    if (!home) return null

    const hasSprites = home.front_default || home.front_shiny
    return hasSprites ? home : null
  })

  const dreamWorld = computed(() => {
    const dream = sprites.value.other?.dream_world
    if (!dream) return null

    const hasSprites = dream.front_default || dream.front_shiny
    return hasSprites ? dream : null
  })

  const generationSprites = computed(() => {
    const versions = sprites.value.versions || {}
    const generations: Record<string, any> = {}

    // Process each generation
    Object.entries(versions).forEach(([genKey, genValue]: [string, any]) => {
      // For Generation V, prioritize black-white or black-2-white-2 for animated sprites
      if (genKey === 'generation-v') {
        // Try black-2-white-2 first, then black-white
        const black2White2 = genValue?.['black-2-white-2']
        const blackWhite = genValue?.['black-white']
        const genVData = black2White2 || blackWhite

        if (genVData) {
          const hasStaticSprites = genVData.front_default || genVData.back_default ||
            genVData.front_shiny || genVData.back_shiny
          const hasAnimatedSprites = genVData.animated?.front_default || genVData.animated?.back_default ||
            genVData.animated?.front_shiny || genVData.animated?.back_shiny

          if (hasStaticSprites || hasAnimatedSprites) {
            // Include both static and animated sprites
            generations[genKey] = {
              front_default: genVData.front_default,
              back_default: genVData.back_default,
              front_shiny: genVData.front_shiny,
              back_shiny: genVData.back_shiny,
              animated: genVData.animated || null
            }
          }
        }
      } else {
        // For other generations, get the first available game version
        const gameVersions = Object.values(genValue || {})
        if (gameVersions.length > 0) {
          const firstVersion = gameVersions[0] as any

          // Check if this version has any sprites
          const hasSprites = firstVersion?.front_default || firstVersion?.back_default ||
            firstVersion?.front_shiny || firstVersion?.back_shiny

          if (hasSprites) {
            generations[genKey] = firstVersion
          }
        }
      }
    })

    return generations
  })

  // Sprite Card Component
  const SpriteCard = defineComponent({
    name: 'SpriteCard',
    props: {
      src: { type: String, required: true },
      label: { type: String, required: true },
      large: { type: Boolean, default: false }
    },
    setup(props) {
      return () => h('div', {
        class: 'border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2'
      }, [
        h('div', {
          class: props.large ? 'w-32 h-32' : 'w-24 h-24'
        }, [
          h('img', {
            src: props.src,
            alt: props.label,
            class: 'w-full h-full object-contain pixelated',
            style: 'image-rendering: pixelated; image-rendering: -moz-crisp-edges; image-rendering: crisp-edges;'
          })
        ]),
        h('p', { class: 'text-xs text-center text-muted-foreground font-medium' }, props.label)
      ])
    }
  })
</script>

<style scoped>
  .pixelated {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
</style>
