<template>
  <div class="p-4">
    <!-- Search and Filter Section -->
    <div class="flex flex-col items-center p-4">
      <div class="py-12">
        <h1 class="text-5xl font-bold">PokeNuxt</h1>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search Pokémon"
        class="border rounded-lg px-4 py-2 mb-4 w-full max-w-md"
      />

      <!-- Generation Filter -->
      <div class="flex flex-wrap justify-center gap-4 mb-4">
        <label v-for="gen in generations" :key="gen" class="flex items-center space-x-2 bg-gray-100 p-2 rounded-md shadow-sm cursor-pointer">
          <input type="checkbox" :value="gen" v-model="selectedGenerations" class="form-checkbox h-5 w-5 text-blue-500 rounded" />
          <span>{{ gen }}</span>
        </label>
      </div>

      <!-- Element Type Filter with Pill Design -->
      <div class="flex flex-wrap justify-center gap-4 mb-4">
        <label v-for="type in elementTypes" :key="type" class="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" :value="type" v-model="selectedElementTypes" class="hidden" />
          <span :class="['px-4 py-1 rounded-full text-white font-semibold', typeColorClass(type)]">
            {{ type }}
          </span>
        </label>
      </div>

      <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Filter</button>
    </div>

    <!-- Pokémon List with Pagination -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-9 gap-4 px-24 py-6">
      <div
        v-for="pokemon in paginatedPokemon"
        :key="pokemon.id"
        class="border border-4 bg-slate-300 rounded-xl shadow-sm p-4 text-center cursor-pointer"
        @click="openModal(pokemon)"
      >
        <p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
        <img :src="pokemon.sprite" :alt="pokemon.name" class="w-24 h-24 mx-auto mb-2"/>
        <p class="capitalize">{{ pokemon.name }}</p>
        <div class="flex justify-center space-x-2 mt-2">
          <span v-for="type in pokemon.types" :key="type" :class="['px-3 py-1 rounded-full text-white text-xs', typeColorClass(type)]">
            {{ type }}
          </span>
        </div>
      </div>
    </div>

    <!-- Pagination Controls -->
    <div class="mt-4 flex justify-center">
      <button @click="prevPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === 1">Previous</button>
      <button @click="nextPage" class="px-4 py-2 bg-gray-300 rounded mx-1" :disabled="page === totalPages">Next</button>
    </div>

    <!-- Modal for Pokémon Details -->
    <div v-if="selectedPokemon" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
      <div class="bg-white border-4 border shadow-sm p-8 rounded-xl max-w-lg w-full relative">
        <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 p-2">X</button>
        <h2 class="text-xl font-bold mb-4 capitalize">{{ selectedPokemon.name }}</h2>
        <img :src="selectedPokemon.sprite" :alt="selectedPokemon.name" class="w-28 h-28 mx-auto mb-4" />
        
        <!-- Pokemon Details -->
        <p><strong>Origin:</strong> {{ selectedPokemon.origin }}</p>
        <p><strong>Evolution Chain:</strong> {{ selectedPokemon.evolutionChain }}</p>
        <p><strong>Gender Ratio:</strong> {{ selectedPokemon.genderRatio }}</p>
        <p><strong>Weight:</strong> {{ selectedPokemon.weight }} kg</p>

        <!-- Stats -->
        <h3 class="mt-4 mb-2 font-semibold">Stats:</h3>
        <ul>
          <li v-for="stat in selectedPokemon.stats" :key="stat.name">
            <strong>{{ stat.name }}:</strong> {{ stat.base_stat }}
          </li>
        </ul>

        <!-- Abilities -->
        <h3 class="mt-4 mb-2 font-semibold">Abilities:</h3>
        <ul>
          <li v-for="ability in selectedPokemon.abilities" :key="ability.name">
            {{ ability.name }} <span v-if="ability.is_hidden">(Hidden)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed, watch } from "vue";

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
			"Generation 9",
		];
		const elementTypes = [
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
		];

		// Pokémon and pagination data
		const page = ref(1);
		const perPage = 36;
		const pokemonList = ref([]);
		const filteredPokemon = ref([]);
		const selectedPokemon = ref(null);

		// Fetch Pokémon data
		const fetchPokemon = async () => {
			const response = await axios.get(
				"https://pokeapi.co/api/v2/pokemon?limit=2000",
			);
			pokemonList.value = response.data.results.map((p, index) => ({
				id: index + 1,
				name: p.name,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
				types: index % 2 === 0 ? ["Grass", "Poison"] : ["Fire"], // Placeholder types
				origin: "Kanto", // Placeholder
				evolutionChain: "Bulbasaur > Ivysaur > Venusaur", // Placeholder
				genderRatio: "50% male, 50% female", // Placeholder
				stats: [
					{ name: "HP", base_stat: 45 },
					{ name: "Attack", base_stat: 49 },
				], // Placeholder
				abilities: [
					{ name: "Overgrow", is_hidden: false },
					{ name: "Chlorophyll", is_hidden: true },
				], // Placeholder
				weight: 69,
			}));
			filteredPokemon.value = pokemonList.value;
		};

		// Watcher for live search
		watch(searchQuery, (newQuery) => {
			if (newQuery) {
				filteredPokemon.value = pokemonList.value.filter((pokemon) =>
					pokemon.name.toLowerCase().includes(newQuery.toLowerCase()),
				);
			} else {
				filteredPokemon.value = pokemonList.value;
			}
		});

		// Computed property for paginated Pokémon
		const paginatedPokemon = computed(() => {
			const start = (page.value - 1) * perPage;
			return filteredPokemon.value.slice(start, start + perPage);
		});

		// Pagination controls
		const totalPages = computed(() =>
			Math.ceil(filteredPokemon.value.length / perPage),
		);
		const nextPage = () => {
			if (page.value < totalPages.value) page.value++;
		};
		const prevPage = () => {
			if (page.value > 1) page.value--;
		};

		// Modal controls
		const openModal = async (pokemon) => {
			selectedPokemon.value = pokemon;
		};
		const closeModal = () => {
			selectedPokemon.value = null;
		};

		// Apply filters (placeholder)
		const applyFilters = () => {
			console.log("Filters applied");
		};

		// Type color classes
		const typeColorClass = (type) => {
			switch (type) {
				case "Fire":
					return "bg-red-500";
				case "Water":
					return "bg-blue-500";
				case "Grass":
					return "bg-green-500";
				case "Electric":
					return "bg-yellow-500";
				case "Ice":
					return "bg-teal-400";
				case "Fighting":
					return "bg-orange-500";
				case "Poison":
					return "bg-purple-600";
				case "Ground":
					return "bg-yellow-800";
				case "Flying":
					return "bg-blue-300";
				case "Psychic":
					return "bg-pink-500";
				case "Bug":
					return "bg-green-700";
				case "Rock":
					return "bg-gray-600";
				case "Dragon":
					return "bg-indigo-500";
				case "Ghost":
					return "bg-indigo-800";
				case "Dark":
					return "bg-gray-800";
				case "Steel":
					return "bg-gray-500";
				case "Fairy":
					return "bg-pink-300";
				default:
					return "bg-gray-400";
			}
		};

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
			applyFilters,
			typeColorClass,
			selectedPokemon,
		};
	},
};
</script>