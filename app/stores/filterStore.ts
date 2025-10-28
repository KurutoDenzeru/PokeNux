import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/lib/storage'

export const useFilterStore = defineStore('filters', () => {
  // Reactive state
  const itemsPerPage = ref<string | number>('24')
  const selectedType = ref<string | null>(null)
  const selectedGeneration = ref<string | null>(null)
  const selectedSort = ref<string | null>(null)

  // Actions
  const setItemsPerPage = (value: string | number) => {
    itemsPerPage.value = value
    storage.setItem('pokemon-items-per-page', String(value))
  }

  const setSelectedType = (value: string | null) => {
    selectedType.value = value
    storage.setItem('pokemon-selected-type', value || '')
  }

  const setSelectedGeneration = (value: string | null) => {
    selectedGeneration.value = value
    storage.setItem('pokemon-selected-generation', value || '')
  }

  const setSelectedSort = (value: string | null) => {
    selectedSort.value = value
    storage.setItem('pokemon-selected-sort', value || '')
  }

  const clearAllFilters = () => {
    selectedType.value = null
    selectedGeneration.value = null
    selectedSort.value = null
    itemsPerPage.value = '24'

    storage.removeItem('pokemon-selected-type')
    storage.removeItem('pokemon-selected-generation')
    storage.removeItem('pokemon-selected-sort')
    storage.setItem('pokemon-items-per-page', '24')
  }

  const loadFromLocalStorage = () => {
    const savedItemsPerPage = storage.getItem('pokemon-items-per-page')
    const savedType = storage.getItem('pokemon-selected-type')
    const savedGeneration = storage.getItem('pokemon-selected-generation')
    const savedSort = storage.getItem('pokemon-selected-sort')

      if (savedItemsPerPage) {
        itemsPerPage.value = savedItemsPerPage
      }
      if (savedType) {
        selectedType.value = savedType
      }
      if (savedGeneration) {
        selectedGeneration.value = savedGeneration
      }
      if (savedSort) {
        selectedSort.value = savedSort
      }
  }

  return {
    // State
    itemsPerPage,
    selectedType,
    selectedGeneration,
    selectedSort,
    // Actions
    setItemsPerPage,
    setSelectedType,
    setSelectedGeneration,
    setSelectedSort,
    clearAllFilters,
    loadFromLocalStorage
  }
})