// stores/moveCategory.ts
import { defineStore } from 'pinia'

export type MoveCategory = 'physical' | 'special' | 'status'

export const MOVE_CATEGORY_COLORS = {
  physical: {
    bg: 'bg-orange-500',
    text: 'text-white',
    badge: 'bg-orange-500 dark:bg-transparent dark:border dark:border-orange-500 dark:text-orange-400 text-white hover:bg-orange-600 dark:hover:bg-orange-500/20 hover:text-white'
  },
  special: {
    bg: 'bg-purple-500',
    text: 'text-white',
    badge: 'bg-purple-500 dark:bg-transparent dark:border dark:border-purple-500 dark:text-purple-400 text-white hover:bg-purple-600 dark:hover:bg-purple-500/20 hover:text-white'
  },
  status: {
    bg: 'bg-gray-500',
    text: 'text-white',
    badge: 'bg-gray-500 dark:bg-transparent dark:border dark:border-gray-500 dark:text-gray-400 text-white hover:bg-gray-600 dark:hover:bg-gray-500/20 hover:text-white'
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
