import { ref, computed, type Ref } from 'vue'

export interface PokemonDetailData {
  id: number
  name: string
  height: number
  weight: number
  base_experience: number
  types: Array<{ slot: number; type: { name: string; url: string } }>
  abilities: Array<{ 
    ability: { name: string; url: string }
    is_hidden: boolean
    slot: number
  }>
  stats: Array<{
    base_stat: number
    effort: number
    stat: { name: string; url: string }
  }>
  sprites: any
  cries?: {
    latest?: string
    legacy?: string
  }
  forms: Array<{ name: string; url: string }>
  species: { name: string; url: string }
  moves: Array<{
    move: { name: string; url: string }
    version_group_details: Array<{
      level_learned_at: number
      move_learn_method: { name: string; url: string }
      version_group: { name: string; url: string }
    }>
  }>
  held_items: Array<{
    item: { name: string; url: string }
    version_details: Array<{
      rarity: number
      version: { name: string; url: string }
    }>
  }>
}

export interface SpeciesData {
  id: number
  name: string
  order: number
  gender_rate: number
  capture_rate: number
  base_happiness: number
  is_baby: boolean
  is_legendary: boolean
  is_mythical: boolean
  hatch_counter: number
  has_gender_differences: boolean
  forms_switchable: boolean
  growth_rate: { name: string; url: string }
  pokedex_numbers: Array<{
    entry_number: number
    pokedex: { name: string; url: string }
  }>
  egg_groups: Array<{ name: string; url: string }>
  color: { name: string; url: string }
  shape: { name: string; url: string }
  evolves_from_species: { name: string; url: string } | null
  evolution_chain: { url: string }
  habitat: { name: string; url: string } | null
  generation: { name: string; url: string }
  names: Array<{
    name: string
    language: { name: string; url: string }
  }>
  flavor_text_entries: Array<{
    flavor_text: string
    language: { name: string; url: string }
    version: { name: string; url: string }
  }>
  genera: Array<{
    genus: string
    language: { name: string; url: string }
  }>
  varieties: Array<{
    is_default: boolean
    pokemon: { name: string; url: string }
  }>
}

export function usePokemonDetail(pokemonId: Ref<number>) {
  const pokemonData = ref<PokemonDetailData | null>(null)
  const speciesData = ref<SpeciesData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const cryLatest = computed(() => pokemonData.value?.cries?.latest || '')
  const cryLegacy = computed(() => pokemonData.value?.cries?.legacy || '')

  const fetchPokemonDetail = async (id: number) => {
    if (!id || id < 1) return

    isLoading.value = true
    error.value = null

    try {
      // Fetch main Pokémon data
      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      if (!pokemonRes.ok) throw new Error('Failed to fetch Pokémon data')
      pokemonData.value = await pokemonRes.json()

      // Fetch species data
      if (pokemonData.value?.species?.url) {
        const speciesRes = await fetch(pokemonData.value.species.url)
        if (!speciesRes.ok) throw new Error('Failed to fetch species data')
        speciesData.value = await speciesRes.json()
      }
    } catch (e: any) {
      error.value = e.message || 'An error occurred'
      console.error('Error fetching Pokémon detail:', e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    pokemonData,
    speciesData,
    isLoading,
    error,
    cryLatest,
    cryLegacy,
    fetchPokemonDetail,
  }
}
