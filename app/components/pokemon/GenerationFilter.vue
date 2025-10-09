<template>
  <div class="w-full my-3">
    <Select v-model="localValue" class="w-fit">
      <SelectTrigger class="size-default">
        <SelectValue placeholder="All generations" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="'all'">All Generations</SelectItem>
          <SelectSeparator />
          <template v-for="g in generations" :key="g.key">
            <SelectItem :value="g.key">{{ g.label }}</SelectItem>
          </template>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { PropType } from 'vue'
  import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

  const props = defineProps({
    modelValue: { type: String as PropType<string | null>, default: null }
  })
  const emit = defineEmits(['update:modelValue'])

  const generations = [
    { key: 'gen1', label: 'Generation 1 - Kanto' },
    { key: 'gen2', label: 'Generation 2 - Johto' },
    { key: 'gen3', label: 'Generation 3 - Hoenn' },
    { key: 'gen4', label: 'Generation 4 - Sinnoh' },
    { key: 'gen5', label: 'Generation 5 - Unova' },
    { key: 'gen6', label: 'Generation 6 - Kalos' },
    { key: 'gen7', label: 'Generation 7 - Alola' },
    { key: 'gen8', label: 'Generation 8 - Galar' },
    { key: 'gen9', label: 'Generation 9 - Paldea' },
  ]

  const localValue = ref<string | null>(props.modelValue ?? null)
  watch(() => props.modelValue, (v) => { localValue.value = v })
  watch(localValue, (v) => emit('update:modelValue', v))
</script>

<style scoped>

  /* small adjustments so select fits visually */
  .w-fit {
    display: inline-flex;
  }
</style>
