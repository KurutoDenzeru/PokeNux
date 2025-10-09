<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <GitBranch class="w-5 h-5" />
        Evolution Chain
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-muted-foreground">Loading evolution chain...</p>
      </div>

      <div v-else-if="!evolutionChain" class="text-center text-muted-foreground py-8">
        <p>No evolution data available</p>
      </div>

      <div v-else class="overflow-x-auto py-4">
        <div class="flex flex-col items-center gap-6 px-2">
          <EvolutionStage :chain="evolutionChain" :is-shiny="isShiny" :form-suffix="currentFormSuffix || undefined"
            :varieties-map="varietiesMap" :on-navigate="navigateToPokemon" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
  import { ref, onMounted, defineComponent, h, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
  import { Badge } from '@/components/ui/badge'
  import { GitBranch, ArrowRight } from 'lucide-vue-next'
  import type { SpeciesData, PokemonDetailData } from '@/composables/usePokemonDetail'

  const props = defineProps<{
    species: SpeciesData | null
    pokemon?: PokemonDetailData | null
    isShiny?: boolean
  }>()

  const router = useRouter()
  const evolutionChain = ref<any>(null)
  const isLoading = ref(true)
  const varietiesMap = ref<Record<string, any>>({})

  // Detect if current Pokemon is a regional or special form
  const currentFormSuffix = computed(() => {
    if (!props.pokemon?.name || !props.species?.name) return null

    const pokemonName = props.pokemon.name
    const speciesName = props.species.name

    // Extract form suffix (e.g., "rattata-alola" -> "alola")
    if (pokemonName.startsWith(speciesName + '-')) {
      return pokemonName.replace(speciesName + '-', '')
    }

    return null
  })

  const navigateToPokemon = (pokemonId: string) => {
    router.push(`/pokemon/${pokemonId}`)
  }

  // Recursive component for evolution stages
  const EvolutionStage = defineComponent({
    name: 'EvolutionStage',
    props: {
      chain: { type: Object, required: true },
      isShiny: { type: Boolean, default: false },
      formSuffix: { type: String, default: null },
      varietiesMap: { type: Object, default: () => ({}) },
      onNavigate: { type: Function, required: true }
    },
    setup(props) {
      const getPokemonId = (url: string) => {
        return url.split('/').filter(Boolean).pop()
      }

      const getAllVarieties = (speciesName: string, baseId: string) => {
        const varieties = []

        // Always include the base form
        varieties.push({
          id: baseId,
          name: speciesName,
          displayName: 'Original',
          isDefault: true
        })

        // Look for all forms in varietiesMap
        Object.entries(props.varietiesMap).forEach(([formName, variety]: [string, any]) => {
          if (formName.startsWith(speciesName + '-') && variety?.id) {
            const formSuffix = formName.replace(speciesName + '-', '')
            varieties.push({
              id: variety.id,
              name: formName,
              displayName: formSuffix.charAt(0).toUpperCase() + formSuffix.slice(1).replace(/-/g, ' '),
              isDefault: false
            })
          }
        })

        return varieties
      }

      const getFormSpecificSprite = (pokemonId: string) => {
        return props.isShiny
          ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`
          : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
      }

      const formatEvolutionTrigger = (details: any) => {
        if (!details) return ''

        const triggers = []
        if (details.min_level) triggers.push(`Level ${details.min_level}`)
        if (details.item) triggers.push(details.item.name.replace(/-/g, ' '))
        if (details.min_happiness) triggers.push(`Happiness ${details.min_happiness}`)
        if (details.min_beauty) triggers.push(`Beauty ${details.min_beauty}`)
        if (details.held_item) triggers.push(`Hold ${details.held_item.name.replace(/-/g, ' ')}`)
        if (details.known_move) triggers.push(`Know ${details.known_move.name.replace(/-/g, ' ')}`)
        if (details.location) triggers.push(`@ ${details.location.name.replace(/-/g, ' ')}`)
        if (details.time_of_day) triggers.push(details.time_of_day)
        if (details.trigger?.name === 'trade') triggers.push('Trade')
        if (details.trigger?.name === 'use-item') triggers.push('Use Item')
        if (details.turn_upside_down) triggers.push('Turn Upside Down')

        return triggers.join(', ') || 'Unknown'
      }

      return () => {
        const pokemonId = getPokemonId(props.chain.species.url) || '1'
        const pokemonName = props.chain.species.name
        const varieties = getAllVarieties(pokemonName, pokemonId)

        return h('div', { class: 'flex flex-col items-center w-full' }, [
          // Current stage with all varieties
          h('div', { class: 'flex flex-col items-center gap-3 w-full' }, [
            h('p', { class: 'text-sm font-semibold text-muted-foreground capitalize' }, pokemonName),
            h('div', { class: 'flex flex-wrap gap-3 justify-center max-w-full' }, varieties.map(variety =>
              h('div', {
                class: 'border-2 rounded-lg p-2 bg-card hover:bg-accent transition-colors cursor-pointer flex flex-col items-center w-[100px]',
                onClick: () => props.onNavigate(variety.id)
              }, [
                h('img', {
                  src: getFormSpecificSprite(variety.id),
                  alt: variety.name,
                  class: 'w-16 h-16 object-contain'
                }),
                h('p', { class: 'text-center mt-1 font-medium text-sm' }, variety.displayName),
                h('p', { class: 'text-center text-sm text-muted-foreground' }, `#${String(variety.id).padStart(4, '0')}`)
              ])
            ))
          ]),

          // Evolution arrows and next stages
          ...(props.chain.evolves_to && props.chain.evolves_to.length > 0 ?
            props.chain.evolves_to.map((evo: any) =>
              h('div', { class: 'flex flex-col items-center gap-3 w-full mt-4' }, [
                // Arrow with trigger
                h('div', { class: 'flex flex-col items-center gap-1' }, [
                  h(ArrowRight, { class: 'w-6 h-6 text-primary rotate-90' }),
                  evo.evolution_details && evo.evolution_details[0] && h(Badge, {
                    variant: 'secondary',
                    class: 'text-sm whitespace-nowrap capitalize'
                  }, () => formatEvolutionTrigger(evo.evolution_details[0]))
                ]),
                // Next stage (recursive)
                h(EvolutionStage, {
                  chain: evo,
                  isShiny: props.isShiny,
                  formSuffix: props.formSuffix,
                  varietiesMap: props.varietiesMap,
                  onNavigate: props.onNavigate
                })
              ])
            )
            : [])
        ])
      }
    }
  })

  onMounted(async () => {
    if (!props.species?.evolution_chain?.url) {
      isLoading.value = false
      return
    }

    try {
      const res = await fetch(props.species.evolution_chain.url)
      if (res.ok) {
        const data = await res.json()
        evolutionChain.value = data.chain

        // If we have a form suffix, fetch varieties for all Pokemon in the evolution chain
        if (currentFormSuffix.value) {
          await fetchVarietiesForChain(data.chain)
        }
      }
    } catch (e) {
      console.error('Failed to fetch evolution chain:', e)
    } finally {
      isLoading.value = false
    }
  })

  // Fetch varieties for all Pokemon in the evolution chain
  const fetchVarietiesForChain = async (chain: any) => {
    const fetchSpeciesVarieties = async (speciesUrl: string) => {
      try {
        const res = await fetch(speciesUrl)
        if (res.ok) {
          const speciesData = await res.json()
          if (speciesData.varieties) {
            for (const variety of speciesData.varieties) {
              const varietyRes = await fetch(variety.pokemon.url)
              if (varietyRes.ok) {
                const varietyData = await varietyRes.json()
                varietiesMap.value[varietyData.name] = varietyData
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch species varieties:', e)
      }
    }

    // Recursively fetch varieties for all evolution stages
    const processChain = async (node: any) => {
      await fetchSpeciesVarieties(node.species.url)
      if (node.evolves_to) {
        for (const evo of node.evolves_to) {
          await processChain(evo)
        }
      }
    }

    await processChain(chain)
  }
</script>
