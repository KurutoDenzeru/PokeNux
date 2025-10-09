<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <BarChart3 class="w-5 h-5" />
        Base Stats
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div v-for="stat in stats" :key="stat.name" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="font-medium w-20">{{ stat.label }}</span>
            <span class="font-bold text-primary w-12 text-right">{{ stat.base }}</span>
            <div class="flex-1 mx-4">
              <Progress :model-value="stat.percentage" class="h-2" />
            </div>
            <div class="flex gap-2 text-xs text-muted-foreground">
              <span class="w-12 text-right">{{ stat.min }}</span>
              <span>-</span>
              <span class="w-12">{{ stat.max }}</span>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t">
          <div class="flex items-center justify-between font-bold">
            <span>Total</span>
            <span class="text-lg text-primary">{{ totalStats }}</span>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart3 } from 'lucide-vue-next'
import type { PokemonDetailData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
}>()

const statLabels: Record<string, string> = {
  'hp': 'HP',
  'attack': 'Attack',
  'defense': 'Defense',
  'special-attack': 'Sp. Atk',
  'special-defense': 'Sp. Def',
  'speed': 'Speed',
}

const calculateMinMax = (base: number, statName: string) => {
  const isHP = statName === 'hp'
  const level = 100
  const iv = 31
  const ev = 252

  if (isHP) {
    const min = Math.floor(((2 * base + 0 + 0) * level) / 100) + level + 10
    const max = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
    return { min, max }
  } else {
    const min = Math.floor(((2 * base + 0 + 0) * level) / 100) + 5
    const max = Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5
    return { min, max }
  }
}

const stats = computed(() => {
  return props.pokemon.stats.map(s => {
    const { min, max } = calculateMinMax(s.base_stat, s.stat.name)
    return {
      name: s.stat.name,
      label: statLabels[s.stat.name] || s.stat.name,
      base: s.base_stat,
      min,
      max,
      percentage: Math.min((s.base_stat / 255) * 100, 100)
    }
  })
})

const totalStats = computed(() => {
  return props.pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)
})
</script>
