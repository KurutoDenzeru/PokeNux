<template>
  <div class="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
    <!-- Toaster for notifications (bottom-right) -->
    <Toaster class="pointer-events-auto" position="bottom-right" />

    <!-- Navigation Bar (optional, for detail pages) -->
    <nav v-if="showNavbar"
      class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div class="flex h-16 items-center justify-between px-4">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="$router.push('/')">
            ← Back
          </Button>
        </div>
        <div class="flex-1 flex items-center gap-3">
          <div class="ml-auto w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl">
            <PokemonSearch />
          </div>
        </div>
      </div>
    </nav>

    <!-- Blueprint-style grid background with Nuxt green branding -->
    <div v-if="showBackgroundPattern" class="fixed inset-0 z-0 bg-white dark:bg-gray-950 pointer-events-none">
      <!-- Fine grid overlay -->
      <div class="absolute inset-0" :style="{
        backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
        backgroundSize: '20px 20px',
      }" />
      <!-- Larger grid overlay -->
      <div class="absolute inset-0" :style="{
        backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.2) 1px, transparent 1px)
          `,
        backgroundSize: '100px 100px',
      }" />
      <!-- Blueprint marks and accent dots -->
      <div class="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="blueprint-marks" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <text x="5" y="10" class="text-[6px] fill-green-600 dark:fill-green-400">100</text>
              <text x="105" y="10" class="text-[6px] fill-green-600 dark:fill-green-400">200</text>
              <text x="205" y="10" class="text-[6px] fill-green-600 dark:fill-green-400">300</text>

              <text x="2" y="105" class="text-[6px] fill-green-600 dark:fill-green-400">100</text>
              <text x="2" y="205" class="text-[6px] fill-green-600 dark:fill-green-400">200</text>
              <text x="2" y="305" class="text-[6px] fill-green-600 dark:fill-green-400">300</text>

              <circle cx="100" cy="100" r="2" class="fill-green-600/30 dark:fill-green-400/30" />
              <circle cx="200" cy="200" r="2" class="fill-green-600/30 dark:fill-green-400/30" />
              <circle cx="300" cy="300" r="2" class="fill-green-600/30 dark:fill-green-400/30" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#blueprint-marks)" />
        </svg>
      </div>
      <!-- Radial gradient glow -->
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.1),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.05),transparent_70%)]" />
    </div>

    <!-- Main Content -->
    <main :class="['relative', showBackgroundPattern ? 'z-10' : '']">
      <slot />
    </main>

    <!-- Site Footer -->
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue'
  import { useSEO, type SEOConfig } from '@/utils/seo'
  import { Toaster } from '@/components/ui/sonner'
  import ThemeToggle from '@/components/ThemeToggle.vue'
  import SiteFooter from '@/components/ui/SiteFooter.vue'
  import Button from '@/components/ui/button/Button.vue'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'

  interface Props {
    seoConfig?: Partial<SEOConfig>
    showNavbar?: boolean
    showBackgroundPattern?: boolean
    hideThemeToggle?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    showNavbar: false,
    showBackgroundPattern: false,
    hideThemeToggle: false
  })

  // Apply SEO configuration and re-apply when the prop changes (page may provide it after async fetch)
  watch(
    () => props.seoConfig,
    (newConfig) => {
      if (newConfig) {
        useSEO(newConfig)
      }
    },
    { immediate: true, deep: true }
  )
</script>
