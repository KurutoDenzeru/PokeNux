<template>
  <div class="space-y-6">
    <!-- Type Coverage -->
    <div>
      <h3 class="font-semibold mb-4 text-base md:text-lg">Type Coverage</h3>
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <div
          v-for="type in allTypes"
          :key="type"
          :class="[
            'p-3 rounded text-center text-xs font-medium transition-colors',
            (coverage[type] || 0) > 0
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-secondary text-muted-foreground'
          ]"
        >
          <p class="capitalize font-semibold">{{ type }}</p>
          <p class="text-xs opacity-75 mt-1">{{ coverage[type] || 0 }}</p>
        </div>
      </div>
    </div>

    <!-- Weaknesses -->
    <div>
      <h3 class="font-semibold mb-4 text-base md:text-lg">Team Weaknesses (4x)</h3>
      <div v-if="criticalWeaknesses.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="type in criticalWeaknesses"
          :key="type"
          :class="getTypeClasses(type)"
          class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 border text-white"
        >
          <span class="text-sm">{{ getTypeEmoji(type) }}</span>
          <span class="capitalize">{{ type }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-muted-foreground">None detected</div>
    </div>

    <!-- Resistances -->
    <div>
      <h3 class="font-semibold mb-4 text-base md:text-lg">Team Resistances</h3>
      <div v-if="resistances.length > 0" class="flex flex-wrap gap-2">
        <div
          v-for="type in resistances"
          :key="type"
          :class="getTypeClasses(type)"
          class="px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 border text-white"
        >
          <span class="text-sm">{{ getTypeEmoji(type) }}</span>
          <span class="capitalize">{{ type }}</span>
        </div>
      </div>
      <div v-else class="text-sm text-muted-foreground">None detected</div>
    </div>

    <!-- Team Diversity -->
    <div>
      <h3 class="font-semibold mb-4 text-base md:text-lg">Diversity</h3>
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span>Type Variety</span>
            <span class="font-medium">{{ uniqueTypes }}/18</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-3">
            <div
              class="bg-emerald-500 h-3 rounded-full transition-all"
              :style="{ width: `${(uniqueTypes / 18) * 100}%` }"
            />
          </div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span>Team Completion</span>
            <span class="font-medium">{{ filledSlots }}/6</span>
          </div>
          <div class="w-full bg-secondary rounded-full h-3">
            <div
              class="bg-emerald-500 h-3 rounded-full transition-all"
              :style="{ width: `${(filledSlots / 6) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Team Members Types Preview -->
    <div>
      <h3 class="font-semibold mb-4 text-base md:text-lg">Team Types</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div
          v-for="(member, idx) in props.team.members"
          :key="idx"
          v-show="member.pokemonId"
          class="p-3 rounded-lg bg-secondary"
        >
          <p class="font-medium text-sm mb-2 capitalize">{{ member.pokemonName }}</p>
          <div class="flex flex-wrap gap-1">
            <div
              v-for="type in getMemberTypes(member.pokemonId)"
              :key="type"
              :class="getTypeClasses(type)"
              class="px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 border text-white"
            >
              <span class="text-sm">{{ getTypeEmoji(type) }}</span>
              <span class="capitalize">{{ type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type Team } from '@/stores/teamBuilder'

interface Props {
  team: Team
}

const props = defineProps<Props>()

const allTypes = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

// Type effectiveness data
const typeChart: Record<string, { weak: string[], resist: string[], immune: string[] }> = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['steel', 'fire', 'water', 'ice'], immune: [] },
  electric: { weak: ['ground'], resist: ['flying', 'steel', 'electric'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['ground', 'water', 'grass', 'electric'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['rock', 'bug', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['fighting', 'poison', 'bug', 'grass'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['fighting', 'bug', 'grass'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['fighting', 'ground', 'grass'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'flying', 'poison', 'fire'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'grass', 'electric'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'water', 'ground'], resist: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: [] }
}

const coverage = ref<Record<string, number>>({})
const teamTypes = ref<string[]>([])
const criticalWeaknesses = ref<string[]>([])
const resistances = ref<string[]>([])
const memberTypes = ref<Record<number, string[]>>({})
const filledSlots = computed(() => props.team.members.filter(m => m.pokemonId).length)
const uniqueTypes = computed(() => new Set(teamTypes.value).size)

// Get types for a specific member
const getMemberTypes = (pokemonId: number | null): string[] => {
  if (!pokemonId) return []
  return memberTypes.value[pokemonId] || []
}

// Fetch pokemon types and calculate coverage
const calculateCoverage = async () => {
  coverage.value = {}
  allTypes.forEach(t => coverage.value[t] = 0)

  teamTypes.value = []
  memberTypes.value = {}
  const allPokemonTypes = new Set<string>()
  const weaknessMap: Record<string, number> = {}

  try {
    for (const member of props.team.members) {
      if (member.pokemonId) {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${member.pokemonId}`
        )
        const data = await response.json()

        // Collect types
        const memberTypesList: string[] = []
        data.types.forEach((t: any) => {
          const typeName = t.type.name
          memberTypesList.push(typeName)
          allPokemonTypes.add(typeName)
          teamTypes.value.push(typeName)
        })
        memberTypes.value[member.pokemonId] = memberTypesList

        // Calculate team weaknesses
        data.types.forEach((t: any) => {
          const weaknesses = typeChart[t.type.name]?.weak || []
          weaknesses.forEach(weakness => {
            weaknessMap[weakness] = (weaknessMap[weakness] || 0) + 1
          })
        })
      }
    }

    // Find 4x weaknesses
    criticalWeaknesses.value = Object.entries(weaknessMap)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type)

    // Calculate resistances
    const resistanceMap: Record<string, number> = {}
    for (const type of allPokemonTypes) {
      const resists = typeChart[type]?.resist || []
      resists.forEach(resist => {
        resistanceMap[resist] = (resistanceMap[resist] || 0) + 1
      })
    }

    resistances.value = Object.entries(resistanceMap)
      .filter(([_, count]) => count >= 2)
      .map(([type]) => type)
  } catch (error) {
    console.error('Failed to calculate coverage:', error)
  }
}

watch(() => props.team.members, calculateCoverage, { deep: true, immediate: true })

// Type emoji mapping
const TYPE_EMOJI: Record<string, string> = {
  normal: '⭐',
  fire: '🔥',
  water: '💧',
  electric: '⚡',
  grass: '🌿',
  ice: '❄️',
  fighting: '🥊',
  poison: '🧪',
  ground: '🌍',
  flying: '🕊️',
  psychic: '🔮',
  bug: '🐛',
  rock: '🗿',
  dragon: '🐉',
  ghost: '👻',
  dark: '🌙',
  steel: '⚙️',
  fairy: '🧚'
}

// Get type emoji
const getTypeEmoji = (type: string): string => {
  return TYPE_EMOJI[type] || '⭐'
}

// Type styling - light and dark mode support (like TypeFilter.vue)
const TYPE_CLASSES: Record<string, string> = {
  normal: 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400',
  fire: 'bg-orange-500 dark:bg-transparent dark:border-orange-500 dark:text-orange-500',
  water: 'bg-blue-500 dark:bg-transparent dark:border-blue-400 dark:text-blue-400',
  electric: 'bg-yellow-500 dark:bg-transparent dark:border-yellow-400 dark:text-yellow-400',
  grass: 'bg-green-500 dark:bg-transparent dark:border-green-500 dark:text-green-400',
  ice: 'bg-cyan-500 dark:bg-transparent dark:border-cyan-400 dark:text-cyan-400',
  fighting: 'bg-red-600 dark:bg-transparent dark:border-red-600 dark:text-red-500',
  poison: 'bg-purple-500 dark:bg-transparent dark:border-purple-500 dark:text-purple-400',
  ground: 'bg-amber-600 dark:bg-transparent dark:border-amber-600 dark:text-amber-500',
  flying: 'bg-indigo-400 dark:bg-transparent dark:border-indigo-400 dark:text-indigo-400',
  psychic: 'bg-pink-500 dark:bg-transparent dark:border-pink-500 dark:text-pink-400',
  bug: 'bg-lime-500 dark:bg-transparent dark:border-lime-500 dark:text-lime-400',
  rock: 'bg-stone-600 dark:bg-transparent dark:border-stone-500 dark:text-stone-400',
  dragon: 'bg-violet-600 dark:bg-transparent dark:border-violet-600 dark:text-violet-400',
  ghost: 'bg-purple-600 dark:bg-transparent dark:border-purple-600 dark:text-purple-400',
  dark: 'bg-zinc-700 dark:bg-transparent dark:border-zinc-600 dark:text-zinc-400',
  steel: 'bg-slate-500 dark:bg-transparent dark:border-slate-500 dark:text-slate-400',
  fairy: 'bg-pink-400 dark:bg-transparent dark:border-pink-400 dark:text-pink-400'
}

// Get type classes with light/dark mode support
const getTypeClasses = (type: string): string => {
  return TYPE_CLASSES[type] || 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400'
}

const getTypeColor = (type: string): string => {
  const colors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-amber-600',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-slate-400',
    fairy: 'bg-pink-400'
  }
  return colors[type] || 'bg-gray-500'
}
</script>
