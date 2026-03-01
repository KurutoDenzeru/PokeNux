<template>
  <!-- ImageSkeleton: scales to parent size via utility classes. Optionally accepts a size class via slot wrapper. -->
  <div class="flex items-center justify-center w-full h-full" role="status" aria-hidden>
    <LoaderCircle class="animate-spin-slow text-emerald-500 dark:text-emerald-400 w-12 h-12" />
  </div>
</template>

<script setup lang="ts">
  import { LoaderCircle } from 'lucide-vue-next'
</script>

<style scoped>
  .animate-spin-slow {
    animation: spin 1.1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
