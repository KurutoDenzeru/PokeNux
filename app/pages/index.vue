<template>
  <BaseLayout :seo-config="seoConfig" :show-background-pattern="true">
    <section class="w-full py-8 relative overflow-hidden">
      <PokemonGrid />
    </section>
  </BaseLayout>
</template>

<script setup lang="ts">
  import PokemonGrid from '../components/pokemon/PokemonGrid.vue'
  import BaseLayout from '@/layouts/BaseLayout.vue'
  import type { SEOConfig } from '@/utils/seo'

  const seoConfig: Partial<SEOConfig> = {
    title: 'PokéNux - Explore Pokémon Data & TCG Cards',
    description: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
    ogTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
    ogDescription: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
    ogImage: '/OpenGraph.webp',
    ogUrl: 'https://pokenux.nuxt.dev/',
    twitterTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
    twitterDescription: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
    twitterImage: '/OpenGraph.webp',
    twitterCard: 'summary_large_image'
  }
</script>