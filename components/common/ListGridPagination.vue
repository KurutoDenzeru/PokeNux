<template>
    <div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-6 antialiased">
        <template v-for="pokemon in paginatedPokemon" :key="pokemon.id">
            <!-- Base Form -->
            <div
                @click="openModal(pokemon)"
                @mousemove="handleMouseMove"
                @mouseleave="handleMouseLeave"
                class="tilt-card bg-white border-2 border-gray-200 rounded-2xl shadow py-4 text-center cursor-pointer transition-all duration-300 ease-out hover:scale-105"
            >
                <div class="glow opacity-0 transition-opacity duration-300"></div>
                <div class="tilt-card-content flex flex-col items-center relative z-10">
                    <p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
                    <img 
                        :src="pokemon.sprite" 
                        :alt="pokemon.name"
                        class="w-28 h-28 mx-auto mb-2" 
                    />
                    <p class="capitalize">{{ pokemon.name }}</p>
                    <div class="flex flex-row flex-wrap justify-center gap-1 mt-2">
                        <span 
                            v-for="type in pokemon.types"
                            :key="type"
                            :class="['inline-flex items-center px-2 py-1 rounded-lg capitalize text-white text-xs lg:text-sm whitespace-nowrap', typeColorClass(type)]"
                        >
                            {{ getEmojiForType(type) }} {{ type }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Alternative Forms -->
            <template v-if="pokemon.varieties && pokemon.varieties.length > 0">
                <div
                    v-for="variety in pokemon.varieties"
                    :key="variety.id"
                    @click="openModal(variety)"
                    @mousemove="handleMouseMove"
                    @mouseleave="handleMouseLeave"
                    class="tilt-card bg-white border-2 border-gray-200 rounded-2xl shadow py-4 text-center cursor-pointer transition-all duration-300 ease-out hover:scale-105"
                >
                    <div class="glow opacity-0 transition-opacity duration-300"></div>
                    <div class="tilt-card-content flex flex-col items-center relative z-10">
                        <p class="text-gray-500">#{{ String(variety.id).padStart(4, '0') }}</p>
                        <img 
                            :src="variety.sprite" 
                            :alt="variety.name"
                            class="w-28 h-28 mx-auto mb-2" 
                        />
                        <p class="capitalize">{{ formatVarietyName(variety.name) }}</p>
                        <div v-if="variety.requirement" class="text-xs text-gray-600 mt-1">
                            {{ variety.requirement.display }}
                        </div>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<script>
export default {
	name: "ListGridPagination",
	props: {
		paginatedPokemon: {
			type: Array,
			required: true,
		},
	},
	methods: {
		formatVarietyName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		handleMouseMove(event) {
			const card = event.currentTarget;
			const content = card.querySelector(".tilt-card-content");
			const glow = card.querySelector(".glow");
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const centerX = rect.width / 2;
			const centerY = rect.height / 2;

			const percentX = (x - centerX) / centerX;
			const percentY = -((y - centerY) / centerY);

			card.style.transform = `perspective(1000px) rotateY(${percentX * 10}deg) rotateX(${percentY * 10}deg)`;
			content.style.transform = "translateZ(50px)";
			glow.style.opacity = "1";
			glow.style.backgroundImage = `
                radial-gradient(
                circle at
                ${x}px ${y}px,
                rgba(16, 185, 129, 0.40),
                rgba(0, 0, 0, 0.05)
                )
            `;
		},
		handleMouseLeave(event) {
			const card = event.currentTarget;
			const content = card.querySelector(".tilt-card-content");
			const glow = card.querySelector(".glow");

			card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
			content.style.transform = "translateZ(0px)";
			glow.style.opacity = "0";
		},
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
		getBaseFormName(name) {
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
		async getItemSprite(itemName) {
			if (!itemName) return "";
			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${itemName}.png`;
		},
		async fetchAlternativeForms(pokemon) {
			try {
				const speciesResponse = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${pokemon.baseSpeciesName || pokemon.name}`
				);

				const varieties = [];
				if (speciesResponse.data.varieties.length > 1) {
					for (const variety of speciesResponse.data.varieties) {
						if (variety.pokemon.name !== pokemon.name) {
							try {
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
									const pokemonBaseName =
										pokemon.baseSpeciesName || pokemon.name.toLowerCase();
									requirementName = `${pokemonBaseName}ite`; // e.g., venusaurite, charizardite-x
									if (variety.pokemon.name.includes("-x")) {
										requirementName += "-x";
									} else if (variety.pokemon.name.includes("-y")) {
										requirementName += "-y";
									}
									requirementSprite = await this.getItemSprite(requirementName);
								}
								// Handle G-max forms
								else if (isGmax) {
									requirementName = "max-mushrooms";
									requirementSprite = await this.getItemSprite(requirementName);
								}

								// Fetch variant Pokemon data for types
								try {
									const variantResponse = await axios.get(
										`https://pokeapi.co/api/v2/pokemon/${varId}`
									);

									varieties.push({
										id: Number(varId),
										name: variety.pokemon.name,
										sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${varId}.png`,
										types: variantResponse.data.types.map((t) => t.type.name),
										requirement: requirementName
											? {
												type: isMega ? "mega" : "gmax",
												name: requirementName,
												sprite: requirementSprite,
												display: isMega ? "Mega Evolution" : "Gigantamax Factor",
											}
											: null,
										baseSpeciesId: pokemon.id,
										baseSpeciesName: pokemon.name,
										isVariant: true,
										variantType: this.getVariantType(variety.pokemon.name),
									});
								} catch (variantError) {
									console.error(`Error fetching variant data for ${variety.pokemon.name}:`, variantError);
									// Skip this variant if we can't get its data
									continue;
								}
							} catch (varietyError) {
								console.error(`Error processing variety ${variety.pokemon.name}:`, varietyError);
								// Skip this variety if there's an error
								continue;
							}
						}
					}
				}

				return varieties;
			} catch (error) {
				console.error(`Error fetching alternative forms for ${pokemon.name}:`, error);
				return [];
			}
		},

		getVariantType(name) {
			if (name.includes("-mega")) return "mega";
			if (name.includes("-gmax")) return "gigantamax";
			if (name.includes("-alola")) return "alolan";
			if (name.includes("-galar")) return "galarian";
			if (name.includes("-hisui")) return "hisuian";
			if (name.includes("-paldea")) return "paldean";
			if (name.includes("-primal")) return "primal";
			return "normal";
		},

		handleSprite(pokemon) {
			if (pokemon.isVariant) {
				const spriteId = pokemon.id;
				return {
					normal: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${spriteId}.png`,
					shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${spriteId}.png`,
				};
			}

			return {
				normal: pokemon.sprite,
				shiny: pokemon.shinySprite,
			};
		},

		async openModal(pokemon) {
			try {
				// Check if this is a variant form
				const isVariant =
					pokemon.name.includes("-mega") ||
					pokemon.name.includes("-gmax") ||
					pokemon.name.includes("-alola") ||
					pokemon.name.includes("-galar") ||
					pokemon.name.includes("-hisui") ||
					pokemon.name.includes("-paldea");

				if (isVariant) {
					// For variant forms, we need to get the base form first
					const baseName = this.getBaseFormName(pokemon.name);

					try {
						// Try to get the species data for the base form
						const baseResponse = await axios.get(
							`https://pokeapi.co/api/v2/pokemon-species/${baseName}`
						);

						// Get the varieties from the base form
						const varieties = await this.fetchAlternativeForms({
							...pokemon,
							baseSpeciesName: baseName,
							id: baseResponse.data.id,
						});

						// Update the Pokemon with its variant info
						const updatedPokemon = {
							...pokemon,
							baseSpeciesId: baseResponse.data.id,
							baseSpeciesName: baseName,
							isVariant: true,
							variantType: this.getVariantType(pokemon.name),
							varieties,
						};

						this.$emit("open-modal", updatedPokemon);
					} catch (error) {
						// If we can't get the species data, just emit the Pokemon as is
						console.error(`Error fetching species data for ${baseName}:`, error);
						this.$emit("open-modal", pokemon);
					}
				} else {
					// For base forms, fetch their varieties if needed
					try {
						const varieties = await this.fetchAlternativeForms(pokemon);
						this.$emit("open-modal", { ...pokemon, varieties });
					} catch (error) {
						console.error(`Error fetching varieties for ${pokemon.name}:`, error);
						this.$emit("open-modal", pokemon);
					}
				}
			} catch (error) {
				console.error("Error processing Pokemon data:", error);
				// If all else fails, just emit the Pokemon as is
				this.$emit("open-modal", pokemon);
			}
		}
	},
};
</script>