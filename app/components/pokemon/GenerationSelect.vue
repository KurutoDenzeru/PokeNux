<template>
  <div class="w-full mb-4">
    <Select v-model="internal" class="w-64">
      <SelectTrigger class="w-full" aria-label="Select generation">
        <SelectValue placeholder="All generations" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <template v-for="opt in options" :key="opt.value">
            <SelectItem :value="opt.value">
              <SelectItemText>{{ opt.label }}</SelectItemText>
            </SelectItem>
          </template>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PropType } from 'vue'
import Select from '@/components/ui/select/Select.vue'
import { SelectContent, SelectGroup, SelectItem, SelectItemText, SelectTrigger, SelectValue } from '@/components/ui/select'

const props = defineProps({
  modelValue: { type: [String, Number, null] as PropType<string | number | null>, default: null }
})
const emit = defineEmits(['update:modelValue'])

const internal = ref<string | number | null>(props.modelValue)
watch(() => props.modelValue, (v) => { internal.value = v })
watch(internal, (v) => emit('update:modelValue', v))

const options = [
  { value: 'gen1', label: 'Generation 1 - Kanto' },
  { value: 'gen2', label: 'Generation 2 - Johto' },
  { value: 'gen3', label: 'Generation 3 - Hoenn' },
  { value: 'gen4', label: 'Generation 4 - Sinnoh' },
  { value: 'gen5', label: 'Generation 5 - Unova' },
  { value: 'gen6', label: 'Generation 6 - Kalos' },
  { value: 'gen7', label: 'Generation 7 - Alola' },
  { value: 'gen8', label: 'Generation 8 - Galar' },
  { value: 'gen9', label: 'Generation 9 - Paldea' },
]
</script>

<style scoped>
.w-64 { width: 16rem; }
</style>
