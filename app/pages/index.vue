<template>
  <section class="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 py-8 relative overflow-hidden">
    <!-- Theme Toggle Button -->
    <ThemeToggle />

    <!-- subtle grid background + Nuxt-branded green blurred highlight -->
    <div
      class="absolute inset-0 z-0 h-full w-full bg-white dark:bg-zinc-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none">
      <div
        class="absolute left-1/2 top-0 -translate-x-1/2 z-0 m-auto h-[310px] w-[310px] rounded-full bg-[#00C58E] opacity-20 dark:opacity-10 blur-[100px]">
      </div>
    </div>

    <!-- Page content sits above the background -->
    <div class="relative z-10">
      <PokemonGrid />
    </div>
  </section>
</template>

<script setup lang="ts">
  import PokemonGrid from '../components/pokemon/PokemonGrid.vue'
  import ThemeToggle from '../components/ThemeToggle.vue'
</script>