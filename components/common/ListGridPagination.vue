<template>
    <div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-6 antialiased">
        <div v-for="pokemon in paginatedPokemon"
            :key="pokemon.id"
            @click="openModal(pokemon)"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
            class="tilt-card bg-white border-2 border-gray-200 rounded-2xl shadow py-4 text-center cursor-pointer transition-all duration-300 ease-out hover:scale-105">
            <div class="glow opacity-0 transition-opacity duration-300"></div>
            <div class="tilt-card-content flex flex-col items-center relative z-10">
                <p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
                <img :src="pokemon.sprite" :alt="pokemon.name"
                    class="w-28 h-28 mx-auto mb-2" />
                <p class="capitalize">{{ pokemon.name }}</p>
                <div class="flex flex-row flex-wrap justify-center gap-1 mt-2">
                    <span v-for="type in pokemon.types"
                        :key="type"
                        :class="['inline-flex items-center px-2 py-1 rounded-lg capitalize text-white text-xs lg:text-sm whitespace-nowrap', typeColorClass(type)]">
                        {{ getEmojiForType(type) }} {{ type }}
                    </span>
                </div>
            </div>
        </div>
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
				const isVariant =
					pokemon.name.includes("-mega") ||
					pokemon.name.includes("-gmax") ||
					pokemon.name.includes("-alola") ||
					pokemon.name.includes("-galar") ||
					pokemon.name.includes("-hisui") ||
					pokemon.name.includes("-paldea");

				if (isVariant) {
					// Get base form name
					const baseName = this.getBaseFormName(pokemon.name);

					const baseResponse = await axios.get(
						`https://pokeapi.co/api/v2/pokemon-species/${baseName}`,
					);
					const baseId = baseResponse.data.id;

					const updatedPokemon = {
						...pokemon,
						baseSpeciesId: baseId,
						baseSpeciesName: baseName,
						isVariant: true,
						variantType: this.getVariantType(pokemon.name),
					};

					this.$emit("open-modal", updatedPokemon);
				} else {
					this.$emit("open-modal", pokemon);
				}
			} catch (error) {
				console.error("Error processing Pokemon data:", error);
				this.$emit("open-modal", pokemon); // Fallback to original data
			}
		},
	},
};
</script>