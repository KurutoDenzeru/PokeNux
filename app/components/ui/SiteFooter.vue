<template>
  <footer class="relative z-10 mt-12">
    <div class="w-full">
      <div class="w-full mx-auto px-4 py-8 max-w-7xl">
        <Card class="w-full bg-card border border-gray-100 dark:border-zinc-800">
          <div class="py-1.5 px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-3 gap-8 items-start">
              <!-- Brand -->
              <div class="flex items-start gap-4 col-span-2 md:col-span-1">
                <a href="/" aria-label="Go to homepage"
                  class="rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <NuxtImg src="/rotom.avif" alt="PokéNux" class="w-12 h-12 object-contain rounded-md" />
                </a>
                <div class="flex flex-col">
                  <span class="text-lg font-extrabold leading-tight text-zinc-900 dark:text-zinc-100">PokéNux</span>
                  <span class="text-sm text-zinc-500 dark:text-zinc-400">Sleek Pokédex powered by PokéAPI and TCG Dex
                    for fast, intuitive exploration.</span>
                </div>
              </div>

              <!-- Links (stacked vertical) -->
              <div class="flex flex-col">
                <h4 class="font-semibold text-zinc-800 dark:text-zinc-100 mb-3">Connect</h4>
                <ul class="space-y-3 text-sm">
                  <li>
                    <a href="https://github.com/KurutoDenzeru/PokeNux" target="_blank" rel="noopener noreferrer"
                      class="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                      <Github class="w-5 h-5 " />
                      <span>GitHub</span>
                    </a>
                  </li>

                  <li>
                    <a href="https://www.linkedin.com/in/kurtcalacday/" target="_blank" rel="noopener noreferrer"
                      class="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                      <Linkedin class="w-5 h-5" />
                      <span>LinkedIn</span>
                    </a>
                  </li>

                  <li>
                    <a href="https://www.instagram.com/krtclcdy/" target="_blank" rel="noopener noreferrer"
                      class="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                      <Instagram class="w-5 h-5" />
                      <span>Instagram</span>
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Quick sitemap / small description -->
              <div class="flex flex-col">
                <h4 class="font-semibold text-zinc-800 dark:text-zinc-100 mb-3">Explore</h4>
                <ul class="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <li>
                    <a href="/" class="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-300">
                      <Home class="w-4 h-4" />
                      <span>Home</span>
                    </a>
                  </li>
                  <li>
                    <a href="https://pokeapi.co/docs/v2" target="_blank" rel="noopener noreferrer"
                      class="flex items-center gap-2 hover:text-emerald-600 dark:hover:text-emerald-300">
                      <BookOpen class="w-4 h-4" />
                      <span>API Docs</span>
                    </a>
                  </li>
                  <li>
                    <AboutDialog>
                      <button
                        class="flex items-center gap-2 text-left p-0 text-sm hover:text-emerald-600 dark:hover:text-emerald-300 cursor-pointer">
                        <Info class="w-4 h-4" />
                        <span>About</span>
                      </button>
                    </AboutDialog>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Footer bottom row: attribution and theme -->
            <div class="mt-8 border-t pt-6">
              <div class="w-full flex flex-row items-center justify-between text-sm text-zinc-600 dark:text-zinc-300">
                <div>
                  © {{ new Date().getFullYear() }} PokéNux. All rights reserved.
                </div>
                <div class="flex items-center gap-2">
                  <span>Built with data from</span>
                  <a href="https://pokeapi.co/"
                    class="inline-flex items-center gap-2 underline text-emerald-600 dark:text-emerald-400"
                    target="_blank" rel="noopener noreferrer">
                    <NuxtImg src="/pokeapi.avif" alt="PokéAPI" class="w-auto h-6 object-contain rounded-sm" />
                  </a>
                </div>
              </div>
              <div class="w-full flex items-center justify-center mt-4">
                <span class="text-sm text-zinc-600 dark:text-zinc-300 mr-2">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import { Card } from '@/components/ui/card'
  import { Github, Linkedin, Instagram, Home, BookOpen, Info } from 'lucide-vue-next'
  import AboutDialog from '@/components/ui/AboutDialog.vue'
  import ThemeToggle from '@/components/ThemeToggle.vue'
</script>
