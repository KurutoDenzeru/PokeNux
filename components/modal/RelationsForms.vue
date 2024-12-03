<template>
  <div class="mt-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Relations Section -->
      <div>
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold">Relations:</h3>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">Defending</span>
            <label class="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="isAttacking"
                class="sr-only peer"
                @change="fetchTypeRelations"
              />
              <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
            <span class="text-sm font-medium text-gray-900">Attacking</span>
          </div>
        </div>

        <div class="bg-white">
          <table class="w-full table-fixed">
            <tbody class="divide-y divide-gray-100">
              <tr
                v-for="(types, category) in typeRelations"
                :key="category"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 w-1/3">
                  <strong>{{ formatRelationType(category) }}:</strong>
                </td>
                <td class="py-3">
                  <div class="flex flex-wrap gap-2">
                    <span v-if="types.length === 0" class="text-gray-500">None</span>
                    <span
                      v-for="type in types"
                      :key="type"
                      :class="[
                        'px-3 py-1 rounded-lg capitalize text-white font-semibold shadow-sm text-sm relative group inline-block cursor-pointer',
                        typeColorClass(type),
                      ]"
                    >
                      {{ getEmojiForType(type) }}
                      <div
                        class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap"
                      >
                        {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                      </div>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Forms Section -->
      <div>
        <h3 class="font-bold mb-4">Forms:</h3>
        <div class="bg-white">
          <table class="w-full table-fixed">
            <tbody class="divide-y divide-gray-100">
              <!-- Alternative Forms -->
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 w-1/3"><strong>Alternative Forms:</strong></td>
                <td class="py-3">
                  {{ pokemon.forms?.hasAlternativeForms ? 'Yes' : 'No' }}
                </td>
              </tr>

              <!-- Varieties -->
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Varieties:</strong></td>
                <td class="py-3">
                  <div
                    v-if="pokemon.forms?.varieties.length"
                    class="flex flex-wrap gap-2"
                  >
                    <button
                      v-for="variety in pokemon.forms.varieties"
                      :key="variety.id"
                      @click="$emit('variety-click', variety)"
                      class="px-3 py-1 text-sm font-medium rounded-lg text-emerald-600 border border-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                    >
                      <img
                        :src="getOfficialArtwork(variety.id)"
                        :alt="variety.name"
                        class="w-12 h-12"
                        @error="handleImageError"
                      />
                      {{ formatVarietyName(variety.name) }}
                    </button>
                  </div>
                  <span v-else class="text-gray-500">None</span>
                </td>
              </tr>

              <!-- Gender Differences -->
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Gender Differences:</strong></td>
                <td class="py-3">
                  <div
                    v-if="pokemon.forms?.hasGenderDifferences"
                    class="space-y-2"
                  >
                    <p class="text-sm text-gray-600">
                      {{ pokemon.forms.genderDifferencesDescription }}
                    </p>
                    <div class="flex gap-4 mt-2">
                      <div class="flex items-center gap-2">
                        <span class="text-blue-500">♂</span>
                        <img
                          :src="pokemon.forms.maleSprite"
                          :alt="pokemon.name + ' male'"
                          class="w-auto h-auto"
                          @error="handleImageError"
                        />
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-pink-500">♀</span>
                        <img
                          :src="pokemon.forms.femaleSprite"
                          :alt="pokemon.name + ' female'"
                          class="w-auto h-auto pixelated"
                          @error="handleImageError"
                        />
                      </div>
                    </div>
                  </div>
                  <span v-else class="text-gray-500">No gender differences</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { ref, watch } from "vue";

export default {
	name: "RelationsForms",
	props: {
		pokemon: {
			type: Object,
			required: true,
		},
	},
	emits: ["variety-click"],
	setup(props) {
		const isAttacking = ref(true);
		const typeRelations = ref({
			immune: [],
			quarterDamage: [],
			halfDamage: [],
			doubleDamage: [],
			quadrupleDamage: [],
		});

		const fetchTypeRelations = async () => {
			if (!props.pokemon?.types) return;

			try {
				const typePromises = props.pokemon.types.map((type) =>
					axios.get(`https://pokeapi.co/api/v2/type/${type}`),
				);

				const typeResponses = await Promise.all(typePromises);

				typeRelations.value = {
					immune: [],
					quarterDamage: [],
					halfDamage: [],
					doubleDamage: [],
					quadrupleDamage: [],
				};

				if (isAttacking.value) {
					// Attacking relations (how much damage this Pokémon deals)
					for (const response of typeResponses) {
						const relations = response.data.damage_relations;
						typeRelations.value.immune.push(
							...relations.no_damage_to.map((t) => t.name),
						);
						typeRelations.value.halfDamage.push(
							...relations.half_damage_to.map((t) => t.name),
						);
						typeRelations.value.doubleDamage.push(
							...relations.double_damage_to.map((t) => t.name),
						);
					}
				} else {
					// Defending relations (how much damage this Pokémon takes)
					const type1Relations = typeResponses[0].data.damage_relations;
					const type2Relations = typeResponses[1]?.data.damage_relations;

					// Initialize effectiveness multipliers for each type
					const effectiveness = {};

					// Process first type
					for (const t of type1Relations.no_damage_from) {
						effectiveness[t.name] = 0;
					}
					for (const t of type1Relations.half_damage_from) {
						effectiveness[t.name] = 0.5;
					}
					for (const t of type1Relations.double_damage_from) {
						effectiveness[t.name] = 2;
					}

					// Process second type if it exists
					if (type2Relations) {
						for (const type of Object.keys(effectiveness)) {
							if (type2Relations.no_damage_from.some((t) => t.name === type)) {
								effectiveness[type] *= 0;
							} else if (
								type2Relations.half_damage_from.some((t) => t.name === type)
							) {
								effectiveness[type] *= 0.5;
							} else if (
								type2Relations.double_damage_from.some((t) => t.name === type)
							) {
								effectiveness[type] *= 2;
							}
						}

						// Add new types from second type
						for (const t of type2Relations.no_damage_from) {
							if (!(t.name in effectiveness)) effectiveness[t.name] = 0;
						}
						for (const t of type2Relations.half_damage_from) {
							if (!(t.name in effectiveness)) effectiveness[t.name] = 0.5;
						}
						for (const t of type2Relations.double_damage_from) {
							if (!(t.name in effectiveness)) effectiveness[t.name] = 2;
						}
					}

					// Categorize based on effectiveness
					for (const [type, value] of Object.entries(effectiveness)) {
						if (value === 0) typeRelations.value.immune.push(type);
						else if (value === 0.25)
							typeRelations.value.quarterDamage.push(type);
						else if (value === 0.5) typeRelations.value.halfDamage.push(type);
						else if (value === 2) typeRelations.value.doubleDamage.push(type);
						else if (value === 4)
							typeRelations.value.quadrupleDamage.push(type);
					}
				}

				// Remove duplicates
				for (const key of Object.keys(typeRelations.value)) {
					typeRelations.value[key] = [...new Set(typeRelations.value[key])];
				}
			} catch (error) {
				console.error("Error fetching type relations:", error);
			}
		};

		watch(() => props.pokemon?.types, fetchTypeRelations, { immediate: true });

		return {
			isAttacking,
			typeRelations,
			fetchTypeRelations,
		};
	},
	methods: {
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
		formatRelationType(type) {
			const formats = {
				immune: "No Dmg",
				quarterDamage: "Quarter Dmg",
				halfDamage: "Half Dmg",
				doubleDamage: "Double Dmg",
				quadrupleDamage: "Quadruple Dmg",
			};
			return formats[type] || type;
		},
		formatVarietyName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		getOfficialArtwork(id) {
			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
		},
		handleImageError(event) {
			event.target.style.display = "none";
		},
	},
};
</script>