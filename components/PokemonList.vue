<template>
  <div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div 
        v-for="pokemon in paginatedPokemon" 
        :key="pokemon.id" 
        class="border p-4 text-center cursor-pointer"
        @click="openModal(pokemon)"
      >
        <img :src="pokemon.sprite" :alt="pokemon.name" class="w-16 h-16 mx-auto mb-2"/>
        <p>{{ pokemon.name }}</p>
      </div>
    </div>

    <div class="mt-4 flex justify-center">
      <button 
        @click="prevPage" 
        class="px-4 py-2 bg-gray-300 rounded mx-1" 
        :disabled="page === 1">Prev
      </button>
      <button 
        @click="nextPage" 
        class="px-4 py-2 bg-gray-300 rounded mx-1"
        :disabled="page === totalPages">Next
      </button>
    </div>

    <!-- Modal for Pokemon details -->
    <div v-if="selectedPokemon" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-8 rounded-lg max-w-lg w-full relative">
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

<script setup>
import { ref, computed } from "vue";

const page = ref(1);
const perPage = 8; // Number of Pokémon per page

// Example Pokémon list
const pokemonList = ref([
	// Add fetched Pokémon data here with properties like id, name, sprite, etc.
]);

const paginatedPokemon = computed(() => {
	const start = (page.value - 1) * perPage;
	return pokemonList.value.slice(start, start + perPage);
});

const totalPages = computed(() =>
	Math.ceil(pokemonList.value.length / perPage),
);

const nextPage = () => {
	if (page.value < totalPages.value) page.value++;
};

const prevPage = () => {
	if (page.value > 1) page.value--;
};

const selectedPokemon = ref(null);

const openModal = (pokemon) => {
	selectedPokemon.value = pokemon;
};

const closeModal = () => {
	selectedPokemon.value = null;
};
</script>
