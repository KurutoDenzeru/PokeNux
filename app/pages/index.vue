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
    description: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards. Your ultimate Pokémon reference powered by PokéAPI and TCGdex.',
    ogTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
    ogDescription: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards. Your ultimate Pokémon reference powered by PokéAPI and TCGdex.',
    ogImage: '/pokenuxt.avif',
    ogUrl: 'https://pokenux.nuxt.dev/',
    twitterTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
    twitterDescription: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards.',
    twitterImage: '/pokenuxt.avif',
    twitterCard: 'summary_large_image'
  }
</script>