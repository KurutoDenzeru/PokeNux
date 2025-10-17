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
  description: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
  ogTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
  ogDescription: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
  ogImage: '/pokenuxt.avif',
  ogUrl: 'https://pokenux.nuxt.dev/',
  twitterTitle: 'PokéNux - Explore Pokémon Data & TCG Cards',
  twitterDescription: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind, and powered by PokéAPI and the Pokémon TCG Dex. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG Dex.',
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
