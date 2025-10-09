export const TYPE_CLASSES: Record<string, string> = {
  normal: 'bg-slate-400 dark:bg-transparent dark:border dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 dark:hover:border-slate-300 hover:scale-105 transition-all text-white',
  fire: 'bg-orange-500 dark:bg-transparent dark:border dark:border-orange-500 dark:text-orange-500 hover:bg-orange-600 dark:hover:bg-orange-500/20 dark:hover:border-orange-400 hover:scale-105 transition-all text-white',
  water: 'bg-blue-500 dark:bg-transparent dark:border dark:border-blue-400 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-400/20 dark:hover:border-blue-300 hover:scale-105 transition-all text-white',
  electric: 'bg-yellow-500 dark:bg-transparent dark:border dark:border-yellow-400 dark:text-yellow-400 hover:bg-yellow-600 dark:hover:bg-yellow-400/20 dark:hover:border-yellow-300 hover:scale-105 transition-all text-white dark:text-yellow-400',
  grass: 'bg-green-500 dark:bg-transparent dark:border dark:border-green-500 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-500/20 dark:hover:border-green-400 hover:scale-105 transition-all text-white',
  ice: 'bg-cyan-500 dark:bg-transparent dark:border dark:border-cyan-400 dark:text-cyan-400 hover:bg-cyan-600 dark:hover:bg-cyan-400/20 dark:hover:border-cyan-300 hover:scale-105 transition-all text-white dark:text-cyan-400',
  fighting: 'bg-red-600 dark:bg-transparent dark:border dark:border-red-600 dark:text-red-500 hover:bg-red-700 dark:hover:bg-red-600/20 dark:hover:border-red-500 hover:scale-105 transition-all text-white',
  poison: 'bg-purple-500 dark:bg-transparent dark:border dark:border-purple-500 dark:text-purple-400 hover:bg-purple-600 dark:hover:bg-purple-500/20 dark:hover:border-purple-400 hover:scale-105 transition-all text-white',
  ground: 'bg-amber-600 dark:bg-transparent dark:border dark:border-amber-600 dark:text-amber-500 hover:bg-amber-700 dark:hover:bg-amber-600/20 dark:hover:border-amber-500 hover:scale-105 transition-all text-white',
  flying: 'bg-indigo-400 dark:bg-transparent dark:border dark:border-indigo-400 dark:text-indigo-400 hover:bg-indigo-500 dark:hover:bg-indigo-400/20 dark:hover:border-indigo-300 hover:scale-105 transition-all text-white',
  psychic: 'bg-pink-500 dark:bg-transparent dark:border dark:border-pink-500 dark:text-pink-400 hover:bg-pink-600 dark:hover:bg-pink-500/20 dark:hover:border-pink-400 hover:scale-105 transition-all text-white',
  bug: 'bg-lime-500 dark:bg-transparent dark:border dark:border-lime-500 dark:text-lime-400 hover:bg-lime-600 dark:hover:bg-lime-500/20 dark:hover:border-lime-400 hover:scale-105 transition-all text-white',
  rock: 'bg-stone-600 dark:bg-transparent dark:border dark:border-stone-500 dark:text-stone-400 hover:bg-stone-700 dark:hover:bg-stone-500/20 dark:hover:border-stone-400 hover:scale-105 transition-all text-white',
  dragon: 'bg-violet-600 dark:bg-transparent dark:border dark:border-violet-600 dark:text-violet-400 hover:bg-violet-700 dark:hover:bg-violet-600/20 dark:hover:border-violet-500 hover:scale-105 transition-all text-white',
  ghost: 'bg-purple-600 dark:bg-transparent dark:border dark:border-purple-600 dark:text-purple-400 hover:bg-purple-700 dark:hover:bg-purple-600/20 dark:hover:border-purple-500 hover:scale-105 transition-all text-white',
  dark: 'bg-zinc-700 dark:bg-transparent dark:border dark:border-zinc-600 dark:text-zinc-400 hover:bg-zinc-800 dark:hover:bg-zinc-600/20 dark:hover:border-zinc-500 hover:scale-105 transition-all text-white',
  steel: 'bg-slate-500 dark:bg-transparent dark:border dark:border-slate-500 dark:text-slate-400 hover:bg-slate-600 dark:hover:bg-slate-500/20 dark:hover:border-slate-400 hover:scale-105 transition-all text-white',
  fairy: 'bg-pink-400 dark:bg-transparent dark:border dark:border-pink-400 dark:text-pink-400 hover:bg-pink-500 dark:hover:bg-pink-400/20 dark:hover:border-pink-300 hover:scale-105 transition-all text-white',
}

export const getTypeClass = (name: string) => TYPE_CLASSES[name] || 'bg-slate-400 dark:bg-transparent dark:border dark:border-slate-400 dark:text-slate-400 hover:bg-slate-500 dark:hover:bg-slate-400/20 hover:scale-105 transition-all text-white'

export default {
  TYPE_CLASSES,
  getTypeClass,
}
