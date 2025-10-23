<template>
  <div class="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950">
    <!-- Toaster for notifications (bottom-right) -->
    <Toaster class="pointer-events-auto" position="bottom-right" />

    <!-- Navigation Bar (optional, for detail pages) -->
    <nav
      v-if="showNavbar"
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

    <!-- Subtle grid background with branded highlight (for home page) -->
    <div
      v-if="showBackgroundPattern"
      class="absolute inset-0 z-0 h-full w-full bg-white dark:bg-zinc-950 bg-[linear-gradient(to_right,#8080800d_2px,transparent_2px),linear-gradient(to_bottom,#8080800d_2px,transparent_2px)] dark:bg-[linear-gradient(to_right,#ffffff0d_2px,transparent_2px),linear-gradient(to_bottom,#ffffff0d_2px,transparent_2px)] bg-size-[32px_48px] pointer-events-none">
      <div
        class="absolute left-1/2 top-0 -translate-x-1/2 z-0 m-auto h-[310px] w-[310px] rounded-full bg-[#00C58E] opacity-20 dark:opacity-10 blur-[100px]">
      </div>
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
