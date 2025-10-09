<template>
  <div class="flex flex-wrap justify-center gap-3 mb-4">
    <template v-for="key in order" :key="key">
      <Button variant="outline" type="button"
        class="px-4 py-1 rounded-lg text-white text-md font-semibold flex items-center gap-2 transition-colors duration-150 focus:outline-none cursor-pointer"
        :class="[modelValue === key ? 'ring-2 ring-offset-2 ring-zinc-400' : 'ring-0', badgeClass(key)]"
        @click="onClick(key)">
        <span class="text-sm leading-none">{{ types[key]?.emoji || '' }}</span>
        <span class="capitalize text-sm">{{ capitalize(key) }}</span>
      </Button>
    </template>
  </div>
</template>

<script setup lang="ts">
  import type { PropType } from 'vue'

  const props = defineProps({
    types: { type: Object as PropType<Record<string, any>>, required: true },
    order: { type: Array as PropType<string[]>, required: true },
    modelValue: { type: String as PropType<string | null>, default: null },
  })

  const emit = defineEmits(['update:modelValue'])

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  const onClick = (key: string) => {
    // toggle: if clicking the active key, clear the filter
    if (props.modelValue === key) {
      emit('update:modelValue', null)
    } else {
      emit('update:modelValue', key)
    }
  }

  // Use outline style in dark mode with type-specific colors from types.ts
  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 dark:hover:border-slate-300 text-white transition-all',
    fire: 'bg-orange-500 dark:bg-transparent dark:border-orange-500 dark:text-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500/20 dark:hover:border-orange-400 text-white transition-all',
    water: 'bg-blue-500 dark:bg-transparent dark:border-blue-400 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-400/20 dark:hover:border-blue-300 text-white transition-all',
    electric: 'bg-yellow-500 dark:bg-transparent dark:border-yellow-400 dark:text-yellow-400 hover:bg-yellow-600 dark:hover:bg-yellow-400/20 dark:hover:border-yellow-300 text-white dark:text-yellow-400 transition-all',
    grass: 'bg-green-500 dark:bg-transparent dark:border-green-500 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-500/20 dark:hover:border-green-400 text-white transition-all',
    ice: 'bg-cyan-500 dark:bg-transparent dark:border-cyan-400 dark:text-cyan-400 hover:bg-cyan-600 dark:hover:bg-cyan-400/20 dark:hover:border-cyan-300 text-white dark:text-cyan-400 transition-all',
    fighting: 'bg-red-600 dark:bg-transparent dark:border-red-600 dark:text-red-500 hover:bg-red-700 dark:hover:bg-red-600/20 dark:hover:border-red-500 text-white transition-all',
    poison: 'bg-purple-500 dark:bg-transparent dark:border-purple-500 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-500/20 dark:hover:border-purple-400 text-white transition-all',
    ground: 'bg-amber-600 dark:bg-transparent dark:border-amber-600 dark:text-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600/20 dark:hover:border-amber-500 text-white transition-all',
    flying: 'bg-indigo-400 dark:bg-transparent dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-400/20 dark:hover:border-indigo-300 text-white transition-all',
    psychic: 'bg-pink-500 dark:bg-transparent dark:border-pink-500 dark:text-pink-400 hover:bg-pink-600 dark:hover:bg-pink-500/20 dark:hover:border-pink-400 text-white transition-all',
    bug: 'bg-lime-500 dark:bg-transparent dark:border-lime-500 dark:text-lime-400 hover:bg-lime-600 dark:hover:bg-lime-500/20 dark:hover:border-lime-400 text-white transition-all',
    rock: 'bg-stone-600 dark:bg-transparent dark:border-stone-500 dark:text-stone-400 hover:bg-stone-700 dark:hover:bg-stone-500/20 dark:hover:border-stone-400 text-white transition-all',
    dragon: 'bg-violet-600 dark:bg-transparent dark:border-violet-600 dark:text-violet-400 hover:bg-violet-700 dark:hover:bg-violet-600/20 dark:hover:border-violet-500 text-white transition-all',
    ghost: 'bg-purple-600 dark:bg-transparent dark:border-purple-600 dark:text-purple-400 hover:bg-purple-700 dark:hover:bg-purple-600/20 dark:hover:border-purple-500 text-white transition-all',
    dark: 'bg-zinc-700 dark:bg-transparent dark:border-zinc-600 dark:text-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-600/20 dark:hover:border-zinc-500 text-white transition-all',
    steel: 'bg-slate-500 dark:bg-transparent dark:border-slate-500 dark:text-slate-400 hover:bg-slate-600 dark:hover:bg-slate-500/20 dark:hover:border-slate-400 text-white transition-all',
    fairy: 'bg-pink-400 dark:bg-transparent dark:border-pink-400 dark:text-pink-400 hover:bg-pink-500 dark:hover:bg-pink-400/20 dark:hover:border-pink-300 text-white transition-all',
  }

  const badgeClass = (key: string) => {
    return TYPE_CLASSES[key] || 'bg-slate-400 dark:bg-transparent dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 text-white'
  }
</script>

<style scoped>

  /* Small responsive tweaks */
  @media (max-width: 640px) {
    span.px-4.py-1 {
      padding-left: 0.6rem;
      padding-right: 0.6rem;
      font-size: 0.875rem;
    }
  }
</style>
