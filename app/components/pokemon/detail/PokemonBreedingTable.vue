<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Heart class="w-5 h-5" />
        Breeding
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell class="font-semibold">Gender</TableCell>
            <TableCell>
              <div v-if="genderRate >= 0" class="flex items-center gap-2">
                <span class="text-blue-600">♂ {{ malePercent }}%</span>
                <span class="text-pink-600">♀ {{ femalePercent }}%</span>
              </div>
              <span v-else class="text-muted-foreground">Genderless</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Growth Rate</TableCell>
            <TableCell class="capitalize">{{ growthRate }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Egg Cycle</TableCell>
            <TableCell>
              {{ hatchCounter }} cycles
              <span class="text-muted-foreground ml-2">
                ({{ hatchSteps }} steps)
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Baby Trigger</TableCell>
            <TableCell>
              <div v-if="babyTriggerItem" class="flex items-center gap-2">
                <img 
                  :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${babyTriggerItem}.png`"
                  class="w-8 h-8"
                  :alt="babyTriggerItem"
                />
                <span class="capitalize">{{ String(babyTriggerItem).replace(/-/g, ' ') }}</span>
              </div>
              <span v-else class="text-muted-foreground">None</span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Habitat</TableCell>
            <TableCell class="capitalize">{{ habitat }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Egg Groups</TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1">
                <Badge 
                  v-for="group in eggGroups" 
                  :key="group"
                  variant="secondary"
                  class="capitalize"
                >
                  {{ group.replace(/-/g, ' ') }}
                </Badge>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Heart } from 'lucide-vue-next'
import type { PokemonDetailData, SpeciesData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  species: SpeciesData | null
}>()

const babyTriggerItem = ref<string | null>(null)
const isLoadingTrigger = ref(false)

const genderRate = computed(() => props.species?.gender_rate ?? -1)

const malePercent = computed(() => {
  if (genderRate.value < 0) return 0
  return ((8 - genderRate.value) / 8 * 100).toFixed(1)
})

const femalePercent = computed(() => {
  if (genderRate.value < 0) return 0
  return (genderRate.value / 8 * 100).toFixed(1)
})

const growthRate = computed(() => {
  return props.species?.growth_rate?.name.replace(/-/g, ' ') || 'Unknown'
})

const hatchCounter = computed(() => props.species?.hatch_counter || 0)

const hatchSteps = computed(() => (hatchCounter.value + 1) * 255)

const habitat = computed(() => {
  return props.species?.habitat?.name || 'Unknown'
})

const eggGroups = computed(() => {
  return props.species?.egg_groups?.map(g => g.name) || []
})

const fetchBabyTriggerItem = async () => {
  if (!props.species?.evolution_chain?.url) return
  
  isLoadingTrigger.value = true
  try {
    const chainRes = await fetch(props.species.evolution_chain.url)
    if (!chainRes.ok) return
    
    const chainData = await chainRes.json()
    
    // Recursively search for baby trigger item in evolution chain
    const findBabyTrigger = (chain: any): string | null => {
      // Check current evolution for baby trigger
      if (chain.evolves_to && chain.evolves_to.length > 0) {
        for (const evolution of chain.evolves_to) {
          // Check if this evolution has baby trigger item
          if (evolution.evolution_details && evolution.evolution_details.length > 0) {
            for (const detail of evolution.evolution_details) {
              if (detail.held_item && detail.held_item.name) {
                // This is typically for baby Pokémon breeding (e.g., Incense items)
                return detail.held_item.name
              }
            }
          }
          
          // Recursively check next evolutions
          const result = findBabyTrigger(evolution)
          if (result) return result
        }
      }
      return null
    }
    
    // Also check if the current Pokémon species has a baby form
    // Baby Pokémon often require specific items when breeding their evolved forms
    const babyItem = findBabyTrigger(chainData.chain)
    
    if (babyItem) {
      babyTriggerItem.value = babyItem
    } else if (props.species.is_baby) {
      // If this IS a baby Pokémon, check what item is needed to breed it from parents
      // This would require checking the evolved form's data
      babyTriggerItem.value = null
    }
  } catch (e) {
    console.error('Failed to fetch baby trigger item:', e)
  } finally {
    isLoadingTrigger.value = false
  }
}

onMounted(() => {
  fetchBabyTriggerItem()
})

watch(() => props.species?.evolution_chain?.url, () => {
  fetchBabyTriggerItem()
})
</script>
