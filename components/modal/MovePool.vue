<template>
  <div class="mt-8">
    <h3 class="font-bold mb-4">Move Pool:</h3>

    <!-- Filters -->
    <div class="flex flex-wrap w-full gap-4 mb-4">
      <div class="flex items-center">
        <label for="move-filter" class="mr-2 font-semibold"
          >Learn Method:</label
        >
        <select
          v-model="selectedLearnMethod"
          id="move-filter"
          class="rounded-lg border px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="level-up">Level Up</option>
          <option value="machine">Machine</option>
          <option value="egg">Egg</option>
          <option value="tutor">Tutor</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="moveData.isLoading" class="flex justify-center py-8">
      <div
        class="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="moveData.error"
      class="text-center py-12 bg-gray-50 rounded-lg"
    >
      <div class="flex flex-col items-center gap-4">
        <span class="text-4xl">😕</span>
        <p class="text-gray-500">{{ moveData.error }}</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="!computedMoves.length"
      class="text-center py-12 bg-gray-50 rounded-lg"
    >
      <div class="flex flex-col items-center gap-4">
        <span class="text-4xl">🔍</span>
        <p class="text-gray-500">
          No moves available for this learning method.
        </p>
      </div>
    </div>

    <!-- Moves Table -->
    <div v-else class="relative overflow-x-auto shadow-md rounded-lg">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <!-- Level/TM Column -->
            <template v-if="selectedLearnMethod === 'level-up'">
              <th scope="col" class="px-4 py-3">
                <button @click="sortMoves('level')" class="flex items-center">
                  Level
                  <svg
                    :class="[
                      'w-3 h-3 ms-1.5 transition-transform',
                      getSortIcon('level'),
                    ]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                    />
                  </svg>
                </button>
              </th>
            </template>
            <template v-if="selectedLearnMethod === 'machine'">
              <th scope="col" class="px-4 py-3">
                <button
                  @click="sortMoves('tm_number')"
                  class="flex items-center"
                >
                  TM
                  <svg
                    :class="[
                      'w-3 h-3 ms-1.5 transition-transform',
                      getSortIcon('tm_number'),
                    ]"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                    />
                  </svg>
                </button>
              </th>
            </template>

            <!-- Other Columns -->
            <th
              v-for="(header, key) in tableHeaders"
              :key="key"
              scope="col"
              class="px-4 py-3"
            >
              <button @click="sortMoves(key)" class="flex items-center">
                {{ header }}
                <svg
                  :class="[
                    'w-3 h-3 ms-1.5 transition-transform',
                    getSortIcon(key),
                  ]"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z"
                  />
                </svg>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="move in sortedMoves"
            :key="move.name"
            class="bg-white border-b hover:bg-gray-50"
          >
            <!-- Level/TM Column -->
            <template v-if="selectedLearnMethod === 'level-up'">
              <td class="px-4 py-2 font-medium text-center">
                {{ move.level }}
              </td>
            </template>
            <!-- Replace the existing TM number column in the table -->
            <template v-if="selectedLearnMethod === 'machine'">
              <td class="px-4 py-2">
                <div class="flex items-center justify-center gap-2">
                  <!-- <span class="font-medium"
                    >TM{{ String(move.tm_number).padStart(2, "0") }}</span
                  > -->
                  <img
                    :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${move.type.toLowerCase()}.png`"
                    class="w-6 h-6"
                    :alt="`TM ${move.type}`"
                    @error="handleTMSpriteError($event)"
                  />
                </div>
              </td>
            </template>

            <!-- Move Name -->
            <td class="px-4 py-2 font-medium capitalize">
              {{ formatMoveName(move.name) }}
            </td>

            <!-- Type -->
            <td class="px-4 py-2 text-center">
              <div class="flex items-center justify-center">
                <span
                  :class="[
                    'px-3 py-1 rounded-lg capitalize text-white text-xs font-medium relative group inline-block cursor-pointer',
                    typeColorClass(move.type),
                  ]"
                >
                  {{ getEmojiForType(move.type) }}
                  <div
                    class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap"
                  >
                    {{ formatTypeName(move.type) }}
                  </div>
                </span>
              </div>
            </td>

            <!-- Effect -->
            <td class="px-4 py-2">{{ move.effect }}</td>

            <!-- Category -->
            <td class="px-4 py-2 text-center">
              <span
                :class="[
                  'px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg capitalize text-white text-[10px] sm:text-xs font-medium flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap',
                  getCategoryColor(move.category),
                ]"
              >
                <span class="text-md">{{ getMoveEmoji(move.category) }}</span>
                <span class="truncate">{{ move.category }}</span>
              </span>
            </td>

            <!-- Stats -->
            <td class="px-4 py-2 text-center">{{ move.power || "-" }}</td>
            <td class="px-4 py-2 text-center">{{ move.pp || "-" }}</td>
            <td class="px-4 py-2 text-center">{{ move.accuracy || "-" }}</td>
            <td class="px-4 py-2 text-center">{{ move.priority }}</td>
            <td class="px-4 py-2 text-center">{{ move.generation }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, watch } from "vue";

export default {
	props: {
		pokemon: {
			type: Object,
			required: true,
		},
	},
	async mounted() {
		if (this.pokemon?.id) {
			// Add null check
			await this.fetchMoves(this.pokemon.id);
		}
	},
	setup() {
		const selectedLearnMethod = ref("level-up");
		const selectedGameVersion = ref("scarlet-violet");
		const moveData = ref({
			isLoading: false,
			error: null,
			moves: [],
		});

		const typeColorClass = (type) => {
			const typeColors = {
				fire: "bg-orange-600 hover:bg-orange-700",
				water: "bg-blue-600 hover:bg-blue-700",
				grass: "bg-lime-600 hover:bg-lime-700",
				electric: "bg-yellow-600 hover:bg-yellow-700",
				ice: "bg-teal-600 hover:bg-teal-700",
				fighting: "bg-red-700 hover:bg-red-800",
				poison: "bg-purple-700 hover:bg-purple-800",
				ground: "bg-yellow-700 hover:bg-yellow-800",
				flying: "bg-violet-600 hover:bg-violet-700",
				psychic: "bg-pink-600 hover:bg-pink-700",
				bug: "bg-lime-700 hover:bg-lime-800",
				rock: "bg-yellow-700 hover:bg-yellow-800",
				dragon: "bg-indigo-600 hover:bg-indigo-700",
				ghost: "bg-purple-700 hover:bg-purple-800",
				dark: "bg-gray-800 hover:bg-gray-900",
				steel: "bg-gray-600 hover:bg-gray-700",
				fairy: "bg-pink-600 hover:bg-pink-700",
				normal: "bg-gray-600 hover:bg-gray-700",
			};
			return typeColors[type.toLowerCase()] || "bg-gray-600";
		};

		watch(
			[selectedLearnMethod, selectedGameVersion],
			async ([method, version]) => {
				if (selectedPokemon.value) {
					await fetchMoves(selectedPokemon.value.id, method, version);
				}
			},
		);

		return {
			selectedLearnMethod,
			selectedGameVersion,
			moveData,
			typeColorClass,
		};
	},
	methods: {
		async openModal(pokemon) {
			try {
				await this.fetchMoves(pokemon.id);
			} catch (error) {
				console.error("Error opening modal:", error);
			}
		},
		async fetchMoves(pokemonId, version = "scarlet-violet") {
			this.moveData.isLoading = true;
			this.moveData.error = null;

			try {
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
				);
				const moves = await Promise.all(
					response.data.moves.map(async (moveData) => {
						const moveResponse = await axios.get(moveData.move.url);
						const versionDetails = moveData.version_group_details.find(
							(detail) => detail.version_group.name === version,
						);

						if (!versionDetails) return null;

						const tmMachine = moveResponse.data.machines?.find(
							(machine) => machine.version_group.name === version,
						);
						const tmNumber = tmMachine?.machine?.url
							? Number(tmMachine.machine.url.split("/").slice(-2)[0])
							: null;

						const englishEffect = moveResponse.data.effect_entries.find(
							(entry) => entry.language.name === "en",
						);

						return {
							name: moveData.move.name,
							learn_method: versionDetails.move_learn_method.name,
							level: versionDetails.level_learned_at,
							type: moveResponse.data.type.name,
							effect: englishEffect?.short_effect || "No description available",
							category: moveResponse.data.damage_class.name,
							power: moveResponse.data.power || "-",
							pp: moveResponse.data.pp,
							accuracy: moveResponse.data.accuracy || "-",
							priority: moveResponse.data.priority,
							generation: moveResponse.data.generation.name
								.split("-")[1]
								.toUpperCase(),
							tm_number: tmNumber,
						};
					}),
				);

				this.moveData.moves = moves.filter(Boolean);
			} catch (error) {
				console.error("Error fetching moves:", error);
				this.moveData.error = "Failed to load moves";
			} finally {
				this.moveData.isLoading = false;
			}
		},
		getSortIcon(key) {
			if (this.sortConfig.key !== key) return "";
			return this.sortConfig.direction === "asc" ? "" : "rotate-180";
		},
		sortMoves(key) {
			if (this.sortConfig.key === key) {
				this.sortConfig.direction =
					this.sortConfig.direction === "asc" ? "desc" : "asc";
			} else {
				this.sortConfig.key = key;
				this.sortConfig.direction = "asc";
			}
		},
		formatMoveName(name) {
			return name.replace(/-/g, " ");
		},
		getCategoryColor(category) {
			return (
				{
					physical: "bg-orange-500 hover:bg-orange-600",
					special: "bg-blue-500 hover:bg-blue-600",
					status: "bg-gray-500 hover:bg-gray-600",
				}[category] || "bg-gray-500 hover:bg-gray-600"
			);
		},
		formatTypeName(type) {
			return type.charAt(0).toUpperCase() + type.slice(1);
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
		getMoveEmoji(category) {
			return (
				{
					physical: "👊",
					special: "✨",
					status: "⭐",
				}[category] || ""
			);
		},
		getTMSprite(move) {
			const type = move.type.toLowerCase();
			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-${type}.png`;
		},
		handleTMSpriteError(event) {
			event.target.src =
				"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tm-normal.png";
		},
	},
	data() {
		return {
			moveData: {
				moves: [],
				isLoading: false,
				error: null,
			},
			sortConfig: {
				key: null,
				direction: "asc",
			},
			tableHeaders: {
				name: "Name",
				type: "Type",
				effect: "Effect",
				category: "Category",
				power: "Power",
				pp: "PP",
				accuracy: "Accuracy",
				priority: "Priority",
				generation: "Introduced",
			},
			selectedLearnMethod: "level-up",
			selectedGameVersion: "scarlet-violet",
		};
	},
	computed: {
		computedMoves() {
			if (!this.moveData.moves.length) return [];

			return this.moveData.moves
				.filter((move) => move.learn_method === this.selectedLearnMethod)
				.sort((a, b) => {
					if (this.selectedLearnMethod === "level-up") {
						return a.level - b.level;
					}
					return a.name.localeCompare(b.name);
				});
		},
		sortedMoves() {
			if (!this.sortConfig.key) return this.computedMoves;

			return [...this.computedMoves].sort((a, b) => {
				let aVal = a[this.sortConfig.key];
				let bVal = b[this.sortConfig.key];

				if (typeof aVal === "string") aVal = aVal.toLowerCase();
				if (typeof bVal === "string") bVal = bVal.toLowerCase();

				if (this.sortKey === "level") return a.level - b.level;
				if (this.sortKey === "tm_number") return a.tm_number - b.tm_number;

				return this.sortConfig.direction === "asc"
					? aVal > bVal
						? 1
						: -1
					: aVal < bVal
						? 1
						: -1;
			});
		},
	},
};
</script>