export interface SEOConfig {
  title: string
  description: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
}

export const defaultSEO: SEOConfig = {
  title: 'PokéNux - Explore Pokémon Data & TCG Cards',
  description: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards. Your ultimate Pokémon reference powered by PokéAPI and TCGdex.',
  ogTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
  ogDescription: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards. Your ultimate Pokémon reference powered by PokéAPI and TCGdex.',
  ogImage: '/pokenuxt.avif',
  ogUrl: 'https://pokenux.nuxt.dev/',
  twitterTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
  twitterDescription: 'Discover comprehensive Pokémon information, stats, evolutions, and Trading Card Game cards. Your ultimate Pokémon reference powered by PokéAPI and TCGdex.',
  twitterImage: '/pokenuxt.avif',
  twitterCard: 'summary_large_image'
}

export function useSEO(config: Partial<SEOConfig> = {}) {
  const mergedConfig = { ...defaultSEO, ...config }

  useSeoMeta({
    title: mergedConfig.title,
    description: mergedConfig.description,
    ogTitle: mergedConfig.ogTitle || mergedConfig.title,
    ogDescription: mergedConfig.ogDescription || mergedConfig.description,
    ogImage: mergedConfig.ogImage,
    ogUrl: mergedConfig.ogUrl,
    twitterTitle: mergedConfig.twitterTitle || mergedConfig.title,
    twitterDescription: mergedConfig.twitterDescription || mergedConfig.description,
    twitterImage: mergedConfig.twitterImage || mergedConfig.ogImage,
    twitterCard: mergedConfig.twitterCard
  })

  useHead({
    htmlAttrs: {
      lang: 'en'
    },
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico'
      }
    ]
  })
}
