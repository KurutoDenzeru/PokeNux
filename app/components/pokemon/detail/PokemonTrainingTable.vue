<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Swords class="w-5 h-5" />
        Training
      </CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell class="font-semibold">EV Yield</TableCell>
            <TableCell>{{ evYield }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Catch Rate</TableCell>
            <TableCell>
              {{ catchRate }}
              <span class="text-muted-foreground ml-2">
                ({{ catchPercentage }}%)
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Base Happiness</TableCell>
            <TableCell>
              {{ baseHappiness }}
              <Badge variant="secondary" class="ml-2">{{ happinessNote }}</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Base XP</TableCell>
            <TableCell>{{ pokemon.base_experience || 0 }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Held Items</TableCell>
            <TableCell>
              <div v-if="heldItems.length > 0" class="flex flex-col gap-2">
                <div v-for="item in heldItems" :key="item.name" class="flex items-center gap-2">
                  <img 
                    :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`"
                    class="w-6 h-6"
                    :alt="item.name"
                  />
                  <span class="capitalize text-sm">{{ item.name.replace(/-/g, ' ') }}</span>
                  <span class="text-xs text-muted-foreground">({{ item.rarity }}%)</span>
                </div>
              </div>
              <span v-else class="text-muted-foreground">None</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Swords } from 'lucide-vue-next'
import type { PokemonDetailData, SpeciesData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  species: SpeciesData | null
}>()

const evYield = computed(() => {
  const efforts = props.pokemon.stats
    .filter(s => s.effort > 0)
    .map(s => `${s.effort} ${s.stat.name.replace('special-', 'Sp').replace('-', '')}`)
  return efforts.length > 0 ? efforts.join(', ') : 'None'
})

const catchRate = computed(() => props.species?.capture_rate || 0)

const catchPercentage = computed(() => {
  const rate = catchRate.value
  return ((rate / 255) * 100).toFixed(1)
})

const baseHappiness = computed(() => props.species?.base_happiness || 0)

const happinessNote = computed(() => {
  const happiness = baseHappiness.value
  if (happiness < 50) return 'Low'
  if (happiness < 100) return 'Normal'
  return 'High'
})

const heldItems = computed(() => {
  return props.pokemon.held_items.map(item => ({
    name: item.item.name,
    rarity: item.version_details[0]?.rarity || 0
  }))
})
</script>
