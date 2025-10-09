<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <!-- Navbar (simple) -->
    <div class="w-full flex items-center justify-between mb-6">
      <div class="flex items-center gap-4">
        <NuxtLink to="/" class="text-sm font-semibold">← Back</NuxtLink>
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium">Version</label>
          <select v-model="selectedVersion" class="rounded px-2 py-1 border">
            <option v-for="v in versions" :key="v" :value="v">{{ v }}</option>
          </select>
        </div>
      </div>

      <div class="w-1/3">
        <input v-model="search" placeholder="Search Pokémon" class="w-full rounded border px-3 py-1" />
      </div>
    </div>

    <!-- Header -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div class="col-span-2">
        <div class="flex items-center gap-4">
          <div class="flex flex-wrap gap-2">
            <span v-for="t in pokemon.types || []" :key="t.name"
              :class="['px-3 py-1 rounded-md text-white text-sm font-medium', getTypeClass(t.name)]">
              <span class="mr-2">{{ getTypeEmoji(t.name) }}</span>
              <span class="capitalize">{{ t.name }}</span>
            </span>
          </div>

          <h1 class="text-3xl font-extrabold capitalize">{{ pokemon.name }}</h1>
        </div>

        <div class="mt-4 flex items-center gap-6">
          <div>
            <div class="text-sm text-zinc-500">Latest cry</div>
            <audio v-if="cries.latest" :src="cries.latest" controls />
          </div>
          <div>
            <div class="text-sm text-zinc-500">Legacy cry</div>
            <audio v-if="cries.legacy" :src="cries.legacy" controls />
          </div>
        </div>

        <div class="mt-4">
          <p class="text-zinc-700 dark:text-zinc-300">{{ flavorText }}</p>
        </div>

        <!-- Info table -->
        <div class="mt-6">
          <div class="grid grid-cols-2 gap-4 bg-card p-4 rounded">
            <div>
              <div class="text-xs text-zinc-500">Pokémon No.</div>
              <div class="font-semibold">#{{ pokemon.id }}</div>
            </div>
            <div>
              <div class="text-xs text-zinc-500">Introduced</div>
              <div class="font-semibold">{{ generationName }}</div>
            </div>
            <div>
              <div class="text-xs text-zinc-500">Category</div>
              <div class="font-semibold">{{ category }}</div>
            </div>
            <div>
              <div class="text-xs text-zinc-500">Weight / Height</div>
              <div class="font-semibold">{{ weightStr }} / {{ heightStr }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Artwork panel -->
      <div class="col-span-1 flex flex-col items-center">
        <div class="w-56 h-56 flex items-center justify-center bg-white rounded shadow">
          <img :src="currentArtwork" :alt="pokemon.name" class="w-48 h-48 object-contain animate-bounce" />
        </div>

        <div class="mt-4 flex gap-2">
          <button @click="isShiny = false" :class="isShiny ? 'opacity-60' : ''"
            class="px-3 py-1 rounded bg-zinc-100">Normal</button>
          <button @click="isShiny = true" :class="!isShiny ? 'opacity-60' : ''"
            class="px-3 py-1 rounded bg-zinc-100">Shiny</button>
        </div>

        <div class="mt-6 w-full">
          <div class="flex justify-between items-center">
            <div class="text-sm text-zinc-500">Prev</div>
            <div class="text-sm text-zinc-500">Next</div>
          </div>
          <!-- Mini cards would go here -->
        </div>
      </div>
    </div>

    <!-- Three column section (scaffold) -->
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="bg-card p-4 rounded">Breeding (placeholder)</div>
      <div class="bg-card p-4 rounded">Training (placeholder)</div>
      <div class="bg-card p-4 rounded">Relations (placeholder)</div>
    </div>

    <!-- Forms + Base Stats -->
    <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="col-span-1 bg-card p-4 rounded">Forms / Varieties (placeholder)</div>
      <div class="col-span-2 bg-card p-4 rounded">Base Stats (placeholder)</div>
    </div>

  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { getTypeClass as importedGetTypeClass } from '@/lib/type-classes'
  import { TYPES } from '@/stores/types'

  const route = useRoute()
  const name = String(route.params.name || '')

  const pokemon = ref<any>({ name, id: null, types: [], sprites: {} })
  const species = ref<any>(null)
  const flavorText = ref('')
  const generationName = ref('')
  const category = ref('')
  const cries = ref({ latest: null, legacy: null })
  const isShiny = ref(false)
  const versions = ['Default']
  const selectedVersion = ref(versions[0])
  const search = ref('')

  const getTypeEmoji = (n: string) => (TYPES[n as keyof typeof TYPES]?.emoji || '')
  const getTypeClassLocal = (n: string) => getTypeClass(n)

  const currentArtwork = computed(() => {
    if (!pokemon.value || !pokemon.value.sprites) return ''
    if (isShiny.value) return pokemon.value.sprites?.front_shiny || pokemon.value.sprites?.front_default || ''
    return pokemon.value.sprites?.front_default || ''
  })

  const weightStr = computed(() => {
    if (!pokemon.value || pokemon.value.weight == null) return ''
    // API weight is in hectograms
    const kg = (pokemon.value.weight / 10).toFixed(1)
    const lbs = (Number(kg) * 2.20462).toFixed(1)
    return `${kg} kg / ${lbs} lbs`
  })

  const heightStr = computed(() => {
    if (!pokemon.value || pokemon.value.height == null) return ''
    const m = (pokemon.value.height / 10).toFixed(2)
    const totalInches = Number(m) * 39.3701
    const ft = Math.floor(totalInches / 12)
    const inch = Math.round(totalInches % 12)
    return `${m} m / ${ft}′${inch}″`
  })

  onMounted(async () => {
    if (!name) return
    try {
      const p = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`).then((r) => r.json())
      pokemon.value = p
      const sp = await fetch(p.species.url).then((r) => r.json())
      species.value = sp
      // flavor text
      const entry = sp.flavor_text_entries?.find((e: any) => e.language?.name === 'en')
      flavorText.value = entry?.flavor_text?.replace(/\n|\f/g, ' ') || ''
      generationName.value = sp.generation?.name || ''
      category.value = sp.genera?.find((g: any) => g.language?.name === 'en')?.genus || ''
    } catch (e) {
      // ignore
    }
  })

  // expose helpers for template
  const getTypeClass = importedGetTypeClass
  const getTypeEmojiLocal = getTypeEmoji

</script>

<style scoped>
  .bg-card {
    background: var(--card-bg, #fff);
  }
</style>
