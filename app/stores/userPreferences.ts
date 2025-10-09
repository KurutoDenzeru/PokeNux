import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  // User preferences state
  const itemsPerPage = ref<string | number>('24')
  const selectedType = ref<string | null>(null)
  const selectedGeneration = ref<string | null>(null)
  const selectedSort = ref<string | null>(null)

  // Initialize from localStorage on store creation
  const initializeFromStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pokehex-user-preferences')
      // console.log('📦 Loading preferences from localStorage:', stored)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // console.log('✅ Parsed preferences:', parsed)
          itemsPerPage.value = parsed.itemsPerPage ?? '24'
          selectedType.value = parsed.selectedType ?? null
          selectedGeneration.value = parsed.selectedGeneration ?? null
          selectedSort.value = parsed.selectedSort ?? null
        } catch (error) {
          console.warn('❌ Failed to parse stored preferences:', error)
        }
      } else {
        // console.log('ℹ️ No stored preferences found, using defaults')
      }
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    if (typeof window !== 'undefined') {
      const preferences = {
        itemsPerPage: itemsPerPage.value,
        selectedType: selectedType.value,
        selectedGeneration: selectedGeneration.value,
        selectedSort: selectedSort.value
      }
      // console.log('💾 Saving preferences to localStorage:', preferences)
      localStorage.setItem('pokehex-user-preferences', JSON.stringify(preferences))
    }
  }

  // Update functions that also save to storage
  const updateItemsPerPage = (value: string | number) => {
    itemsPerPage.value = value
    saveToStorage()
  }

  const updateSelectedType = (value: string | null) => {
    selectedType.value = value
    saveToStorage()
  }

  const updateSelectedGeneration = (value: string | null) => {
    selectedGeneration.value = value
    saveToStorage()
  }

  const updateSelectedSort = (value: string | null) => {
    selectedSort.value = value
    saveToStorage()
  }

  // Clear all filters except itemsPerPage (keep pagination preference)
  const clearFilters = () => {
    selectedType.value = null
    selectedGeneration.value = null
    selectedSort.value = null
    saveToStorage()
  }

  // Clear all preferences including pagination
  const clearAllPreferences = () => {
    itemsPerPage.value = '24'
    selectedType.value = null
    selectedGeneration.value = null
    selectedSort.value = null
    saveToStorage()
  }

  // Initialize when store is created
  initializeFromStorage()

  return {
    // State
    itemsPerPage,
    selectedType,
    selectedGeneration,
    selectedSort,

    // Actions
    updateItemsPerPage,
    updateSelectedType,
    updateSelectedGeneration,
    updateSelectedSort,
    clearFilters,
    clearAllPreferences,
    initializeFromStorage
  }
})