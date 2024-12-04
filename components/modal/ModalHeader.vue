<template>
  <div class="sticky top-0 rounded-t-xl bg-white z-10 px-6 md:px-8 py-4 border-b">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-gray-600 font-semibold text-xl">#{{ String(selectedPokemon.id).padStart(4, '0') }}</span>
        <h2 class="text-xl font-semibold text-gray-900 capitalize">{{ selectedPokemon.name }}</h2>
        <template v-if="selectedPokemon?.isBaby || selectedPokemon?.isLegendary || selectedPokemon?.isMythical">
          <span
            :class="[
              'px-4 py-1 rounded-lg text-white text-md font-semibold',
              selectedPokemon?.isBaby ? 'bg-pink-500' :
              selectedPokemon?.isLegendary ? 'bg-yellow-500' :
              'bg-purple-500'
            ]"
          >
            {{ getPokemonCategory }}
          </span>
        </template>
      </div>
      <button 
        @click="closeModal" 
        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
      >
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
        <span class="sr-only">Close modal</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
	name: "StickyHeader",
	props: {
		selectedPokemon: {
			type: Object,
			required: true,
		},
	},
	computed: {
		getPokemonCategory() {
			if (this.selectedPokemon?.isBaby) return "👶 Baby Pokemon";
			if (this.selectedPokemon?.isLegendary) return "👑 Legendary";
			if (this.selectedPokemon?.isMythical) return "✨ Mythical";
			return "";
		},
	},
	methods: {
		closeModal() {
			this.$emit("close-modal");
		},
	},
};
</script>