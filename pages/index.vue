<template>
    <div class="relative" lang="en">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>
        </div>
        <div class="p-6 w-full h-full mx-auto max-w-screen-xl">
			<div class="flex flex-col items-center pt-16">
				<!-- Title -->
				<div class="py-12">
					<a href="/" class="lg:text-9xl md:text-8xl sm:text-9xl xs:text-8xl text-7xl font-bold bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">
						PokeNuxt
					</a>
				</div>

				<!-- Search and Filter Section -->
				<FilterSort
					:total-pokemon="totalPokemon"
					:pokemon-count="filteredAndSortedPokemon.length"
					@search="searchQuery = $event"
					@type-change="selectedElementType = $event"
					@generation-change="selectedGeneration = $event"
					@sort-change="sortOption = $event"
				/>
			</div>

			<!-- List Grid Pagination -->
			<ListGridPagination 
                :paginatedPokemon="paginatedPokemon"
                @open-modal="openModal"
            />

            <!-- Pagination Controls -->
			<PaginationControls
				v-model:currentPage="page"
				:perPage="perPage"
				:totalItems="filteredAndSortedPokemon.length"
				@prev-page="prevPage"
				@next-page="nextPage"
			/>

            <!-- Modal for Pokémon Details -->
            <transition name="fade" v-if="selectedPokemon">
				<div class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center backdrop-blur-md z-50" @click.self="closeModal">
					<div class="bg-white shadow-sm rounded-xl max-w-7xl w-full relative m-6 max-h-[90vh] flex flex-col" @click.stop>
						<!-- Modal Header - Sticky -->
						<ModalHeader
							:selectedPokemon="selectedPokemon"
							@close-modal="closeModal"
						/>

						<!-- Scrollable Content Area -->
						<div class="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-gray-200">
							<div class="px-6 md:px-8 py-4 space-y-4">
								<!-- Artwork & Controls -->
								<ArtworkControls
									:selectedPokemon="selectedPokemon"
									@update-sprite="handleSpriteUpdate"
								/>

								<!-- Description & Details -->
								<DescriptionDetails
									v-if="selectedPokemon"
									:selectedPokemon="selectedPokemon"
									@close-modal="closeModal"
								/>

								<!-- Breeding & Training Sections -->
								<BreedingTraining :pokemon="selectedPokemon" />

								<!-- Relations & Forms Sections -->
								<RelationsForms
									:pokemon="selectedPokemon"
									@variety-click="handleVarietyClick"
								/>

								<!-- Base Stats -->
								<BaseTotalStats :pokemon="selectedPokemon" />

								<!-- Evolution Chain -->
								<EvolutionChain
                                    :evolutionChain="evolutionChain"
                                    @evolution-click="handleEvolutionClick"
                                    @variety-click="handleVarietyClick" 
                                />

								<!-- Move Pool Section -->
								<MovePool :pokemon="selectedPokemon" />

								<!-- Pokemon Sprites -->
								<SpriteSheet :pokemon="selectedPokemon" />

							</div>
						</div>
					</div>
				</div>
            </transition>
			<!-- UI Component -->
            <Footer />

        </div>
    </div>
</template>

<script>
import axios from "axios";
import { computed, ref, watch } from "vue";
import { useHead, useSeoMeta } from '#imports';
// Components
import FilterSort from "~/components/filters/FilterSort.vue";
import ListGridPagination from "~/components/common/ListGridPagination.vue";
import PaginationControls from "~/components/common/PaginationControls.vue";
// Modal Components
import ModalHeader from "~/components/modal/ModalHeader.vue";
import ArtworkControls from "~/components/modal/ArtworkControls.vue";
import DescriptionDetails from "~/components/modal/DescriptionDetails.vue";
import BreedingTraining from "~/components/modal/BreedingTraining.vue";
import RelationsForms from "~/components/modal/RelationsForms.vue";
import BaseTotalStats from "~/components/modal/BaseTotalStats.vue";
import EvolutionChain from "~/components/modal/EvolutionChain.vue";
import MovePool from "~/components/modal/MovePool.vue";
import SpriteSheet from "~/components/modal/SpriteSheet.vue";

export default {
	name: "Index",
	components: {
		// Common Components
		FilterSort,
		ListGridPagination,
		PaginationControls,
		// Modal Components
		ModalHeader,
		ArtworkControls,
		DescriptionDetails,
		BreedingTraining,
		RelationsForms,
		BaseTotalStats,
		EvolutionChain,
		MovePool,
		SpriteSheet,
	},
		setup() {
		// SEO Meta Tags
		useSeoMeta({
			title: 'PokeNuxt',
			ogTitle: 'PokeNuxt',
			description: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind CSS, and powered by PokéAPI and the Pokémon TCG API. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG card stats, rarities, and sets.',
			ogDescription: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind CSS, and powered by PokéAPI and the Pokémon TCG API. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG card stats, rarities, and sets.',
			ogImage: '/sitemap.avif',
			twitterCard: 'summary_large_image',
			twitterImage: '/sitemap.avif',
		})
		// Search & Filter
		const searchQuery = ref("");
		const selectedGeneration = ref("All");
		const selectedGenerations = ref([]);
		const selectedElementTypes = ref([]);
		const selectedElementType = ref("");
		const sortOption = ref("number");
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
			"Generation 10",
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

		const updateSelectedPokemon = (pokemon) => {
			selectedPokemon.value = pokemon;
		};

		const evolutionChain = ref([]);

		const filteredAndSortedPokemon = computed(() => {
			let filtered = [...pokemonList.value];

			// 1. Apply Generation Filter
			if (selectedGeneration.value !== "All") {
				const genNumber = Number(selectedGeneration.value.split(" ")[1]);
				const genRanges = {
					1: [1, 151],
					2: [152, 251],
					3: [252, 386],
					4: [387, 493],
					5: [494, 649],
					6: [650, 721],
					7: [722, 809],
					8: [810, 898],
					9: [899, 1008],
					10: [1009, 1025],
				};
				const [min, max] = genRanges[genNumber] || [0, 0];
				filtered = filtered.filter(
					(pokemon) => pokemon.id >= min && pokemon.id <= max,
				);
			}

			// 2. Apply Element Type Filter
			if (selectedElementType.value) {
				filtered = filtered.filter((pokemon) =>
					pokemon.types.includes(selectedElementType.value.toLowerCase()),
				);
			}

			// 3. Apply Search Query
			if (searchQuery.value.trim()) {
				const query = searchQuery.value.toLowerCase().trim();
				filtered = filtered.filter((pokemon) =>
					pokemon.name.toLowerCase().includes(query),
				);
			}

			// 4. Apply Sorting
			filtered.sort((a, b) =>
				sortOption.value === "name"
					? a.name.localeCompare(b.name)
					: a.id - b.id,
			);

			return filtered;
		});

		// Fetch Pokémon data
		const fetchPokemon = async () => {
			try {
				const { data } = await axios.get(
					"https://pokeapi.co/api/v2/pokemon?limit=1302",
				);

				pokemonList.value = data.results.map((pokemon, i) => ({
					id: i + 1,
					name: pokemon.name,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${i + 1}.png`,
					url: pokemon.url,
					types: [],
					generation: "",
				}));

				await Promise.all(
					pokemonList.value.slice(0, perPage).map(fetchPokemonDetails),
				);

				filteredPokemon.value = pokemonList.value;
			} catch (error) {
				console.error("Error fetching Pokémon data:", error);
			}
		};

		const isNormalSprite = ref(true);

		// Fetch detailed Pokémon information when modal is opened
		const fetchPokemonDetails = async (pokemon) => {
			if (pokemon.detailsFetched) return;

			try {
				// Fetch both pokemon and species data
				const [pokemonResponse, speciesResponse] = await Promise.all([
					axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
					axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`),
				]);

				const generationId = speciesResponse.data.generation.url
					.split("/")
					.slice(-2, -1)[0];
				pokemon.generation = `Generation ${generationId}`;

				const englishFlavorText = speciesResponse.data.flavor_text_entries.find(
					(entry) => entry.language.name === "en",
				);

				pokemon.description = englishFlavorText
					? englishFlavorText.flavor_text
							.replace(/\f/g, " ")
							.replace(/\f/g, " ")
							.replace(/\n/g, " ")
							.replace(/\r/g, " ")
							.replace(/\s{2,}/g, " ")
							.trim()
					: "No description available.";

				const abilitiesPromises = pokemonResponse.data.abilities.map(
					async (ability) => {
						const abilityResponse = await axios.get(ability.ability.url);
						const englishDescription = abilityResponse.data.effect_entries.find(
							(entry) => entry.language.name === "en",
						);

						return {
							name: ability.ability.name,
							is_hidden: ability.is_hidden,
							description: englishDescription
								? englishDescription.short_effect
								: "No description available",
						};
					},
				);
				pokemon.abilities = await Promise.all(abilitiesPromises);

				pokemon.forms = {
					hasAlternativeForms: pokemonResponse.data.forms.length > 1,
					varieties: speciesResponse.data.varieties
						.filter((v) => v.pokemon.name !== pokemon.name)
						.map((v) => ({
							id: Number(v.pokemon.url.split("/").slice(-2, -1)[0]),
							name: v.pokemon.name,
						})),
					hasGenderDifferences: speciesResponse.data.has_gender_differences,
					genderDifferencesDescription:
						"Gender differences visible in appearance",
				};

				pokemon.breeding = {
					genderRate: speciesResponse.data.gender_rate,
					growthRate: speciesResponse.data.growth_rate?.name || "",
					hatchCounter: speciesResponse.data.hatch_counter || 0,
					eggGroups:
						speciesResponse.data.egg_groups.map((group) => group.name) || [],
					habitat: speciesResponse.data.habitat?.name || "Unknown",
					babyTriggerItem: speciesResponse.data.baby_trigger_item?.name || null,
				};

				// Training Data
				pokemon.training = {
					evYield: pokemonResponse.data.stats
						.map((stat) => ({
							stat: stat.stat.name,
							value: stat.effort,
						}))
						.filter((ev) => ev.value > 0),
					catchRate: speciesResponse.data.capture_rate,
					baseHappiness: speciesResponse.data.base_happiness,
					baseExp: pokemonResponse.data.base_experience,
					heldItems: pokemonResponse.data.held_items.map((item) => ({
						name: item.item.name,
						rarity: item.rarity,
					})),
				};

				if (pokemon.forms.hasGenderDifferences) {
					pokemon.forms.maleSprite = pokemonResponse.data.sprites.front_default;
					pokemon.forms.femaleSprite =
						pokemonResponse.data.sprites.front_female;
				}
				if (pokemon.forms.varieties.length > 0) {
					pokemon.forms.varieties.unshift({
						id: pokemon.id,
						name: pokemon.name,
						isDefault: true,
					});
				}

				pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
				pokemon.shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;
				pokemon.cries = {
					latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`,
					legacy: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemon.id}.ogg`,
				};
				pokemon.currentSprite = pokemon.sprite;
				pokemon.types = pokemonResponse.data.types.map((t) => t.type.name);
				pokemon.weight = pokemonResponse.data.weight / 10;
				pokemon.height = pokemonResponse.data.height;
				pokemon.stats = pokemonResponse.data.stats;
				pokemon.isBaby = speciesResponse.data.is_baby;
				pokemon.isLegendary = speciesResponse.data.is_legendary;
				pokemon.isMythical = speciesResponse.data.is_mythical;

				const englishGenus = speciesResponse.data.genera.find(
					(g) => g.language.name === "en",
				);
				pokemon.genus = englishGenus ? englishGenus.genus : "Unknown";
				pokemon.shape = speciesResponse.data.shape?.name || "Unknown";
				pokemon.color = speciesResponse.data.color?.name || "Unknown";

				pokemon.detailsFetched = true;
			} catch (error) {
				console.error(`Error fetching details for ${pokemon.name}:`, error);
				pokemon.generation = "Unknown";
				pokemon.abilities = [];
				pokemon.forms = {
					hasAlternativeForms: false,
					varieties: [],
					hasGenderDifferences: false,
					genderDifferencesDescription: "",
					maleSprite: null,
					femaleSprite: null,
				};
				pokemon.breeding = {
					genderRate: undefined,
					growthRate: "",
					hatchCounter: 0,
					eggGroups: [],
					habitat: "Unknown",
					babyTriggerItem: null,
				};
				pokemon.training = {
					evYield: [],
					catchRate: 0,
					baseHappiness: 0,
					baseExp: 0,
					heldItems: [],
				};
				pokemon.detailsFetched = true;
			}
		};

		watch([selectedPokemon, searchQuery], ([newPokemon, newQuery]) => {
			if (newPokemon && !newPokemon.stats) {
				fetchPokemonDetails(newPokemon);
			}
			if (newQuery) {
				filteredPokemon.value = pokemonList.value.filter((pokemon) =>
					pokemon.name.toLowerCase().includes(newQuery.toLowerCase()),
				);
			} else {
				filteredPokemon.value = pokemonList.value;
			}
		});

		const parseEvolutionChain = async (node, evoChain) => {
			if (!node?.species) {
				console.error("Invalid evolution node structure");
				return;
			}

			try {
				const speciesId = node.species.url.split("/").filter(Boolean).pop();
				const pokemonSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

				const [speciesResponse, pokemonResponse] = await Promise.all([
					axios.get(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`),
					axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesId}`),
				]);

				const requirements = [];

				if (node.evolution_details?.length > 0) {
					const details = node.evolution_details[0];

					if (details.min_level) {
						const rareCandySprite = await getItemSprite("rare-candy");
						requirements.push({
							type: "level",
							value: details.min_level,
							display: `Level ${details.min_level}`,
							sprite: rareCandySprite,
						});
					}

					if (details.min_friendship) {
						requirements.push({
							type: "friendship",
							value: details.min_friendship,
							display: "High Friendship",
							sprite: await getItemSprite("soothe-bell"),
						});
					}

					if (details.item?.name) {
						requirements.push({
							type: "item",
							value: details.item.name,
							sprite: await getItemSprite(details.item.name),
							display: formatItemName(details.item.name),
						});
					}

					if (details.held_item?.name) {
						requirements.push({
							type: "held-item",
							value: details.held_item.name,
							sprite: await getItemSprite(details.held_item.name),
							display: formatItemName(details.held_item.name),
						});
					}

					if (details.location?.name) {
						requirements.push({
							type: "location",
							value: details.location.name,
							display: `At ${formatLocationName(details.location.name)}`,
						});
					}

					if (details.time_of_day) {
						requirements.push({
							type: "time",
							value: details.time_of_day,
							display: `During ${details.time_of_day}`,
						});
					}

					// Trade evolutions
					if (details.trade_species) {
						requirements.push({
							type: "trade",
							value: "trade",
							display: `Trade with ${formatPokemonName(details.trade_species.name)}`,
							sprite: await getPokemonSprite(details.trade_species.name),
						});
					} else if (details.needs_overworld_rain) {
						requirements.push({
							type: "weather",
							value: "rain",
							display: "During Rain",
						});
					} else if (details.trade_species) {
						requirements.push({
							type: "trade",
							value: "trade",
							display: "Trade",
						});
					}
				} else {
					requirements.push({ type: "base", display: "Base Form" });
				}

				const varieties = [];
				if (speciesResponse.data.varieties.length > 1) {
					for (const variety of speciesResponse.data.varieties) {
						if (variety.pokemon.name !== node.species.name) {
							const varId = variety.pokemon.url
								.split("/")
								.filter(Boolean)
								.pop();
							const isMega = variety.pokemon.name.includes("mega");
							const isGmax = variety.pokemon.name.includes("gmax");

							let requirementSprite = null;
							let requirementName = null;

							// Handle Mega Evolution stones
							if (isMega) {
								const pokemonBaseName = node.species.name.toLowerCase();
								requirementName = `${pokemonBaseName}ite`; // e.g., venusaurite, charizardite-x
								if (variety.pokemon.name.includes("-x")) {
									requirementName += "-x";
								} else if (variety.pokemon.name.includes("-y")) {
									requirementName += "-y";
								}
								requirementSprite = await getItemSprite(requirementName);
							}
							// Handle G-max forms
							else if (isGmax) {
								requirementName = "max-mushrooms";
								requirementSprite = await getItemSprite(requirementName);
							}

							varieties.push({
								id: Number(varId),
								name: variety.pokemon.name,
								sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${varId}.png`,
								requirement: requirementName
									? {
											type: isMega ? "mega" : "gmax",
											name: requirementName,
											sprite: requirementSprite,
											display: isMega ? "Mega Evolution" : "Gigantamax Factor",
										}
									: null,
							});
						}
					}
				}

				const evolutionEntry = {
					id: Number(speciesId),
					name: node.species.name,
					sprite: pokemonSprite,
					requirements: requirements,
					varieties: varieties.map((v) => ({
						...v,
						requirement: v.requirement
							? {
									...v.requirement,
									display: `Use ${formatItemName(v.requirement.name)}`,
									sprite: v.requirement.sprite,
								}
							: null,
					})),
					types: pokemonResponse.data.types.map((t) => t.type.name),
				};

				evoChain.push(evolutionEntry);

				if (node.evolves_to?.length > 0) {
					for (const nextEvolution of node.evolves_to) {
						await parseEvolutionChain(nextEvolution, evoChain);
					}
				}
			} catch (error) {
				console.error(
					`Error parsing evolution chain for ${node.species?.name || "unknown"}:`,
					error,
				);

				// Fallback evolution entry
				if (node.species) {
					evoChain.push({
						id: Number(node.species.url.split("/").filter(Boolean).pop()),
						name: node.species.name,
						sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.species.url.split("/").filter(Boolean).pop()}.png`,
						requirements: [
							{ type: "error", display: "Error loading evolution data" },
						],
						varieties: [],
						types: [],
					});
				}
			}
		};

		const formatItemName = (name) => {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};

		watch(selectedGeneration, (newGeneration) => {
			if (newGeneration === "All") {
				selectedGenerations.value = [];
			} else {
				selectedGenerations.value = [newGeneration];
			}
		});

		// Watcher for generation filter
		watch(selectedGeneration, () => {
			applyFilters();
		});

		// Watcher for sort option
		watch(sortOption, () => {
			applyFilters();
		});

		// Update watchers
		watch(
			[selectedGeneration, selectedElementType, sortOption, searchQuery],
			() => {
				page.value = 1;
			},
		);

		// Call fetchPokemonDetails when a new page is loaded or filters are applied
		watch(page, (newPage) => {
			const start = (newPage - 1) * perPage;
			const end = start + perPage;
			// biome-ignore lint/complexity/noForEach: <explanation>
			pokemonList.value.slice(start, end).forEach((pokemon) => {
				if (!pokemon.types.length) {
					// Check if details are already fetched
					fetchPokemonDetails(pokemon);
				}
			});
		});

		// Computed property for paginated Pokémon
		const paginatedPokemon = computed(() => {
			const start = (page.value - 1) * perPage;
			const end = start + perPage;
			return filteredAndSortedPokemon.value.slice(start, end);
		});

		// Watcher to fetch types immediately for displayed Pokémon
		watch(
			() => paginatedPokemon.value,
			async (newPokemon) => {
				if (newPokemon) {
					await Promise.all(
						newPokemon.map(async (pokemon) => {
							if (!pokemon.types?.length) {
								await fetchPokemonDetails(pokemon);
							}
						}),
					);
				}
			},
			{ immediate: true },
		);

		const checkGenerationFilter = () => {
			const genNumber = Number(selectedGeneration.value.split(" ")[1]);
			const genRanges = [
				[1, 151],
				[152, 251],
				[252, 386],
				[387, 493],
				[494, 649],
				[650, 721],
				[722, 809],
				[810, 898],
				[899, 1008],
				[1009, 1025],
			];

			const [min, max] = genRanges[genNumber - 1] || [0, 0];
			filtered = filtered.filter(
				(pokemon) => pokemon.id >= min && pokemon.id <= max,
			);
		};

		// Pagination controls
		const totalPages = computed(() =>
			Math.ceil(filteredAndSortedPokemon.value.length / perPage),
		);
		const nextPage = () => {
			if (page.value < totalPages.value) page.value++;
		};
		const prevPage = () => {
			if (page.value > 1) page.value--;
		};
		const getItemSprite = async (itemName) => {
			if (!itemName) return "";
			const cleanName = itemName
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[.']/g, "")
				.replace(/:/g, "")
				.trim();

			// Special case for rare candy
			if (cleanName === "rare-candy") {
				return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png";
			}

			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${cleanName}.png`;
		};
		const formatLocationName = (name) => {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};
		const fetchEvolutionChain = async (pokemonId) => {
			try {
				const speciesResponse = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
				);

				if (!speciesResponse.data.evolution_chain?.url) {
					console.log("No evolution chain available for this Pokémon");
					evolutionChain.value = [
						{
							id: selectedPokemon.value.id,
							name: selectedPokemon.value.name,
							sprite: selectedPokemon.value.sprite,
							requirements: ["Base Form"],
						},
					];
					return;
				}

				const evolutionResponse = await axios.get(
					speciesResponse.data.evolution_chain.url,
				);
				const chain = evolutionResponse.data.chain;

				const evoChain = [];
				await parseEvolutionChain(chain, evoChain);
				evolutionChain.value = evoChain;
			} catch (error) {
				console.error("Error fetching evolution chain:", error);
				evolutionChain.value = [
					{
						id: selectedPokemon.value.id,
						name: selectedPokemon.value.name,
						sprite: selectedPokemon.value.sprite,
						requirements: ["Evolution data unavailable"],
					},
				];
			}
		};

		const saveModalState = () => {
			if (!selectedPokemon.value) {
				localStorage.removeItem("pokemonModalState");
				return;
			}

			const state = {
				pokemonId: selectedPokemon.value.id,
				isNormalSprite: isNormalSprite.value,
				currentSprite: selectedPokemon.value.currentSprite,
				types: selectedPokemon.value.types,
				name: selectedPokemon.value.name,
				generation: selectedPokemon.value.generation,
				abilities: selectedPokemon.value.abilities,
				forms: selectedPokemon.value.forms,
				genus: selectedPokemon.value.genus,
				shape: selectedPokemon.value.shape,
				color: selectedPokemon.value.color,
				weight: selectedPokemon.value.weight,
				height: selectedPokemon.value.height,
				breeding: selectedPokemon.value.breeding,
				training: selectedPokemon.value.training,
				description: selectedPokemon.value.description,
				stats: selectedPokemon.value.stats,
			};
			localStorage.setItem("pokemonModalState", JSON.stringify(state));
		};

		// Apply filters
		const applyFilters = () => {
			const filtered = pokemonList.value.filter((pokemon) => {
				const matchesGeneration =
					selectedGeneration.value === "All" ||
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
							(genNumber === 9 && pokemon.id >= 899 && pokemon.id <= 1008) ||
							(genNumber === 10 && pokemon.id >= 1009 && pokemon.id <= 1025)
						);
					});

				const matchesType =
					selectedElementTypes.value.length === 0 ||
					pokemon.types.some((type) =>
						selectedElementTypes.value.includes(type),
					);

				return matchesGeneration && matchesType;
			});

			filtered.sort((a, b) =>
				sortOption.value === "name"
					? a.name.localeCompare(b.name)
					: a.id - b.id,
			);

			return filtered;
		};

		// Filter Pokémon by type
		const filterByType = async () => {
			// Reset page when filter changes
			page.value = 1;

			try {
				if (!selectedElementType.value) {
					// If no type selected, reset to initial filtered state
					filteredPokemon.value = pokemonList.value;
					return;
				}

				const type = selectedElementType.value.toLowerCase();
				const response = await axios.get(
					`https://pokeapi.co/api/v2/type/${type}`,
				);
				const pokemonOfType = response.data.pokemon.map((p) => {
					return {
						id: Number.parseInt(p.pokemon.url.split("/")[6]),
						name: p.pokemon.name,
					};
				});

				// Filter pokemon list considering both type and generation
				filteredPokemon.value = pokemonList.value.filter((pokemon) => {
					const matchesType = pokemonOfType.some((p) => p.id === pokemon.id);
					const matchesGeneration =
						selectedGeneration.value === "All" ||
						checkGenerationFilter(pokemon);
					return matchesType && matchesGeneration;
				});

				// Fetch details for the first page of filtered results
				const firstPagePokemon = filteredPokemon.value.slice(0, perPage);
				await Promise.all(
					firstPagePokemon.map(async (pokemon) => {
						if (!pokemon.types?.length) {
							await fetchPokemonDetails(pokemon);
						}
					}),
				);
			} catch (error) {
				console.error("Error filtering by type:", error);
			}
		};

		watch([selectedElementType, selectedGeneration, sortOption], async () => {
			await filterByType();
			page.value = 1;
		});

		fetchPokemon();

		return {
			perPage,
			searchQuery,
			sortOption,
			selectedGeneration,
			selectedGenerations,
			selectedElementType,
			selectedElementTypes,
			filterByType,
			generations,
			elementTypes,
			paginatedPokemon,
			page,
			totalPages,
			nextPage,
			prevPage,
			applyFilters,
			selectedPokemon,
			updateSelectedPokemon,
			isNormalSprite,
			filteredAndSortedPokemon,
			evolutionChain,
			fetchEvolutionChain,
			fetchPokemonDetails,
			saveModalState,
			formatLocationName,
			getItemSprite,
			parseEvolutionChain,
			formatItemName,
		};
	},
	data() {
		return {
			totalPokemon: 0,
		};
	},
	async mounted() {
		document.addEventListener("keydown", this.handleEscKey);

		try {
			const response = await fetch(
				"https://pokeapi.co/api/v2/pokemon?limit=1302",
			);
			const data = await response.json();
			this.totalPokemon = data.count;
		} catch (error) {
			console.error("Error fetching Pokémon data:", error);
		}

		this.restoreModalState();
	},

	// Clean up event listener
	beforeUnmount() {
		document.removeEventListener("keydown", this.handleEscKey);
	},

	methods: {
		shouldShowItemSprite(req) {
			return (
				req.includes("Use Item:") ||
				req.includes("Holding:") ||
				req.toLowerCase().includes("stone")
			);
		},
		handleSpriteUpdate(data) {
			if (this.selectedPokemon) {
				this.selectedPokemon.currentSprite = data.sprite;
				this.saveModalState();
			}
		},
		formatSpriteLabel(key) {
			return key
				.split(/(?=[A-Z])/)
				.join(" ")
				.toLowerCase()
				.replace(/\b\w/g, (l) => l.toUpperCase());
		},
		getItemName(req) {
			const itemMatch = req.match(/(Use Item:|Holding:)\s+(.+)/);
			return itemMatch ? itemMatch[2].toLowerCase().trim() : "";
		},
		handleEscKey(e) {
			if (e.key === "Escape" && this.selectedPokemon) {
				this.closeModal();
			}
		},
		getBaseSpeciesName(name) {
			const nameParts = name.split("-");
			const regionalForms = ["alola", "galar", "hisui", "paldea"];
			if (
				nameParts.length > 1 &&
				regionalForms.includes(nameParts[nameParts.length - 1])
			) {
				return nameParts.slice(0, -1).join("-");
			}
			return name;
		},

		async getSpeciesIdFromName(name) {
			try {
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${name}`,
				);
				return response.data.id;
			} catch (error) {
				console.error(`Error getting species ID for ${name}:`, error);
				return null;
			}
		},
		async fetchPokemonSpeciesData(speciesId) {
			try {
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`,
				);
				const data = response.data;

				return {
					breeding: {
						genderRate: data.gender_rate,
						eggGroups: data.egg_groups.map((g) => g.name),
						hatchCounter: data.hatch_counter,
					},
					description: data.flavor_text_entries
						.find((entry) => entry.language.name === "en")
						?.flavor_text.replace(/\f/g, " ")
						.replace(/\n/g, " ")
						.replace(/\r/g, " ")
						.trim(),
					evolutionChainUrl: data.evolution_chain.url,
				};
			} catch (error) {
				console.error("Error fetching species data:", error);
				return {
					breeding: {},
					description: "No description available.",
					evolutionChainUrl: null,
				};
			}
		},
		async handleVarietyClick(pokemon) {
			try {
				this.selectedPokemon = null;
				this.evolutionChain = [];

				const baseSpeciesId =
					pokemon.baseSpeciesInfo?.id ||
					(await this.getSpeciesIdFromName(
						this.getBaseFormSpeciesName(pokemon.name),
					));

				let updatedPokemon = { ...pokemon };
				if (baseSpeciesId) {
					const speciesData = await this.fetchPokemonSpeciesData(baseSpeciesId);
					updatedPokemon = {
						...updatedPokemon,
						breeding: speciesData.breeding,
						description: speciesData.description,
						evolutionChainUrl: speciesData.evolutionChainUrl,
					};
				}

				await this.openModal(updatedPokemon);

				// Fetch evolution chain using base species ID
				if (baseSpeciesId) {
					await this.fetchEvolutionChain(baseSpeciesId);
				}
			} catch (error) {
				console.error("Error handling variety click:", error);
				await this.openModal(pokemon);
			}
		},
		getBaseFormSpeciesName(name) {
			const formPatterns = [
				"-mega",
				"-gmax",
				"-alola",
				"-galar",
				"-hisui",
				"-paldea",
				"-primal",
				"-origin",
				"-mega-x",
				"-mega-y",
			];

			let baseName = name.toLowerCase();
			for (const pattern of formPatterns) {
				if (baseName.includes(pattern)) {
					baseName = baseName.replace(pattern, "");
					break;
				}
			}
			return baseName;
		},
		async closeModal() {
			this.updateSelectedPokemon(null);
			this.evolutionChain = [];
			localStorage.removeItem("pokemonModalState");
		},
		async handleEvolutionClick(evolution) {
			const pokemon = {
				id: evolution.id,
				name: evolution.name,
				sprite: evolution.sprite,
				url: `https://pokeapi.co/api/v2/pokemon/${evolution.id}`,
			};

			// Close current modal
			this.selectedPokemon = null;
			this.evolutionChain = [];
			await this.openModal(pokemon);
		},
		async restoreModalState() {
			try {
				const savedState = localStorage.getItem("pokemonModalState");
				if (!savedState) return;

				const state = JSON.parse(savedState);

				// Create complete Pokemon object with all saved data
				const pokemon = {
					id: state.pokemonId,
					name: state.name,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${state.pokemonId}.png`,
					shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${state.pokemonId}.png`,
					cries: {
						latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${state.pokemonId}.ogg`,
						legacy: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${state.pokemonId}.ogg`,
					},
					currentSprite: state.currentSprite,
					url: `https://pokeapi.co/api/v2/pokemon/${state.pokemonId}`,
					types: state.types || [],
					generation: state.generation,
					genus: state.genus,
					shape: state.shape,
					color: state.color,
					weight: state.weight,
					height: state.height,
					abilities: state.abilities || [],
					breeding: state.breeding || {
						genderRate: undefined,
						growthRate: "",
						hatchCounter: 0,
						eggGroups: [],
						habitat: "",
					},
					training: state.training || {
						evYield: [],
						catchRate: 0,
						baseHappiness: 0,
						baseExp: 0,
						heldItems: [],
					},
					forms: state.forms || {
						hasAlternativeForms: false,
						varieties: [],
						hasGenderDifferences: false,
						genderDifferencesDescription: "",
						maleSprite: null,
						femaleSprite: null,
					},
					description: state.description,
					stats: state.stats || [],
					detailsFetched: true,
				};

				// Fetch fresh data if needed
				if (!pokemon.detailsFetched) {
					await this.fetchPokemonDetails(pokemon);
				}

				await this.openModal(pokemon);

				// Restore sprite state
				this.isNormalSprite = state.isNormalSprite;
				if (this.selectedPokemon) {
					this.selectedPokemon.currentSprite = state.currentSprite;
				}
			} catch (error) {
				console.error("Error restoring modal state:", error);
				localStorage.removeItem("pokemonModalState");
			}
		},

		async openModal(pokemon) {
			try {
				if (!pokemon.detailsFetched) {
					await this.fetchPokemonDetails(pokemon);
				}

				const pokemonData = {
					...pokemon,
					breeding: {
						genderRate: undefined,
						growthRate: "",
						hatchCounter: 0,
						eggGroups: [],
						habitat: "",
						...pokemon.breeding,
					},
					forms: {
						hasAlternativeForms: false,
						varieties: [],
						hasGenderDifferences: false,
						genderDifferencesDescription: "",
						maleSprite: null,
						femaleSprite: null,
						...pokemon.forms,
					},
					training: {
						evYield: [],
						catchRate: 0,
						baseHappiness: 0,
						baseExp: 0,
						heldItems: [],
						...pokemon.training,
					},
				};

				this.updateSelectedPokemon(pokemonData);
				await this.fetchEvolutionChain(pokemonData.id);
				this.saveModalState();
			} catch (error) {
				console.error("Error opening modal:", error);
			}
		},
	},
};
</script>