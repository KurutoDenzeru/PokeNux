<template>
  <div>
    <nav class="fixed inset-x-0 bottom-4 z-[70] flex justify-center md:hidden pointer-events-none" aria-label="Mobile navigation">
      <div
        class="pointer-events-auto relative flex items-center gap-1 rounded-xl border border-white/10 bg-zinc-900/55 px-2 py-2 shadow-[0_12px_24px_rgba(0,0,0,0.3)] backdrop-blur-lg"
      >
        <button
          type="button"
          class="dock-btn"
          :class="isActiveHome ? 'dock-btn-active' : ''"
          aria-label="Home"
          @click="goHome"
        >
          <Home class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="dock-btn"
          :class="searchOpen ? 'dock-btn-active' : ''"
          aria-label="Search"
          @click="toggleSearch"
        >
          <Search class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="dock-btn"
          :class="isActiveCompare ? 'dock-btn-active' : ''"
          aria-label="Compare"
          @click="goCompare"
        >
          <Scale class="h-5 w-5" />
        </button>

        <button
          type="button"
          class="dock-btn"
          :class="isActiveTeamBuilder ? 'dock-btn-active' : ''"
          aria-label="Team Builder"
          @click="goTeamBuilder"
        >
          <Boxes class="h-5 w-5" />
        </button>
      </div>
    </nav>

    <div
      v-if="searchOpen"
      class="fixed inset-0 z-[80] bg-zinc-950/60 px-4 pb-8 pt-16 backdrop-blur-sm md:hidden"
      @click.self="closeSearch"
    >
      <div class="mx-auto w-full max-w-lg rounded-xl border border-white/25 bg-white/10 p-4 shadow-2xl backdrop-blur-2xl">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-sm font-semibold text-zinc-200">Search</h2>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close search"
            @click="closeSearch"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
        <PokemonSearch />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Home, Search, Scale, Boxes, X } from 'lucide-vue-next'
  import PokemonSearch from '@/components/pokemon/PokemonSearch.vue'

  const route = useRoute()
  const router = useRouter()

  const searchOpen = ref(false)

  const isActiveHome = computed(() => route.path === '/')
  const isActiveCompare = computed(() => route.path.startsWith('/compare'))
  const isActiveTeamBuilder = computed(() => route.path.startsWith('/team-builder'))

  const closeSearch = () => {
    searchOpen.value = false
  }

  const toggleSearch = () => {
    searchOpen.value = !searchOpen.value
  }

  const goHome = () => {
    router.push('/')
  }

  const goCompare = () => {
    router.push('/compare')
  }

  const goTeamBuilder = () => {
    router.push('/team-builder')
  }

  watch(
    () => route.fullPath,
    () => {
      closeSearch()
    }
  )
</script>

<style scoped>
  .dock-btn {
    display: inline-flex;
    height: 3rem;
    width: 3rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    color: rgb(244 244 245 / 0.95);
    transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 1;
  }

  .dock-btn:hover {
    background: rgb(255 255 255 / 0.1);
    color: rgb(250 250 250);
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.15);
  }

  .dock-btn-active {
    background: rgb(255 255 255 / 0.14);
    color: white;
    box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.2), 0 4px 12px rgb(0 0 0 / 0.2);
  }
</style>
