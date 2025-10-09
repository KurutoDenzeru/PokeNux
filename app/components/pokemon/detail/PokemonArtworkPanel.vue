<template>
  <Card class="sticky top-20">
    <CardHeader>
      <CardTitle class="text-center capitalize">{{ pokemon.name }}</CardTitle>
    </CardHeader>
    <CardContent class="flex flex-col items-center space-y-4">
      <!-- Artwork Image -->
      <div
        class="relative w-full aspect-square flex items-center justify-center bg-gradient-to-br from-background to-muted rounded-lg p-4">
        <img :src="artworkUrl" :alt="pokemon.name" class="w-full h-full object-contain animate-subtle-bounce" />
      </div>

      <!-- Type Badges -->
      <div class="flex flex-wrap gap-2 justify-center w-full">
        <Badge 
          v-for="type in pokemon.types" 
          :key="type.type.name"
          :class="getTypeClass(type.type.name)"
          class="px-3 py-1 text-white font-semibold"
        >
          <span class="mr-1">{{ getTypeEmoji(type.type.name) }}</span>
          {{ capitalize(type.type.name) }}
        </Badge>
      </div>

      <!-- Toggle Buttons -->
      <div class="flex gap-2 w-full">
        <Button :variant="!isShiny ? 'default' : 'outline'" class="flex-1" @click="$emit('update:isShiny', false)">
          Normal
        </Button>
        <Button :variant="isShiny ? 'default' : 'outline'" class="flex-1" @click="$emit('update:isShiny', true)">
          ✨ Shiny
        </Button>
      </div>

      <!-- Cry Buttons -->
      <div class="flex gap-2 w-full">
        <Button 
          v-if="cryLatest" 
          variant="outline" 
          size="sm"
          @click="playCry(cryLatest)"
          class="flex-1 flex items-center justify-center gap-2"
        >
          <Volume2 class="w-4 h-4" /> Latest
        </Button>
        <Button 
          v-if="cryLegacy" 
          variant="outline" 
          size="sm"
          @click="playCry(cryLegacy)"
          class="flex-1 flex items-center justify-center gap-2"
        >
          <Radio class="w-4 h-4" /> Legacy
        </Button>
      </div>

      <!-- Translated Names -->
      <div class="w-full space-y-2">
        <h3 class="font-semibold text-sm text-muted-foreground">Translated Names</h3>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div v-for="name in translatedNames" :key="name.language" class="flex flex-col">
            <span class="text-muted-foreground text-xs uppercase">{{ name.language }}</span>
            <span class="font-medium">{{ name.name }}</span>
          </div>
        </div>
      </div>

      <!-- Prev/Next Navigator -->
      <div class="w-full pt-4 border-t space-y-3">
        <div class="flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" :disabled="pokemon.id <= 1" @click="$emit('prev')" class="flex-1">
            ← Prev
          </Button>
          <Button variant="outline" size="sm" :disabled="pokemon.id >= 1025" @click="$emit('next')" class="flex-1">
            Next →
          </Button>
        </div>

        <!-- Mini Cards for Prev/Next -->
        <div class="grid grid-cols-2 gap-2">
          <!-- Previous Pokémon -->
          <div v-if="pokemon.id > 1" class="border rounded-lg p-2 hover:bg-accent cursor-pointer transition-colors"
            @click="$emit('prev')">
            <img
              :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id - 1}.png`"
              class="w-full aspect-square object-contain" loading="lazy" />
            <p class="text-xs text-center text-muted-foreground mt-1">
              #{{ String(pokemon.id - 1).padStart(4, '0') }}
            </p>
          </div>

          <!-- Next Pokémon -->
          <div v-if="pokemon.id < 1025" class="border rounded-lg p-2 hover:bg-accent cursor-pointer transition-colors"
            @click="$emit('next')">
            <img
              :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id + 1}.png`"
              class="w-full aspect-square object-contain" loading="lazy" />
            <p class="text-xs text-center text-muted-foreground mt-1">
              #{{ String(pokemon.id + 1).padStart(4, '0') }}
            </p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Button from '@/components/ui/button/Button.vue'
import { Volume2, Radio } from 'lucide-vue-next'
import { TYPES } from '@/stores/types'
import { getTypeClass as getTypeClassUtil } from '@/lib/type-classes'
import type { PokemonDetailData, SpeciesData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  species: SpeciesData | null
  isShiny: boolean
  cryLatest?: string
  cryLegacy?: string
}>()

defineEmits<{
  'update:isShiny': [value: boolean]
  prev: []
  next: []
}>()

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const getTypeClass = (typeName: string) => getTypeClassUtil(typeName)

const getTypeEmoji = (typeName: string) => {
  const typeKey = typeName as keyof typeof TYPES
  return TYPES[typeKey]?.emoji || ''
}

const playCry = (url: string) => {
  const audio = new Audio(url)
  audio.play()
}

  const artworkUrl = computed(() => {
    if (props.isShiny) {
      return props.pokemon.sprites?.other?.['official-artwork']?.front_shiny ||
        props.pokemon.sprites?.front_shiny ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${props.pokemon.id}.png`
    }
    return props.pokemon.sprites?.other?.['official-artwork']?.front_default ||
      props.pokemon.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemon.id}.png`
  })

  const translatedNames = computed(() => {
    if (!props.species?.names) return []

    const languages = ['ja', 'zh-Hans', 'zh-Hant', 'ko', 'fr', 'de', 'es', 'it']
    const languageLabels: Record<string, string> = {
      'ja': 'JP',
      'zh-Hans': 'CN',
      'zh-Hant': 'TW',
      'ko': 'KR',
      'fr': 'FR',
      'de': 'DE',
      'es': 'ES',
      'it': 'IT',
    }

    return languages
      .map(lang => {
        const nameEntry = props.species?.names.find(n => n.language.name === lang)
        return nameEntry ? {
          language: languageLabels[lang] || lang,
          name: nameEntry.name
        } : null
      })
      .filter(Boolean) as Array<{ language: string; name: string }>
  })
</script>
