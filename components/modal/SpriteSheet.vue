<template>
    <div class="mt-8">
        <h3 class="font-bold mb-4">Sprite Collection</h3>

        <!-- Pokemon Icon Accordion -->
        <div class="border rounded-lg mb-4">
            <button @click="toggleSpriteAccordion('pokemonIcon')"
                class="w-full flex rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <span class="font-medium">Pokemon Icon</span>
                <svg class="w-5 h-5 transition-transform duration-200"
                    :class="{ 'rotate-180': spriteAccordions.pokemonIcon }" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <div v-if="spriteAccordions.pokemonIcon" class="p-4 flex items-center justify-center gap-4">
                <div class="text-center">
                    <img v-if="spriteData.icon" :src="spriteData.icon || ''"
                        class="w-56 h-56 object-contain mx-auto mr-2 pixelated" alt="Pokemon Icon" loading="lazy">
                    <span class="text-sm text-gray-600 mt-2">Pokemon Icon</span>
                </div>
            </div>
        </div>

        <!-- Main Sprites Accordion -->
        <div class="border rounded-lg mb-4">
            <button @click="toggleSpriteAccordion('mainSprites')"
                class="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <span class="font-medium">Main Sprites</span>
                <svg class="w-5 h-5 transition-transform duration-200"
                    :class="{ 'rotate-180': spriteAccordions.mainSprites }" viewBox="0 0 20 20" fill="currentColor"
                    aria-hidden="true">
                    <path fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <div v-if="spriteAccordions.mainSprites" class="p-4 flex flex-wrap items-center justify-center gap-8">
                <div v-for="(url, key) in spriteData.mainSprites" :key="key" class="text-center">
                    <img v-if="url" :src="url" :alt="key" class="w-48 h-48 object-contain mx-auto pixelated"
                        loading="lazy">
                    <span v-else class="text-sm text-gray-400">No sprite available</span>
                    <span class="text-sm text-gray-600 mt-2">{{ formatSpriteLabel(key) }}</span>
                </div>
            </div>
        </div>

        <!-- Sprites by Generation Accordion -->
        <div class="border rounded-lg mb-4">
            <button @click="toggleSpriteAccordion('spritesByGeneration')"
                class="w-full flex rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <span class="font-medium">Sprites by Generation</span>
                <svg class="w-5 h-5 transition-transform duration-200"
                    :class="{ 'rotate-180': spriteAccordions.spritesByGeneration }" viewBox="0 0 20 20"
                    fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                        clip-rule="evenodd" />
                </svg>
            </button>

            <div v-if="spriteAccordions.spritesByGeneration" class="p-4">
                <div v-for="(genSprites, gen) in spriteData.generationalSprites" :key="gen" class="mb-8">
                    <h4 class="font-medium mb-4 text-lg">{{ formatGeneration(gen) }}</h4>
                    <div v-for="(versionData, version) in getGenSprites(genSprites)" :key="version" class="mb-6">
                        <h5 class="font-medium mb-2 text-gray-700 capitalize">{{ versionData.label }}</h5>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <!-- Front Default -->
                            <div v-if="versionData.static.front_default" class="text-center">
                                <img :src="versionData.static.front_default" :alt="`Front Default - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Front Default</span>
                            </div>

                            <!-- Back Default -->
                            <div v-if="versionData.static.back_default" class="text-center">
                                <img :src="versionData.static.back_default" :alt="`Back Default ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Back Default</span>
                            </div>

                            <!-- Front Shiny -->
                            <div v-if="versionData.static.front_shiny" class="text-center">
                                <img :src="versionData.static.front_shiny" :alt="`Front Shiny - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Front Shiny</span>
                            </div>

                            <!-- Back Shiny -->
                            <div v-if="versionData.static.back_shiny" class="text-center">
                                <img :src="versionData.static.back_shiny" :alt="`Back Shiny - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Back Shiny</span>
                            </div>

                            <!-- Front Default Animated -->
                            <div v-if="versionData.static.front_default_animated" class="text-center">
                                <img :src="versionData.static.front_default_animated"
                                    :alt="`Front Default Animated - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Front Default Animated</span>
                            </div>

                            <!-- Back Default Animated -->
                            <div v-if="versionData.static.back_default_animated" class="text-center">
                                <img :src="versionData.static.back_default_animated"
                                    :alt="`Back Default Animated - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Back Default Animated</span>
                            </div>

                            <!-- Front Shiny Default Animated -->
                            <div v-if="versionData.static.front_shiny_animated" class="text-center">
                                <img :src="versionData.static.front_shiny_animated"
                                    :alt="`Shiny Front Default Animated - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Front Shiny Animated</span>
                            </div>

                            <!-- Back Shiny Default Animated -->
                            <div v-if="versionData.static.back_shiny_animated" class="text-center">
                                <img :src="versionData.static.back_shiny_animated"
                                    :alt="`Shiny Back Default Animated - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Back Shiny Animated</span>
                            </div>

                            <!-- Front Gray (for gen-1 only) -->
                            <div v-if="versionData.static.front_gray && (gen === 'gen-1')" class="text-center">
                                <img :src="versionData.static.front_gray" :alt="`Front Gray - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Front Gray</span>
                            </div>

                            <!-- Back Gray (for gen-1 only) -->
                            <div v-if="versionData.static.back_gray && (gen === 'gen-1')" class="text-center">
                                <img :src="versionData.static.back_gray" :alt="`Back Gray - ${version}`"
                                    class="w-32 h-32 object-contain mx-auto pixelated">
                                <span class="text-sm text-gray-600">Back Gray</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <h3 class="font-bold mb-4">Other Sprites</h3>

        <!-- Other Sprites Accordion -->
        <div id="accordionExample">
            <!-- Showdown Sprites -->
            <div class="rounded-t-lg border">
                <h2 class="mb-0" id="headingShowdown">
                    <button
                        class="group relative flex w-full rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        type="button" @click="toggleSpriteAccordion('showdownSprites')" aria-expanded="true"
                        aria-controls="collapseShowdown">
                        <span class="font-medium">Showdown Sprites</span>
                        <svg class="w-5 h-5 transition-transform duration-200"
                            :class="{ 'rotate-180': spriteAccordions.showdownSprites }" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </h2>
                <div id="collapseShowdown" class="!visible" v-if="spriteAccordions.showdownSprites"
                    aria-labelledby="headingShowdown" data-twe-parent="#accordionExample">
                    <div class="px-5 py-4 flex flex-wrap items-center justify-center gap-8">
                        <!-- Front Default -->
                        <div class="text-center">
                            <img :src="spriteData.showdownSprites.frontDefaultAnimated" alt="Front Default"
                                class="w-full h-full object-contain mx-auto" />
                            <span class="text-sm text-gray-600 mt-2">Front Default</span>
                        </div>
                        <!-- Back Default -->
                        <div class="text-center">
                            <img :src="spriteData.showdownSprites.backDefaultAnimated" alt="Back Default"
                                class="w-full h-full object-contain mx-auto" />
                            <span class="text-sm text-gray-600 mt-2">Back Default</span>
                        </div>
                        <!-- Front Shiny -->
                        <div class="text-center">
                            <img :src="spriteData.showdownSprites.frontShinyAnimated" alt="Front Shiny"
                                class="w-full h-full object-contain mx-auto" />
                            <span class="text-sm text-gray-600 mt-2">Front Shiny</span>
                        </div>
                        <!-- Back Shiny -->
                        <div class="text-center">
                            <img :src="spriteData.showdownSprites.backShinyAnimated" alt="Back Shiny"
                                class="w-full h-full object-contain mx-auto" />
                            <span class="text-sm text-gray-600 mt-2">Back Shiny</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Official Artwork Sprites -->
            <div class="border border-t-0">
                <h2 class="mb-0" id="headingOfficial">
                    <button
                        class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        type="button" @click="toggleSpriteAccordion('officialArtwork')" aria-expanded="false"
                        aria-controls="collapseOfficial">
                        <span class="font-medium">Official Artwork</span>
                        <svg class="w-5 h-5 transition-transform duration-200"
                            :class="{ 'rotate-180': spriteAccordions.officialArtwork }" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </h2>
                <div v-if="spriteAccordions.officialArtwork"
                    class="p-4 flex flex-wrap items-center justify-center gap-8">
                    <div v-for="(url, key) in spriteData.officialArtwork" :key="key" class="text-center">
                        <img :src="url" :alt="key" class="w-1/2 h-1/2 object-contain mx-auto">
                        <span class="text-sm text-gray-600">{{ formatSpriteLabel(key) }}</span>
                    </div>
                </div>
            </div>

            <!-- Pokemon Home Sprites -->
            <div class="border border-t-0">
                <h2 class="mb-0" id="headingHome">
                    <button
                        class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        type="button" @click="toggleSpriteAccordion('pokemonHome')" aria-expanded="false"
                        aria-controls="collapseHome">
                        <span class="font-medium">Pokemon Home</span>
                        <svg class="w-5 h-5 transition-transform duration-200"
                            :class="{ 'rotate-180': spriteAccordions.pokemonHome }" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </h2>
                <div v-if="spriteAccordions.pokemonHome" class="p-4 flex flex-wrap items-center justify-center gap-8">
                    <div class="text-center">
                        <img :src="spriteData.pokemonHome.default" alt="Default Home"
                            class="w-1/2 h-1/2 object-contain mx-auto">
                        <span class="text-sm text-gray-600">Default Home</span>
                    </div>
                    <div class="text-center">
                        <img :src="spriteData.pokemonHome.shiny" alt="Shiny Home"
                            class="w-1/2 h-1/2 object-contain mx-auto">
                        <span class="text-sm text-gray-600">Shiny Home</span>
                    </div>
                </div>
            </div>

            <!-- Dreamworld Sprites -->
            <div class="border border-t-0">
                <h2 class="mb-0" id="headingDreamworld">
                    <button
                        class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        type="button" @click="toggleSpriteAccordion('dreamworld')">
                        <span class="font-medium">Dreamworld</span>
                        <svg class="w-5 h-5 transition-transform duration-200"
                            :class="{ 'rotate-180': spriteAccordions.dreamworld }" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </h2>
                <div v-if="spriteAccordions.dreamworld" class="p-4 flex items-center justify-center gap-8">
                    <div class="text-center">
                        <img :src="spriteData.dreamworld || ''" alt="Dreamworld"
                            class="w-1/2 h-1/2 object-contain mx-auto">
                        <span class="text-sm text-gray-600">Dreamworld</span>
                    </div>
                </div>
            </div>

            <!-- Cards -->
            <div class="rounded-b-lg border border-t-0 mb-4">
                <h2 class="mb-0" id="headingCards">
                    <button
                        class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        type="button" @click="toggleSpriteAccordion('pokemonCards')">
                        <span class="font-medium">Pokemon Cards</span>
                        <svg class="w-5 h-5 transition-transform duration-200"
                            :class="{ 'rotate-180': spriteAccordions.pokemonCards }" viewBox="0 0 20 20"
                            fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </h2>
                <div v-if="spriteAccordions.pokemonCards" class="p-4">
                    <!-- Loading State -->
                    <div v-if="spriteData.cards.isLoading" class="flex justify-center items-center p-8">
                        <div
                            class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent">
                        </div>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="spriteData.cards.error" class="text-center text-red-500 p-4">
                        {{ spriteData.cards.error }}
                    </div>

                    <!-- Cards Grid -->
                    <div v-else class="flex items-center justify-center flex-wrap gap-8">
                        <div v-for="card in spriteData.cards.tcgCards" :key="card.id"
                            class="relative flex flex-col items-center">
                            <!-- Card Image -->
                            <div
                                class="rounded-lg overflow-hidden shadow-lg transition-transform transform hover:scale-105 mb-2">
                                <img :src="card.images.small" :alt="card.name" class="w-full h-full object-cover"
                                    loading="lazy" @error="handleImageError" />
                            </div>
                            <!-- Card Details Below -->
                            <div class="text-center space-y-1">
                                <span class="block text-sm font-bold">{{ card.set.name }}</span>
                                <span class="block text-xs">Card: {{ card.number }}/{{ card.set.printedTotal }}</span>
                                <span class="block text-xs" :class="getRarityColor(card.rarity)">
                                    Rarity: {{ card.rarity }}
                                </span>
                                <span v-if="card.cardmarket?.prices?.averageSellPrice" class="block text-xs">
                                    Price: ${{ card.cardmarket.prices.averageSellPrice.toFixed(2) }}
                                </span>
                                <span v-if="card.set.releaseDate" class="block text-xs">
                                    Released: {{ new Date(card.set.releaseDate).toLocaleDateString() }}
                                </span>
                                <span v-if="card.artist" class="block text-xs">
                                    Artist: {{ card.artist }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- No Cards Found -->
                    <div v-if="!spriteData.cards.tcgCards.length && !spriteData.cards.isLoading"
                        class="text-center text-gray-500 p-4">
                        No cards found for this Pokemon.
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
	name: "SpriteSheet",
	props: {
		pokemon: {
			type: Object,
			required: true,
		},
	},
	data() {
		return {
			spriteData: {
				mainSprites: {},
				showdownSprites: {},
				officialArtwork: {},
				pokemonHome: {},
				dreamworld: null,
				generationalSprites: {},
				icon: null,
				cards: {
					tcgCards: [],
					isLoading: false,
					error: null,
				},
			},
			spriteAccordions: {
				mainSprites: false,
				otherSprites: false,
				showdownSprites: false,
				officialArtwork: false,
				pokemonHome: false,
				dreamworld: false,
				spritesByGeneration: true,
				pokemonIcon: false,
			},
		};
	},
	watch: {
		pokemon: {
			immediate: true,
			handler(newPokemon) {
				if (newPokemon) {
					this.fetchSprites(newPokemon.id);
				}
			},
		},
        'spriteAccordions.pokemonCards': function(isOpen) {
			if (isOpen && this.pokemon && this.spriteData.cards.tcgCards.length === 0 && !this.spriteData.cards.isLoading) {
				this.fetchTCGCards(this.pokemon.name);
			}
		}
	},
	methods: {
        handleImageError(event) {
			event.target.src = '/placeholder.webp';
			event.target.classList.add('error-image');
		},
		async fetchSprites(pokemonId) {
			try {
				if (!pokemonId) {
					throw new Error("Pokemon ID is required");
				}

                const cachedData = sessionStorage.getItem(`pokemon-sprites-${pokemonId}`);
				if (cachedData) {
					this.spriteData = JSON.parse(cachedData);
					console.log("Using cached sprite data");
					return;
				}

				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
				);
				console.log("API Response:", response.data);
                const sprites = response.data.sprites;
                const pokemonName = response.data.name.toLowerCase();

				this.spriteData.mainSprites = {
					frontDefault: sprites.front_default || null,
					backDefault: sprites.back_default || null,
					frontShiny: sprites.front_shiny || null,
					backShiny: sprites.back_shiny || null,
				};

				this.spriteData.showdownSprites = {
					frontDefault: `https://play.pokemonshowdown.com/sprites/gen5/${pokemonName}.png`,
					backDefault: `https://play.pokemonshowdown.com/sprites/gen5-back/${pokemonName}.png`,
					frontShiny: `https://play.pokemonshowdown.com/sprites/gen5-shiny/${pokemonName}.png`,
					backShiny: `https://play.pokemonshowdown.com/sprites/gen5-back-shiny/${pokemonName}.png`,
					frontDefaultAnimated: `https://play.pokemonshowdown.com/sprites/ani/${pokemonName}.gif`,
					backDefaultAnimated: `https://play.pokemonshowdown.com/sprites/ani-back/${pokemonName}.gif`,
					frontShinyAnimated: `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemonName}.gif`,
					backShinyAnimated: `https://play.pokemonshowdown.com/sprites/ani-back-shiny/${pokemonName}.gif`,
				};

				this.spriteData.officialArtwork = {
					officialArtwork:
						sprites.other?.["official-artwork"]?.front_default || null,
					officialArtworkShiny:
						sprites.other?.["official-artwork"]?.front_shiny || null,
				};

				this.spriteData.pokemonHome = {
					default: sprites.other?.home?.front_default || null,
					shiny: sprites.other?.home?.front_shiny || null,
				};

				this.spriteData.dreamworld =
					sprites.other?.dream_world?.front_default || null;

				this.spriteData.generationalSprites = {
                    "gen-1": {
                        "red-blue": {
                            ...sprites.versions?.["generation-i"]?.["red-blue"] || {},
                            front_gray: sprites.versions?.["generation-i"]?.["red-blue"]?.front_gray ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/gray/${pokemonId}.png`,
                            back_gray: sprites.versions?.["generation-i"]?.["red-blue"]?.back_gray ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/red-blue/gray/back/${pokemonId}.png`
                        },
                        yellow: {
                            ...sprites.versions?.["generation-i"]?.yellow || {},
                            front_gray: sprites.versions?.["generation-i"]?.yellow?.front_gray ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/gray/${pokemonId}.png`,
                            back_gray: sprites.versions?.["generation-i"]?.yellow?.back_gray ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-i/yellow/gray/back/${pokemonId}.png`
                        },
                    },
                    "gen-2": {
                        crystal: sprites.versions?.["generation-ii"]?.crystal || {},
                        gold: sprites.versions?.["generation-ii"]?.gold || {},
                        silver: sprites.versions?.["generation-ii"]?.silver || {},
                    },
                    "gen-3": {
                        "ruby-sapphire": sprites.versions?.["generation-iii"]?.["ruby-sapphire"] || {},
                        "firered-leafgreen": sprites.versions?.["generation-iii"]?.["firered-leafgreen"] || {},
                    },
                    "gen-4": {
                        platinum: sprites.versions?.["generation-iv"]?.platinum || {},
                        "heartgold-soulsilver": sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"] || {},
                    },
                    "gen-5": {
                        "black-white": sprites.versions?.["generation-v"]?.["black-white"] || {},
                        "black-2-white-2": sprites.versions?.["generation-v"]?.["black-2-white-2"] || {},
                    },
                    "gen-6": {
                        "x-y": sprites.versions?.["generation-vi"]?.["x-y"] || {},
                        "omegaruby-alphasapphire": sprites.versions?.["generation-vi"]?.["omegaruby-alphasapphire"] || {},
                    },
                    "gen-7": {
                        "ultra-sun-ultra-moon": sprites.versions?.["generation-vii"]?.["ultra-sun-ultra-moon"] || {},
                        "icons": {
                            front_default: sprites.versions?.["generation-vii"]?.icons?.front_default ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${pokemonId}.png`,
                            front_female: sprites.versions?.["generation-vii"]?.icons?.front_female || null
                        }
                    },
                    "gen-8": {
                        "icons": {
                            front_default: sprites.versions?.["generation-viii"]?.icons?.front_default ||
                                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`,
                            front_female: sprites.versions?.["generation-viii"]?.icons?.front_female || null
                        }
                    },
				};

                this.spriteData.icon = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`;

                sessionStorage.setItem(`pokemon-sprites-${pokemonId}`, JSON.stringify(this.spriteData));

				console.log("Sprite Data:", this.spriteData);
			} catch (error) {
				console.error("Error fetching sprites:", error);
				this.spriteData = {
					mainSprites: {},
					showdownSprites: {},
					officialArtwork: {},
					pokemonHome: {},
					dreamworld: null,
					generationalSprites: {},
					icon: null,
				};
			}
		},
		async fetchTCGCards(pokemonName) {
			try {
				this.spriteData.cards.isLoading = true;
				this.spriteData.cards.error = null;

				const cleanName = pokemonName
					.toLowerCase()
					.replace(/[^a-z0-9]/g, "")
					.replace(/-+/g, " ");

				const response = await axios.get("https://api.pokemontcg.io/v2/cards", {
					params: {
						q: `name:"${cleanName}"`,
						orderBy: "set.releaseDate",
						page: 1,
						pageSize: 500,
					},
					headers: {
						"X-Api-Key": "4c4a14da-aea3-4654-824b-4f646023c6fc",
					},
				});

				if (response.data.data && response.data.data.length > 0) {
					this.spriteData.cards.tcgCards = response.data.data;
				} else {
					this.spriteData.cards.error = "No cards found for this Pokémon";
				}
			} catch (error) {
				console.error("Error fetching TCG cards:", error);
				this.spriteData.cards.error =
					error.response?.status === 403
						? "API key error - Please check your credentials"
						: "Failed to load TCG cards. Please try again later.";
			} finally {
				this.spriteData.cards.isLoading = false;
			}
		},
		toggleSpriteAccordion(section) {
			this.spriteAccordions[section] = !this.spriteAccordions[section];
		},
		formatSpriteLabel(key) {
			return key
				.split(/(?=[A-Z])/)
				.join(" ")
				.toLowerCase()
				.replace(/\b\w/g, (l) => l.toUpperCase());
		},
		formatGeneration(gen) {
			const genNumber = gen.split("-")[1];
			return `Generation ${genNumber}`;
		},
		getGenSprites(genSprites) {
			if (!genSprites) return {};
    
            const sprites = {};
            const gameVersions = {
                "red-blue": "Red / Blue",
                "yellow": "Yellow",
                "gold": "Gold",
                "silver": "Silver",
                "crystal": "Crystal",
                "ruby-sapphire": "Ruby / Sapphire / Emerald",
                "firered-leafgreen": "FireRed / LeafGreen",
                "diamond-pearl": "Diamond / Pearl / Platinum",
                "platinum": "Diamond / Pearl / Platinum",
                "heartgold-soulsilver": "HeartGold / SoulSilver",
                "black-white": "Black / White - Black 2 / White 2",
                "black-2-white-2": "Black 2 / White 2",
                "x-y": "X / Y",
                "omegaruby-alphasapphire": "Omega Ruby / Alpha Sapphire",
                "ultra-sun-ultra-moon": "Ultra Sun / Ultra Moon",
                "sword-shield": "Sword / Shield",
                "brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
                "legends-arceus": "Legends: Arceus",
            };

			for (const [version, versionData] of Object.entries(genSprites)) {
				if (version === "animated") continue;

				const spriteUrls = {
					front_default: versionData.front_default,
					front_shiny: versionData.front_shiny,
					back_default: versionData.back_default,
					back_shiny: versionData.back_shiny,
                    front_gray: versionData.front_gray,
                    back_gray: versionData.back_gray,

                    front_default_animated: versionData.animated?.front_default,
                    front_shiny_animated: versionData.animated?.front_shiny,
                    back_default_animated: versionData.animated?.back_default,
                    back_shiny_animated: versionData.animated?.back_shiny,

				};

				if (Object.values(spriteUrls).some((url) => url)) {
					sprites[version] = {
						static: spriteUrls,
						label: gameVersions[version] || version,
					};
				}
			}

			return sprites;
		},
		getRarityColor(rarity) {
			if (!rarity) return "text-gray-500";

			const rarityColors = {
				"Common": "text-gray-500",
				"Uncommon": "text-green-500",
				"Rare": "text-blue-500",
				"Rare Holo": "text-indigo-500",
				"Rare Ultra": "text-purple-500",
				"Rare Holo GX": "text-violet-500",
				"Rare Holo V": "text-pink-500",
				"Rare Holo VMAX": "text-rose-500",
				"Rare Rainbow": "text-yellow-500",
				"Rare Secret": "text-amber-500",
				"Rare Shining": "text-orange-500",
				"Promo": "text-emerald-500",
				"Amazing Rare": "text-cyan-500",
				"Rare Holo EX": "text-teal-500",
				"Rare ACE": "text-sky-500",
				"Rare BREAK": "text-blue-500",
				"Rare Prime": "text-violet-500",
				"Rare Prism Star": "text-purple-500",
				"Classic Collection": "text-yellow-500",
				"Galaxy Holo": "text-indigo-500",
				"Legend": "text-amber-500",
				"Radiant Rare": "text-rose-500",
				"Trainer Gallery Rare Holo": "text-pink-500",
				"Double Rare": "text-emerald-500",
				"Hyper Rare": "text-violet-500",
				"Illustration Rare": "text-sky-500",
				"Special Illustration Rare": "text-cyan-500",
				"Ultra Rare": "text-purple-500",
				"Rare Shiny": "text-yellow-500",
				"Rare Shiny GX": "text-amber-500",
			};

			return rarityColors[rarity] || "text-gray-500";
		},
	},
};
</script>