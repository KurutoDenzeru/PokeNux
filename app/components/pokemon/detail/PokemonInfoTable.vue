<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Info class="w-5 h-5" />
        Pokémon Information
      </CardTitle>
    </CardHeader>
    <CardContent>
      <!-- Description -->
      <div v-if="flavorText" class="mb-4 p-4 bg-muted/30 rounded-lg border">
        <p class="text-muted-foreground leading-relaxed">
          {{ flavorText }}
        </p>
      </div>

      <Table>
        <TableBody>
          <TableRow>
            <TableCell class="font-semibold">Pokémon No.</TableCell>
            <TableCell>#{{ String(pokemon.id).padStart(4, '0') }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Introduced</TableCell>
            <TableCell class="capitalize">{{ generation }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Category</TableCell>
            <TableCell>{{ category }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Weight</TableCell>
            <TableCell>
              {{ (pokemon.weight / 10).toFixed(1) }} kg
              <span class="text-muted-foreground ml-2">
                ({{ (pokemon.weight * 0.220462).toFixed(1) }} lbs)
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Height</TableCell>
            <TableCell>
              {{ (pokemon.height / 10).toFixed(1) }} m
              <span class="text-muted-foreground ml-2">
                ({{ Math.floor((pokemon.height * 3.937) / 12) }}'{{ Math.round((pokemon.height * 3.937) % 12) }}")
              </span>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold align-top">Abilities</TableCell>
            <TableCell>
              <div class="flex flex-col gap-2">
                <div 
                  v-for="ability in pokemon.abilities" 
                  :key="ability.ability.name"
                  class="flex flex-col"
                >
                  <div class="flex items-center gap-2">
                    <span class="capitalize">{{ ability.ability.name.replace(/-/g, ' ') }}</span>
                    <Badge v-if="ability.is_hidden" variant="secondary" class="text-xs">Hidden</Badge>
                  </div>
                  <p v-if="abilityDescriptions[ability.ability.name]" class="text-xs text-muted-foreground mt-1">
                    {{ abilityDescriptions[ability.ability.name] }}
                  </p>
                </div>
              </div>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Shape</TableCell>
            <TableCell class="capitalize">{{ shape }}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell class="font-semibold">Color</TableCell>
            <TableCell class="capitalize">{{ color }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-vue-next'
import type { PokemonDetailData, SpeciesData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  species: SpeciesData | null
}>()

const abilityDescriptions = ref<Record<string, string>>({})

const generation = computed(() => {
  if (!props.species?.generation?.name) return 'Unknown'
  return props.species.generation.name.replace('generation-', 'Generation ')
})

const category = computed(() => {
  if (!props.species?.genera) return 'Unknown'
  const english = props.species.genera.find(g => g.language.name === 'en')
  return english?.genus || 'Unknown'
})

const shape = computed(() => props.species?.shape?.name || 'Unknown')
const color = computed(() => props.species?.color?.name || 'Unknown')

const flavorText = computed(() => {
  if (!props.species?.flavor_text_entries) return ''
  const english = props.species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  )
  return english?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') || ''
})

onMounted(async () => {
  // Fetch ability descriptions
  for (const ability of props.pokemon.abilities) {
    try {
      const res = await fetch(ability.ability.url)
      if (res.ok) {
        const data = await res.json()
        const entry = data.effect_entries?.find((e: any) => e.language.name === 'en')
        if (entry) {
          abilityDescriptions.value[ability.ability.name] = entry.short_effect || entry.effect
        }
      }
    } catch (e) {
      // ignore
    }
  }
})
</script>
