<template>
  <Card>
    <CardHeader>
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <CardTitle class="flex items-center gap-2">
          <Shield class="w-5 h-5" />
          Type Effectiveness
        </CardTitle>
        <div class="flex gap-3">
          <Button :variant="mode === 'defense' ? 'default' : 'outline'" size="default" @click="mode = 'defense'"
            class="flex-1 md:flex-none">
            🛡️ Defense
          </Button>
          <Button :variant="mode === 'attack' ? 'default' : 'outline'" size="default" @click="mode = 'attack'"
            class="flex-1 md:flex-none">
            ⚔️ Attack
          </Button>
        </div>
      </div>
      <p class="text-sm text-muted-foreground mt-2">
        {{ mode === 'defense'
          ? 'Damage taken from attacking types'
          : 'Damage dealt to defending types'
        }}
      </p>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-muted-foreground">Loading type data...</p>
      </div>

      <div v-else class="space-y-4">
        <!-- No Damage (0×) -->
        <div v-if="noDamage.length > 0" class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">No Damage:</p>
            <div class="flex items-center justify-center w-16 h-8 bg-gray-100 dark:bg-gray-800 rounded-md border">
              <span class="text-sm font-bold">0×</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <TooltipProvider v-for="type in noDamage" :key="type">
              <Tooltip>
                <TooltipTrigger>
                  <Badge :class="getTypeClass(type)" class="text-white text-sm py-1 px-3">
                    {{ getTypeEmoji(type) }} <span class="capitalize ml-1">{{ type }}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="capitalize">{{ type }} type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Quarter Damage (¼×) -->
        <div v-if="quarterDamage.length > 0" class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">Quarter Damage:</p>
            <div
              class="flex items-center justify-center w-16 h-8 bg-green-100 dark:bg-green-900 rounded-md border border-green-300 dark:border-green-700">
              <span class="text-sm font-bold text-green-700 dark:text-green-300">¼×</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <TooltipProvider v-for="type in quarterDamage" :key="type">
              <Tooltip>
                <TooltipTrigger>
                  <Badge :class="getTypeClass(type)" class="text-white text-sm py-1 px-3">
                    {{ getTypeEmoji(type) }} <span class="capitalize ml-1">{{ type }}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="capitalize">{{ type }} type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Half Damage (½×) -->
        <div v-if="halfDamage.length > 0" class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">Half Damage:</p>
            <div
              class="flex items-center justify-center w-16 h-8 bg-lime-100 dark:bg-lime-900 rounded-md border border-lime-300 dark:border-lime-700">
              <span class="text-sm font-bold text-lime-700 dark:text-lime-300">½×</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <TooltipProvider v-for="type in halfDamage" :key="type">
              <Tooltip>
                <TooltipTrigger>
                  <Badge :class="getTypeClass(type)" class="text-white text-sm py-1 px-3">
                    {{ getTypeEmoji(type) }} <span class="capitalize ml-1">{{ type }}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="capitalize">{{ type }} type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Double Damage (2×) -->
        <div v-if="doubleDamage.length > 0" class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">Double Damage:</p>
            <div
              class="flex items-center justify-center w-16 h-8 bg-orange-100 dark:bg-orange-900 rounded-md border border-orange-300 dark:border-orange-700">
              <span class="text-sm font-bold text-orange-700 dark:text-orange-300">2×</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <TooltipProvider v-for="type in doubleDamage" :key="type">
              <Tooltip>
                <TooltipTrigger>
                  <Badge :class="getTypeClass(type)" class="text-white text-sm py-1 px-3">
                    {{ getTypeEmoji(type) }} <span class="capitalize ml-1">{{ type }}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="capitalize">{{ type }} type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Quadruple Damage (4×) -->
        <div v-if="quadDamage.length > 0" class="space-y-2">
          <div class="flex items-center gap-2">
            <p class="text-sm font-semibold">Quadruple Damage:</p>
            <div
              class="flex items-center justify-center w-16 h-8 bg-red-100 dark:bg-red-900 rounded-md border border-red-300 dark:border-red-700">
              <span class="text-sm font-bold text-red-700 dark:text-red-300">4×</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <TooltipProvider v-for="type in quadDamage" :key="type">
              <Tooltip>
                <TooltipTrigger>
                  <Badge :class="getTypeClass(type)" class="text-white text-sm py-1 px-3">
                    {{ getTypeEmoji(type) }} <span class="capitalize ml-1">{{ type }}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p class="capitalize">{{ type }} type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="noDamage.length === 0 && quarterDamage.length === 0 && halfDamage.length === 0 && doubleDamage.length === 0 && quadDamage.length === 0"
          class="text-center py-8">
          <p class="text-muted-foreground">No special type interactions</p>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Badge } from '@/components/ui/badge'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { Shield } from 'lucide-vue-next'
  import { TYPES } from '@/stores/types'
  import type { PokemonDetailData } from '@/composables/usePokemonDetail'

  const props = defineProps<{
    pokemon: PokemonDetailData
  }>()

  const mode = ref<'defense' | 'attack'>('defense')
  const typeData = ref<Record<string, any>>({})
  const isLoading = ref(true)

  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-orange-500',
    water: 'bg-blue-400',
    electric: 'bg-yellow-500',
    grass: 'bg-lime-500',
    ice: 'bg-teal-500',
    fighting: 'bg-red-600',
    poison: 'bg-purple-600',
    ground: 'bg-yellow-400',
    flying: 'bg-violet-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-600',
    rock: 'bg-yellow-600',
    dragon: 'bg-indigo-500',
    ghost: 'bg-purple-500',
    dark: 'bg-gray-800',
    steel: 'bg-gray-400',
    fairy: 'bg-pink-400',
  }

  const getTypeClass = (name: string) => TYPE_CLASSES[name] || 'bg-gray-400'

  const getTypeEmoji = (name: string) => {
    return TYPES[name as keyof typeof TYPES]?.emoji || '⭐'
  }

  const typeEffectiveness = computed(() => {
    if (mode.value === 'defense') {
      return calculateDefensiveEffectiveness()
    } else {
      return calculateOffensiveEffectiveness()
    }
  })

  const calculateDefensiveEffectiveness = () => {
    const multipliers: Record<string, number> = {}

    // Initialize all types with 1x multiplier
    Object.keys(TYPES).forEach(type => {
      multipliers[type] = 1
    })

    // Calculate defensive multipliers for each of the Pokémon's types
    props.pokemon.types.forEach(t => {
      const typeName = t.type.name
      const data = typeData.value[typeName]

      if (data?.damage_relations) {
        // Double damage from (weaknesses)
        data.damage_relations.double_damage_from?.forEach((type: any) => {
          multipliers[type.name] = (multipliers[type.name] || 1) * 2
        })

        // Half damage from (resistances)
        data.damage_relations.half_damage_from?.forEach((type: any) => {
          multipliers[type.name] = (multipliers[type.name] || 1) * 0.5
        })

        // No damage from (immunities)
        data.damage_relations.no_damage_from?.forEach((type: any) => {
          multipliers[type.name] = 0
        })
      }
    })

    // Categorize types by their multiplier
    const noDamage: string[] = []
    const quarterDamage: string[] = []
    const halfDamage: string[] = []
    const doubleDamage: string[] = []
    const quadDamage: string[] = []

    Object.entries(multipliers).forEach(([type, mult]) => {
      if (mult === 0) noDamage.push(type)
      else if (mult === 0.25) quarterDamage.push(type)
      else if (mult === 0.5) halfDamage.push(type)
      else if (mult === 2) doubleDamage.push(type)
      else if (mult === 4) quadDamage.push(type)
    })

    return { noDamage, quarterDamage, halfDamage, doubleDamage, quadDamage }
  }

  const calculateOffensiveEffectiveness = () => {
    const superEffective = new Set<string>()
    const notVeryEffective = new Set<string>()
    const noEffect = new Set<string>()

    props.pokemon.types.forEach(t => {
      const typeName = t.type.name
      const data = typeData.value[typeName]

      if (data?.damage_relations) {
        // Super effective against
        data.damage_relations.double_damage_to?.forEach((type: any) => {
          superEffective.add(type.name)
        })

        // Not very effective against
        data.damage_relations.half_damage_to?.forEach((type: any) => {
          notVeryEffective.add(type.name)
        })

        // No effect against
        data.damage_relations.no_damage_to?.forEach((type: any) => {
          noEffect.add(type.name)
        })
      }
    })

    return {
      noDamage: Array.from(noEffect),
      quarterDamage: [], // Offensive doesn't have quarter damage
      halfDamage: Array.from(notVeryEffective),
      doubleDamage: Array.from(superEffective),
      quadDamage: [], // Offensive doesn't have quad damage from single type
    }
  }

  const noDamage = computed(() => typeEffectiveness.value.noDamage)
  const quarterDamage = computed(() => typeEffectiveness.value.quarterDamage)
  const halfDamage = computed(() => typeEffectiveness.value.halfDamage)
  const doubleDamage = computed(() => typeEffectiveness.value.doubleDamage)
  const quadDamage = computed(() => typeEffectiveness.value.quadDamage)

  const fetchTypeData = async () => {
    isLoading.value = true

    try {
      const promises = props.pokemon.types.map(async (t) => {
        const res = await fetch(t.type.url)
        if (res.ok) {
          const data = await res.json()
          typeData.value[t.type.name] = data
        }
      })

      await Promise.all(promises)
    } catch (e) {
      console.error('Failed to fetch type data:', e)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(() => {
    fetchTypeData()
  })

  watch(() => props.pokemon.id, () => {
    fetchTypeData()
  })
</script>
