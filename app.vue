<template>
  <div class="p-4">
    <!-- Search and Filter Section -->
    <div class="flex flex-col items-center p-4">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search Pokémon" 
        class="border rounded-lg px-4 py-2 mb-4 w-full max-w-md"
      />
      
      <!-- Generation Filter -->
      <div class="flex space-x-4 mb-4">
        <label v-for="gen in generations" :key="gen" class="flex items-center">
          <input type="checkbox" :value="gen" v-model="selectedGenerations" class="mr-2" />
          {{ gen }}
        </label>
      </div>
      
      <!-- Element Type Filter -->
      <div class="flex flex-wrap gap-4 mb-4">
        <label v-for="type in elementTypes" :key="type" class="flex items-center">
          <input type="checkbox" :value="type" v-model="selectedElementTypes" class="mr-2" />
          {{ type }}
        </label>
      </div>

      <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Filter</button>
    </div>

    <!-- Pokémon List with Pagination -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-10 gap-4">
      <div 
        v-for="pokemon in paginatedPokemon" 
        :key="pokemon.id" 
        class="border border-2 rounded-xl shadow-sm p-4 text-center cursor-pointer"
        @click="openModal(pokemon)"
      >
        <img :src="pokemon.sprite" :alt="pokemon.name" class="w-24 h-24 mx-auto mb-2"/>
        <p class="capitalize">{{ pokemon.name }}</p>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="mt-4 flex justify-center">
      <button @click="prevPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === 1">Previous</button>
      <button @click="nextPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === totalPages">Next</button>
    </div>

    <!-- Modal for Pokémon Details -->
    <div v-if="selectedPokemon" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
      <div class="bg-white border-2 border shadow-sm p-8 rounded-xl max-w-lg w-full relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500">X</button>
        <h2 class="text-xl font-bold mb-4">{{ selectedPokemon.name }}</h2>
        <p><strong>Berries:</strong> {{ selectedPokemon.berries }}</p>
        <p><strong>Contests:</strong> {{ selectedPokemon.contests }}</p>
        <p><strong>Encounters:</strong> {{ selectedPokemon.encounters }}</p>
        <p><strong>Evolution:</strong> {{ selectedPokemon.evolution }}</p>
        <p><strong>Games:</strong> {{ selectedPokemon.games }}</p>
        <p><strong>Items:</strong> {{ selectedPokemon.items }}</p>
        <p><strong>Locations:</strong> {{ selectedPokemon.locations }}</p>
        <p><strong>Machines:</strong> {{ selectedPokemon.machines }}</p>
        <p><strong>Moves:</strong> {{ selectedPokemon.moves }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed } from "vue";

export default {
	setup() {
		// Search and filter data
		const searchQuery = ref("");
		const selectedGenerations = ref([]);
		const selectedElementTypes = ref([]);
		const generations = [
			"Generation 1",
			"Generation 2",
			"Generation 3",
			"Generation 4",
			"Generation 5",
			"Generation 6",
			"Generation 7",
			"Generation 8",
		];
		const elementTypes = [
			"Fire",
			"Water",
			"Grass",
			"Electric",
			"Ice",
			"Dragon",
		];

		// Pagination and Pokémon list data
		const page = ref(1);
		const perPage = 40;
		const pokemonList = ref([]);
		const selectedPokemon = ref(null);

		// Fetch Pokémon data from API
		const fetchPokemon = async () => {
			const response = await axios.get(
				"https://pokeapi.co/api/v2/pokemon?limit=2000",
			);
			pokemonList.value = response.data.results.map((p, index) => ({
				id: index + 1,
				name: p.name,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
				berries: "Example Berries",
				contests: "Example Contests",
				encounters: "Example Encounters",
				evolution: "Example Evolution",
				games: "Example Games",
				items: "Example Items",
				locations: "Example Locations",
				machines: "Example Machines",
				moves: "Example Moves",
			}));
		};

		// Computed property for paginated Pokémon
		const paginatedPokemon = computed(() => {
			const start = (page.value - 1) * perPage;
			return pokemonList.value.slice(start, start + perPage);
		});

		// Pagination controls
		const totalPages = computed(() =>
			Math.ceil(pokemonList.value.length / perPage),
		);
		const nextPage = () => {
			if (page.value < totalPages.value) page.value++;
		};
		const prevPage = () => {
			if (page.value > 1) page.value--;
		};

		// Modal controls
		const openModal = (pokemon) => {
			selectedPokemon.value = pokemon;
		};
		const closeModal = () => {
			selectedPokemon.value = null;
		};

		// Apply filters (this is just a placeholder for now)
		const applyFilters = () => {
			console.log("Search Query:", searchQuery.value);
			console.log("Selected Generations:", selectedGenerations.value);
			console.log("Selected Element Types:", selectedElementTypes.value);
		};

		// Fetch Pokémon when the component is mounted
		fetchPokemon();

		return {
			searchQuery,
			selectedGenerations,
			selectedElementTypes,
			generations,
			elementTypes,
			paginatedPokemon,
			page,
			totalPages,
			nextPage,
			prevPage,
			openModal,
			closeModal,
			selectedPokemon,
			applyFilters,
		};
	},
};
</script>

<style>
/* Add any global styles here if needed */
</style>
