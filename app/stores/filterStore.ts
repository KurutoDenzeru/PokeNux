import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFilterStore = defineStore('filters', () => {
  // Reactive state
  const itemsPerPage = ref<string | number>('24')
  const selectedType = ref<string | null>(null)
  const selectedGeneration = ref<string | null>(null)
  const selectedSort = ref<string | null>(null)

  // Actions
  const setItemsPerPage = (value: string | number) => {
    itemsPerPage.value = value
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokemon-items-per-page', String(value))
    }
  }

  const setSelectedType = (value: string | null) => {
    selectedType.value = value
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokemon-selected-type', value || '')
    }
  }

  const setSelectedGeneration = (value: string | null) => {
    selectedGeneration.value = value
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokemon-selected-generation', value || '')
    }
  }

  const setSelectedSort = (value: string | null) => {
    selectedSort.value = value
    if (typeof window !== 'undefined') {
      localStorage.setItem('pokemon-selected-sort', value || '')
    }
  }

  const clearAllFilters = () => {
    selectedType.value = null
    selectedGeneration.value = null
    selectedSort.value = null
    itemsPerPage.value = '24'
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pokemon-selected-type')
      localStorage.removeItem('pokemon-selected-generation')
      localStorage.removeItem('pokemon-selected-sort')
      localStorage.setItem('pokemon-items-per-page', '24')
    }
  }

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedItemsPerPage = localStorage.getItem('pokemon-items-per-page')
      const savedType = localStorage.getItem('pokemon-selected-type')
      const savedGeneration = localStorage.getItem('pokemon-selected-generation')
      const savedSort = localStorage.getItem('pokemon-selected-sort')

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