// stores/moveCategory.ts
import { defineStore } from 'pinia'

export type MoveCategory = 'physical' | 'special' | 'status'

export const MOVE_CATEGORY_COLORS = {
  physical: {
    bg: 'bg-orange-500',
    text: 'text-white',
    badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
  },
  special: {
    bg: 'bg-purple-500',
    text: 'text-white',
    badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
  },
  status: {
    bg: 'bg-gray-500',
    text: 'text-white',
    badge: 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
  }
} as const

export const useMoveCategoryStore = defineStore('move-category', () => {
  const getCategoryColor = (category: MoveCategory) => {
    return MOVE_CATEGORY_COLORS[category] || MOVE_CATEGORY_COLORS.status
  }

  return {
    getCategoryColor,
    MOVE_CATEGORY_COLORS
  }
})
