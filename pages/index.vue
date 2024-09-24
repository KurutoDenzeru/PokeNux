<template>
  <div class="p-4">
    <Filters
      :searchQuery="searchQuery"
      :selectedGenerations="selectedGenerations"
      :selectedElementTypes="selectedElementTypes"
      :generations="generations"
      :elementTypes="elementTypes"
      @update:searchQuery="searchQuery = $event"
      @update:selectedGenerations="selectedGenerations = $event"
      @update:selectedElementTypes="selectedElementTypes = $event"
      @applyFilters="applyFilters"
    />

    <!-- Pokémon List with Pagination -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-9 gap-4 px-24 py-6">
      <PokemonCard
        v-for="pokemon in paginatedPokemon"
        :key="pokemon.id"
        :pokemon="pokemon"
        @openModal="openModal"
      />
    </div>

    <!-- Pagination Controls -->
    <div class="mt-4 flex justify-center">
      <button @click="prevPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === 1">Previous</button>
      <button @click="nextPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === totalPages">Next</button>
    </div>

    <!-- Modal -->
    <PokemonModal v-if="selectedPokemon" :pokemon="selectedPokemon" @close="closeModal"/>
  </div>
</template>

<script>
import axios from "axios";
import Filters from "../components/Filters.vue";
import PokemonCard from "../components/PokemonCard.vue";
import PokemonModal from "../components/PokemonModal.vue";

export default {
	components: {
		Filters,
		PokemonCard,
		PokemonModal,
	},
	data() {
		return {
			searchQuery: "",
			selectedGenerations: [],
			selectedElementTypes: [],
			generations: [
				/* Generation list */
			],
			elementTypes: [
				/* Type list */
			],
			pokemonList: [],
			filteredPokemon: [],
			selectedPokemon: null,
			page: 1,
			perPage: 36,
		};
	},
	computed: {
		paginatedPokemon() {
			const start = (this.page - 1) * this.perPage;
			return this.filteredPokemon.slice(start, start + this.perPage);
		},
		totalPages() {
			return Math.ceil(this.filteredPokemon.length / this.perPage);
		},
	},
	methods: {
		async fetchPokemon() {
			const response = await axios.get(
				"https://pokeapi.co/api/v2/pokemon?limit=2000",
			);
			this.pokemonList = response.data.results.map((p, index) => ({
				id: index + 1,
				name: p.name,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
				types: [], // To be fetched
			}));
			this.filteredPokemon = this.pokemonList;
		},
		applyFilters() {
			// Implement filter logic here
		},
		openModal(pokemon) {
			this.selectedPokemon = pokemon;
		},
		closeModal() {
			this.selectedPokemon = null;
		},
		nextPage() {
			if (this.page < this.totalPages) this.page++;
		},
		prevPage() {
			if (this.page > 1) this.page--;
		},
	},
	mounted() {
		this.fetchPokemon();
	},
};
</script>
