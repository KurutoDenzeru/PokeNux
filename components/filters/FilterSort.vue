<template>
    <!-- Search Input -->
    <input 
      v-model="searchQuery" 
      type="text" 
      placeholder="Search Pokémon"
      class="g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 max-w-md" 
      @input="emitSearch"
    />

    <!-- Types Section -->
    <div class="py-6 text-left w-full">
      <h1 class="text-2xl font-semibold text-left w-full">Types:</h1>
    </div>

    <!-- Element Type Filter -->
    <div class="flex flex-wrap justify-center gap-4 mb-4">
      <label 
        v-for="(type, index) in elementTypes" 
        :key="type" 
        class="flex items-center cursor-pointer"
        :class="{
          'w-full flex justify-center': index >= 18,
          'w-auto': index < 18,
        }"
      >
        <input 
          type="radio" 
          :value="type" 
          v-model="selectedType" 
          class="hidden" 
          @change="emitTypeChange"
        />
        <span :class="['px-4 py-1 rounded-lg text-white text-md font-semibold', typeColorClass(type)]">
          {{ getEmojiForType(type) }} {{ type }}
        </span>
      </label>
    </div>

    <hr class="my-4 h-px p-1 w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-emerald-900 to-transparent opacity-25 dark:via-neutral-400" />

    <!-- Pokemon Count -->
    <div class="py-6 text-left w-full">
      <h1 class="text-2xl font-semibold text-left w-full">
        Select your Pokémon ({{ pokemonCount }} of {{ totalPokemon }}):
      </h1>
    </div>

    <!-- Generation and Sort Filters -->
    <div class="flex text-left flex-wrap w-full gap-4 mb-4">
      <div class="flex items-center">
        <label for="generation-filter" class="mr-2 font-semibold">Game Generation:</label>
        <select 
          id="generation-filter" 
          v-model="selectedGeneration" 
          class="border rounded-lg px-4 py-2"
          @change="emitGenerationChange"
        >
          <option value="All">All</option>
          <option v-for="gen in generations" :key="gen" :value="gen">{{ gen }}</option>
        </select>
      </div>
      <div class="flex items-center">
        <label for="sort-filter" class="mr-2 font-semibold">Sort Pokémon:</label>
        <select 
          id="sort-filter" 
          v-model="sortOption" 
          class="border rounded-lg px-4 py-2"
          @change="emitSortChange"
        >
          <option value="number">Number</option>
          <option value="name">Name</option>
        </select>
      </div>
    </div>
</template>

<script>
export default {
	name: "FilterSort",
	emits: ["search", "type-change", "generation-change", "sort-change"],
	props: {
		totalPokemon: {
			type: Number,
			required: true,
		},
		pokemonCount: {
			type: Number,
			required: true,
		},
	},
	data() {
		return {
			searchQuery: "",
			selectedType: "",
			selectedGeneration: "All",
			sortOption: "number",
			elementTypes: [
				"Normal",
				"Fire",
				"Water",
				"Grass",
				"Electric",
				"Ice",
				"Fighting",
				"Poison",
				"Ground",
				"Flying",
				"Psychic",
				"Bug",
				"Rock",
				"Dragon",
				"Ghost",
				"Dark",
				"Steel",
				"Fairy",
			],
			generations: [
				"Generation 1",
				"Generation 2",
				"Generation 3",
				"Generation 4",
				"Generation 5",
				"Generation 6",
				"Generation 7",
				"Generation 8",
				"Generation 9",
				"Generation 10",
			],
		};
	},
	methods: {
		typeColorClass(type) {
			const typeColors = {
				fire: "bg-orange-500 hover:bg-orange-600",
				water: "bg-blue-400 hover:bg-blue-500",
				grass: "bg-lime-500 hover:bg-lime-600",
				electric: "bg-yellow-500 hover:bg-yellow-600",
				ice: "bg-teal-500 hover:bg-teal-600",
				fighting: "bg-red-600 hover:bg-red-700",
				poison: "bg-purple-600 hover:bg-purple-700",
				ground: "bg-yellow-400 hover:bg-yellow-500",
				flying: "bg-violet-400 hover:bg-violet-500",
				psychic: "bg-pink-500 hover:bg-pink-600",
				bug: "bg-lime-600 hover:bg-lime-700",
				rock: "bg-yellow-600 hover:bg-yellow-700",
				dragon: "bg-indigo-500 hover:bg-indigo-600",
				ghost: "bg-purple-500 hover:bg-purple-600",
				dark: "bg-gray-800 hover:bg-gray-900",
				steel: "bg-gray-400 hover:bg-gray-500",
				fairy: "bg-pink-400 hover:bg-pink-500",
				normal: "bg-gray-400 hover:bg-gray-500",
			};
			return typeColors[type.toLowerCase()] || "bg-gray-400";
		},
		getEmojiForType(type) {
			const emojis = {
				fire: "🔥",
				water: "💧",
				grass: "🌿",
				electric: "⚡",
				ice: "❄️",
				fighting: "🥊",
				poison: "🧪",
				ground: "🌍",
				flying: "🕊️",
				psychic: "🔮",
				bug: "🐛",
				rock: "🗿",
				ghost: "👻",
				dragon: "🐉",
				dark: "🌑",
				steel: "⚙️",
				fairy: "🧚",
				normal: "⭐",
			};
			return emojis[type.toLowerCase()] || "❓";
		},
		emitSearch() {
			this.$emit("search", this.searchQuery);
		},
		emitTypeChange() {
			this.$emit("type-change", this.selectedType);
		},
		emitGenerationChange() {
			this.$emit("generation-change", this.selectedGeneration);
		},
		emitSortChange() {
			this.$emit("sort-change", this.sortOption);
		},
	},
};
</script>