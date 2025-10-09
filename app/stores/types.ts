// stores/type-store.ts
import { defineStore } from 'pinia'
import { computed } from 'vue'

type ModeColors = {
  bg: string
  text: string
}

type PokemonStyle = {
  emoji: string
  light: ModeColors
  dark: ModeColors
}

// canonical keys (literal union auto-derived from the object keys below)
export const TYPES = {
  normal: { emoji: '⭐', light: { bg: '#D1D5DB', text: '#ffffff' }, dark: { bg: '#374151', text: '#ffffff' } },
  fire: { emoji: '🔥', light: { bg: '#f87171', text: '#ffffff' }, dark: { bg: '#7f1d1d', text: '#ffffff' } },
  water: { emoji: '💧', light: { bg: '#60a5fa', text: '#ffffff' }, dark: { bg: '#083344', text: '#ffffff' } },
  electric: { emoji: '⚡', light: { bg: '#fde047', text: '#ffffff' }, dark: { bg: '#5c3d00', text: '#ffffff' } },
  grass: { emoji: '🌿', light: { bg: '#34d399', text: '#ffffff' }, dark: { bg: '#14532d', text: '#ffffff' } },
  ice: { emoji: '❄️', light: { bg: '#99f6e4', text: '#ffffff' }, dark: { bg: '#064e3b', text: '#ffffff' } },
  fighting: { emoji: '🥊', light: { bg: '#d97706', text: '#ffffff' }, dark: { bg: '#78350f', text: '#ffffff' } },
  poison: { emoji: '🧪', light: { bg: '#a78bfa', text: '#ffffff' }, dark: { bg: '#4c1d95', text: '#ffffff' } },
  ground: { emoji: '🌍', light: { bg: '#f59e0b', text: '#ffffff' }, dark: { bg: '#78350f', text: '#ffffff' } },
  flying: { emoji: '🕊️', light: { bg: '#7dd3fc', text: '#ffffff' }, dark: { bg: '#075985', text: '#ffffff' } },
  psychic: { emoji: '🔮', light: { bg: '#f472b6', text: '#ffffff' }, dark: { bg: '#831843', text: '#ffffff' } },
  bug: { emoji: '🐛', light: { bg: '#bef264', text: '#ffffff' }, dark: { bg: '#365314', text: '#ffffff' } },
  rock: { emoji: '🗿', light: { bg: '#a8a29e', text: '#ffffff' }, dark: { bg: '#2b2a28', text: '#ffffff' } },
  ghost: { emoji: '👻', light: { bg: '#7c3aed', text: '#ffffff' }, dark: { bg: '#4c1d95', text: '#ffffff' } },
  dragon: { emoji: '🐉', light: { bg: '#4338ca', text: '#ffffff' }, dark: { bg: '#312e81', text: '#ffffff' } },
  dark: { emoji: '🌙', light: { bg: '#374151', text: '#ffffff' }, dark: { bg: '#0b1220', text: '#ffffff' } },
  steel: { emoji: '⚙️', light: { bg: '#94a3b8', text: '#ffffff' }, dark: { bg: '#1f2937', text: '#ffffff' } },
  fairy: { emoji: '🧚', light: { bg: '#fbcfe8', text: '#ffffff' }, dark: { bg: '#581c3f', text: '#ffffff' } },
} as const satisfies Record<string, PokemonStyle>

export type PokemonName = keyof typeof TYPES
export type PokemonType = { name: PokemonName } & PokemonStyle

export const useTypeStore = defineStore('type-store', () => {
  // expose as readonly dictionary for O(1) lookups
  const dict = TYPES

  // list when you need to render all types
  const list = computed<PokemonType[]>(() =>
    Object.entries(dict).map(([name, v]) => ({ name: name as PokemonName, ...v }))
  )

  const byName = (name: PokemonName) => dict[name]

  return { list, byName }
})