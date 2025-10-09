<template>
  <Button variant="outline" size="sm"
    class="flex items-center gap-2 border-dashed border-zinc-300 hover:border-zinc-400 text-zinc-600 hover:text-zinc-800 transition-colors"
    @click="clearFilters" :disabled="!hasActiveFilters">
    <X class="h-4 w-4" />
    Clear Filters
  </Button>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { Button } from '@/components/ui/button'
  import { X } from 'lucide-vue-next'
  import { useUserPreferencesStore } from '@/stores/userPreferences'

  const userStore = useUserPreferencesStore()

  const hasActiveFilters = computed(() => {
    return !!(userStore.selectedType || userStore.selectedGeneration || userStore.selectedSort)
  })

  const clearFilters = () => {
    userStore.clearFilters()
  }
</script>