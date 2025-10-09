<template>
  <div class="w-full my-3">
    <Select v-model="localValue" class="w-fit">
      <SelectTrigger class="size-default">
        <SelectValue placeholder="Sort Asc" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem :value="'asc-id'">
            <span class="flex items-center gap-2">
              <ChevronUp class="size-4" /> Sort Asc
            </span>
          </SelectItem>
          <SelectItem :value="'desc-id'">
            <span class="flex items-center gap-2">
              <ChevronDown class="size-4" /> Sort Desc
            </span>
          </SelectItem>
          <SelectSeparator />
          <SelectItem :value="'az'">
            <span class="flex items-center gap-2">
              <ArrowUp class="size-4" /> A → Z
            </span>
          </SelectItem>
          <SelectItem :value="'za'">
            <span class="flex items-center gap-2">
              <ArrowDown class="size-4" /> Z → A
            </span>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import type { PropType } from 'vue'
  import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '@/components/ui/select'
  import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-vue-next'

  const props = defineProps({ modelValue: { type: String as PropType<string | null>, default: null } })
  const emit = defineEmits(['update:modelValue'])

  const localValue = ref<string | null>(props.modelValue ?? null)
  watch(() => props.modelValue, (v) => { localValue.value = v })
  watch(localValue, (v) => emit('update:modelValue', v))
</script>

<style scoped>
  .w-fit {
    display: inline-flex
  }
</style>
