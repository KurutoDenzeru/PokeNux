<script setup lang="ts">
  import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './dialog'
  import { Button } from '@/components/ui/button'
  import { Info, Github, Linkedin, Instagram } from 'lucide-vue-next'
</script>

<template>
  <Dialog>
    <template #default>
      <DialogTrigger as-child>
        <slot />
      </DialogTrigger>
      <DialogContent class="max-w-lg">
        <div class="space-y-4">
          <DialogTitle class="flex items-center gap-2">
            <Info class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>About PokéNux</span>
          </DialogTitle>

          <DialogDescription>
            <p class="text-sm text-zinc-700 dark:text-zinc-300">
              PokéNux is a lightweight Nuxt + Tailwind frontend that showcases Pokémon data from the PokéAPI.
              It's designed as a friendly demo of fetching, transforming and displaying public API data with a
              focus on accessibility and dark-mode support.
            </p>
          </DialogDescription>

          <div>
            <h4 class="font-semibold">Tech stack</h4>
            <ul class="list-disc list-inside text-sm text-zinc-700 dark:text-zinc-300 mt-2">
              <li>Nuxt 4 / Vue 3</li>
              <li>Tailwind CSS</li>
              <li>Pinia for state management</li>
              <li>Lucide icons</li>
              <li>PokéAPI for Pokémon data</li>
              <li>Pokémon TCG Dex for TCG card data</li>
            </ul>
          </div>

          <!-- <div>
            <h4 class="font-semibold">Social</h4>
            <ul class="text-sm text-zinc-700 dark:text-zinc-300 mt-2 space-y-1">
              <li>
                <a href="https://github.com/KurutoDenzeru/PokeNux" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                  <Github class="w-4 h-4 " />
                  <span>GitHub</span>
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/in/kurtcalacday/" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                  <Linkedin class="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/krtclcdy/" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-300">
                  <Instagram class="w-4 h-4" />
                  <span>Instagram</span>
                </a>
              </li>
            </ul>
          </div> -->

          <DialogFooter>
            <DialogClose class="w-full">
              <Button variant="emerald-outline" class="w-full">Close</Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </template>
  </Dialog>
</template>
