<template>
    <div class="p-6 w-full h-full mx-auto max-w-screen-xl">
        <!-- Search and Filter Section -->
        <div class="flex flex-col items-center">
            <div class="py-12">
                <h1
                    class="lg:text-9xl md:text-8xl sm:text-9xl xs:text-8xl text-8xl font-bold bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">
                    PokeNuxt</h1>
            </div>
            <input v-model="searchQuery" type="text" placeholder="Search Pokémon"
                class="border rounded-lg px-4 py-2 mb-4 w-full max-w-md" />

            <div class="py-6 text-left w-full">
                <h1 class="text-2xl font-semibold text-left w-full">Types:</h1>
            </div>

            <!-- Element Type Filter with Pill Design -->
            <div class="flex flex-wrap justify-center gap-4 mb-4">
                <label v-for="(type, index) in elementTypes" :key="type" class="flex items-center cursor-pointer"
                    :class="{
                        'w-full flex justify-center': index >= 18,
                        'w-auto': index < 18,
                    }">
                    <input type="checkbox" :value="type" v-model="selectedElementTypes" class="hidden" />
                    <span :class="['px-4 py-1 rounded-lg text-white font-semibold', typeColorClass(type)]">
                        {{ type }}
                    </span>
                </label>
            </div>

            <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded">Filter</button>

			<hr class="my-4 h-px p-1 w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-emerald-900 to-transparent opacity-25 dark:via-neutral-400" />

			<div class="py-6 text-left w-full">
                <h1 class="text-2xl font-semibold text-left w-full">Select your Pokémon ({{ totalPokemon }}):</h1>
            </div>

			<!-- Generation Filter -->
            <div class="flex flex-wrap justify-center gap-4 mb-4">
                <label for="generation-filter" class="sr-only">Select Generation</label>
                <select id="generation-filter" v-model="selectedGeneration" class="border rounded-lg px-4 py-2">
                    <option value="All">All</option>
                    <option v-for="gen in generations" :key="gen" :value="gen">{{ gen }}</option>
                </select>
            </div>
        </div>

        <!-- Pokémon List with Pagination -->
		<div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-6">
			<div v-for="pokemon in paginatedPokemon" :key="pokemon.id"
			@click="openModal(pokemon)"
			@mousemove="handleMouseMove"
			@mouseleave="handleMouseLeave"
			:class="['pokemon-card bg-slate-300 border-4 border-slate-400 rounded-xl shadow-md p-4 text-center cursor-pointer transition-transform duration-300', (pokemon.types[0])]"
			ref="pokemonCard">
			<p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
			<img :src="pokemon.sprite" :alt="pokemon.name" class="w-28 h-28 mx-auto mb-2" />
			<p class="capitalize">{{ pokemon.name }}</p>
			<div class="flex flex-wrap justify-center space-x-2 mt-2">
				<span v-for="type in pokemon.types" :key="type"
				:class="['px-3 py-1 rounded-lg capitalize text-white text-sm shadow-md', typeColorClass(type)]">
				{{ type }}
				</span>
			</div>
			</div>
		</div>

        <!-- Pagination Controls -->
        <div class="mt-4 flex justify-end">
            <button @click="prevPage" class="px-6 py-2 bg-gray-300 rounded mx-1 shadow-sm"
                :disabled="page === 1">Previous</button>
            <button @click="nextPage" class="px-6 py-2 bg-gray-300 rounded mx-1 shadow-sm"
                :disabled="page === totalPages">Next</button>
        </div>

        <!-- Modal for Pokémon Details -->
        <transition name="fade">
            <div v-if="selectedPokemon" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
                <div class="bg-white border-4 shadow-sm p-8 rounded-xl max-w-5xl w-full relative">
                    <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 p-2">X</button>
                    <h2 class="text-xl font-bold mb-4 capitalize">{{ selectedPokemon.name }}</h2>
                    <img :src="selectedPokemon.sprite" :alt="selectedPokemon.name" class="w-32 h-32 mx-auto mb-4" />

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
        </transition>

		<footer class="bg-white rounded-lg shadow m-4 mx-auto">
			<div class="w-full max-w-screen-xl mx-auto p-6 md:py-8">
				<div class="sm:flex sm:items-center sm:justify-between">
					<a href="https://pokenuxt.nuxt.dev/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
						<img src="/public/favicon.avif" class="h-12" alt="PokeNuxt Logo" />
						<span class="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">PokeNuxt</span>
					</a>
					<ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
						<li>
							<a href="#" class="hover:underline me-4 md:me-6">About</a>
						</li>
						<li>
							<a href="#" class="hover:underline me-4 md:me-6">Privacy Policy</a>
						</li>
						<li>
							<a href="#" class="hover:underline me-4 md:me-6">Licensing</a>
						</li>
						<li>
							<a href="#" class="hover:underline">Contact</a>
						</li>
					</ul>
				</div>
				<hr class="my-6 lg:my-8 h-px p-1 w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-emerald-900 to-transparent opacity-25 dark:via-neutral-400" />
				<span class="block text-sm text-gray-500 sm:text-center ">© 2023 <a href="https://pokenuxt.nuxt.dev/" class="hover:underline">Flowbite™</a>. All Rights Reserved.</span>
			</div>
		</footer>

    </div>
</template>

<script>
import axios from "axios";
import { computed, ref, watch } from "vue";

export default {
	setup() {
		// SEO and Meta
		useHead({
			title: "PokeNuxt",
			meta: [
				{
					name: "description",
					content:
						"Sleek Pokédex with detailed Pokémon info, built with Nuxt.js, Tailwind CSS, and PokéAPI.",
				},
			],
			link: [
				{
					rel: "icon",
					type: "image/x-icon",
					href: "/rotom.avif",
				},
			],
		});

		// Search and filter data
		const searchQuery = ref("");
		const selectedGeneration = ref("All");
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
		const perPage = 24;
		const pokemonList = ref([]);
		const filteredPokemon = ref([]);
		const selectedPokemon = ref(null);

		// Fetch Pokémon data
		const fetchPokemon = async () => {
			const response = await axios.get(
				"https://pokeapi.co/api/v2/pokemon?limit=1025",
			);
			pokemonList.value = response.data.results.map((p, index) => ({
				id: index + 1,
				name: p.name,
				sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
				url: p.url, // Ensure the URL is correctly assigned
				types: [], // Will be populated later
				generation: "", // Add a new property for the generation
			}));

			// Fetch types for each Pokemon
			await Promise.all(
				pokemonList.value.map(async (pokemon) => {
					const detailsResponse = await axios.get(pokemon.url);
					pokemon.types = detailsResponse.data.types.map((t) => t.type.name);

					// Determine the generation of the Pokémon
					const generationNumber = Math.floor((pokemon.id - 1) / 151) + 1;
					const generationName = `Generation ${generationNumber}`;
					pokemon.generation = generationName;
				}),
			);

			filteredPokemon.value = pokemonList.value;
		};

		// Fetch detailed Pokémon information when modal is opened
		const fetchPokemonDetails = async (pokemon) => {
			const detailsResponse = await axios.get(
				`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`,
			);
			const speciesResponse = await axios.get(detailsResponse.data.species.url);

			pokemon.weight = detailsResponse.data.weight / 10; // Convert hectograms to kilograms
			pokemon.stats = detailsResponse.data.stats;
			pokemon.abilities = detailsResponse.data.abilities.map((a) => ({
				name: a.ability.name,
				is_hidden: a.is_hidden,
			}));

			// Fetch evolution chain
			const evolutionChainUrl = speciesResponse.data.evolution_chain.url;
			const evolutionChainResponse = await axios.get(evolutionChainUrl);

			const chain = evolutionChainResponse.data.chain;

			let evolutionText = chain.species.name;
			let evolvesTo = chain.evolves_to;
			while (evolvesTo.length > 0) {
				evolutionText += ` -> ${evolvesTo[0].species.name}`;
				evolvesTo = evolvesTo[0].evolves_to;
			}
			pokemon.evolutionChain = evolutionText;

			// Get gender ratio
			const genderRate = speciesResponse.data.gender_rate;
			const femalePercent = (genderRate / 8) * 100;
			const malePercent = 100 - femalePercent;
			pokemon.genderRatio = `${malePercent}% male, ${femalePercent}% female`;
			pokemon.cryUrl = detailsResponse.data.cries?.latest;

			console.log(detailsResponse.data);
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

		watch(selectedGeneration, (newGeneration) => {
			if (newGeneration === "All") {
				selectedGenerations.value = [];
			} else {
				selectedGenerations.value = [newGeneration];
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

		// Play Pokemon cry
		const playCry = (pokemon) => {
			console.log(pokemon.cryUrl);
			if (pokemon) {
				const audio = new Audio(pokemon.cryUrl);
				audio.play();
			} else {
				console.log("No cry available for this Pokemon.");
			}
		};

		// Modal controls
		const openModal = async (pokemon) => {
			await fetchPokemonDetails(pokemon);
			selectedPokemon.value = pokemon;
			playCry(pokemon);
		};
		const closeModal = () => {
			selectedPokemon.value = null;
		};

		// Apply filters
		const applyFilters = () => {
			filteredPokemon.value = pokemonList.value.filter((pokemon) => {
				const matchesGeneration =
					selectedGenerations.value.length === 0 ||
					selectedGenerations.value.some((gen) => {
						const genNumber = Number.parseInt(gen.split(" ")[1]);
						return (
							(genNumber === 1 && pokemon.id <= 151) ||
							(genNumber === 2 && pokemon.id >= 152 && pokemon.id <= 251) ||
							(genNumber === 3 && pokemon.id >= 252 && pokemon.id <= 386) ||
							(genNumber === 4 && pokemon.id >= 387 && pokemon.id <= 493) ||
							(genNumber === 5 && pokemon.id >= 494 && pokemon.id <= 649) ||
							(genNumber === 6 && pokemon.id >= 650 && pokemon.id <= 721) ||
							(genNumber === 7 && pokemon.id >= 722 && pokemon.id <= 809) ||
							(genNumber === 8 && pokemon.id >= 810 && pokemon.id <= 898) ||
							(genNumber === 9 && pokemon.id >= 899)
						);
					});

				const matchesType =
					selectedElementTypes.value.length === 0 ||
					pokemon.types.some((type) =>
						selectedElementTypes.value.includes(type),
					);

				return matchesGeneration && matchesType;
			});
			page.value = 1;
		};

		fetchPokemon();

		// Type color classes
		const typeColorClass = (type) => {
			switch (type.toLowerCase()) {
				case "fire":
					return "bg-red-500";
				case "water":
					return "bg-blue-500";
				case "grass":
					return "bg-green-500";
				case "electric":
					return "bg-yellow-500";
				case "ice":
					return "bg-teal-400";
				case "fighting":
					return "bg-orange-500";
				case "poison":
					return "bg-purple-600";
				case "ground":
					return "bg-yellow-800";
				case "flying":
					return "bg-blue-300";
				case "psychic":
					return "bg-pink-500";
				case "bug":
					return "bg-green-700";
				case "rock":
					return "bg-gray-600";
				case "dragon":
					return "bg-indigo-500";
				case "ghost":
					return "bg-indigo-800";
				case "dark":
					return "bg-gray-800";
				case "steel":
					return "bg-gray-500";
				case "fairy":
					return "bg-pink-300";
				default:
					return "bg-gray-400";
			}
		};

		return {
			searchQuery,
			selectedGeneration,
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
			playCry,
		};
	},
	data() {
		return {
			totalPokemon: 0,
		};
	},
	mounted() {
		fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
			.then((response) => response.json())
			.then((data) => {
				this.totalPokemon = data.count;
			})
			.catch((error) => {
				console.error("Error fetching Pokémon data:", error);
			});
	},
	methods: {
		handleMouseMove(event) {
			const card = event.currentTarget;
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const deltaX = (x - centerX) / centerX;
			const deltaY = (y - centerY) / centerY;
			const angleX = deltaY * 20; // Exaggerated rotation
			const angleY = -deltaX * 20; // Exaggerated rotation
			card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
			card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 100, 0, 0.5), transparent)`;
			card.style.borderImage = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 100, 0, 1), transparent) 1`;
			card.style.borderRadius = "1rem"; // Maintain rounded corners
		},
		handleMouseLeave(event) {
			const card = event.currentTarget;
			card.style.transform = "rotateX(0) rotateY(0)";
			card.style.background = "";
			card.style.borderImage = "";
			card.style.borderRadius = ""; // Reset border radius
		},
	},
};
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to /* .fade-leave-active in <2.1.8 */ {
    opacity: 0;
}

.pokemon-card {
  perspective: 1000px;
  border-radius: 1rem;
}
</style>