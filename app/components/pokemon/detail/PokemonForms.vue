<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Sparkles class="w-5 h-5" />
        Forms & Varieties
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="filteredVarieties.length > 0" class="grid grid-cols-2 gap-3">
        <div 
          v-for="variety in filteredVarieties" 
          :key="variety.name"
          class="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
          @click="navigateToVariety(variety.pokemonId)"
        >
          <img 
            :src="variety.sprite"
            class="w-full aspect-square object-contain mb-2"
            loading="lazy"
            @error="(e: Event) => { const target = e.target as HTMLImageElement; if (target) target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }"
          />
          <p class="text-sm font-medium text-center capitalize">
            {{ variety.displayName }}
          </p>
        </div>
      </div>
      <div v-else class="text-center text-muted-foreground py-4">
        No alternative forms
      </div>

      <div v-if="hasGenderDifferences" class="mt-4 pt-4 border-t">
        <p class="text-sm font-semibold mb-2">Gender Differences</p>
        <Badge variant="secondary">Has visual differences</Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-vue-next'
import type { PokemonDetailData, SpeciesData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  species: SpeciesData | null
  isShiny?: boolean
}>()

const router = useRouter()
const varietyData = ref<Record<string, any>>({})

const navigateToVariety = (pokemonId: string) => {
  router.push(`/pokemon/${pokemonId}`)
}

const filteredVarieties = computed(() => {
  if (!props.species?.varieties) return []
  
  // Show all varieties except the current one
  const currentPokemonName = props.pokemon.name
  const otherVarieties = props.species.varieties.filter(v => v.pokemon.name !== currentPokemonName)
  
  return otherVarieties.map(v => {
    const data = varietyData.value[v.pokemon.name]
    const pokemonId = v.pokemon.url.split('/').filter(Boolean).pop()
    
    // Extract form name for better display
    let displayName = v.pokemon.name.replace(`${props.species?.name}-`, '').replace(/-/g, ' ')
    
    // If this is the default form, show it as "Original" or just the base name
    if (v.is_default) {
      displayName = 'Original'
    }
    
    // Get the appropriate sprite based on shiny toggle
    let sprite = data?.sprites?.other?.['official-artwork']?.front_default || 
                 data?.sprites?.front_default ||
                 `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
    
    if (props.isShiny) {
      sprite = data?.sprites?.other?.['official-artwork']?.front_shiny || 
               data?.sprites?.front_shiny ||
               `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonId}.png`
    }
    
    return {
      name: v.pokemon.name,
      displayName: displayName,
      sprite,
      isDefault: v.is_default,
      pokemonId: pokemonId || '1'
    }
  })
})

const hasGenderDifferences = computed(() => {
  return props.species?.has_gender_differences || false
})

onMounted(async () => {
  // Fetch sprite data for each variety
  if (props.species?.varieties) {
    for (const variety of props.species.varieties) {
      if (!variety.is_default) {
        try {
          const res = await fetch(variety.pokemon.url)
          if (res.ok) {
            varietyData.value[variety.pokemon.name] = await res.json()
          }
        } catch (e) {
          // ignore
        }
      }
    }
  }
})

// Watch for shiny toggle changes
watch(() => props.isShiny, () => {
  // Force reactivity update
  filteredVarieties.value
})
</script>
