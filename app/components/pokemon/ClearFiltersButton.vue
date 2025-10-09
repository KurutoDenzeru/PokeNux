<template>
  <Button variant="outline" size="sm"
    class="flex items-center gap-2 border-dashed border-2 border-red-300 hover:border-red-400 hover:bg-red-50 text-red-600 hover:text-red-700 dark:border-red-700 dark:hover:border-red-600 dark:hover:bg-red-950 dark:text-red-400 dark:hover:text-red-300 transition-all"
    @click="clearFilters">
    <X class="h-4 w-4" />
    Reset to Default
  </Button>
</template>

<script setup lang="ts">
  import { Button } from '@/components/ui/button'
  import { X } from 'lucide-vue-next'
  import { useUserPreferencesStore } from '@/stores/userPreferences'

  const userPreferences = useUserPreferencesStore()

  const clearFilters = () => {
    userPreferences.clearAllPreferences()
  }
</script>