<template>
  <transition name="fade" v-if="selectedPokemon">
    <div class="flex justify-center items-center" @click.self="closeModal">
      <div class="bg-white max-w-7xl w-full relative max-h-[90vh] flex flex-col" @click.stop>
        <!-- Modal Header - Sticky -->
        <div class="bg-white py-4 mb-4">
          <p class="text-gray-900 text-md md:text-base font-bold">
            {{ selectedPokemon.description || 'No description available.' }}
          </p>
        </div>

        <!-- Pokédex and Additional Details -->
        <div class="mt-4">
          <h3 class="font-bold mb-2">Details:</h3>
          <div class="w-full overflow-hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Basic Info Section -->
              <div class="bg-white">
                <table class="w-full table-fixed">
                  <tbody class="divide-y divide-gray-100">
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3 w-1/3"><strong>Pokédex No:</strong></td>
                      <td class="py-3">
                        # {{ String(selectedPokemon.id).padStart(4, '0') }}
                      </td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Generation:</strong></td>
                      <td class="py-3">{{ selectedPokemon.generation }}</td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Category:</strong></td>
                      <td class="py-3">{{ selectedPokemon.genus || 'Unknown' }}</td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Shape:</strong></td>
                      <td class="py-3 capitalize">
                        {{ selectedPokemon.shape || 'Unknown' }}
                      </td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Color:</strong></td>
                      <td class="py-3 capitalize">
                        {{ selectedPokemon.color || 'Unknown' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Detailed Info Section -->
              <div class="bg-white">
                <table class="w-full table-fixed">
                  <tbody class="divide-y divide-gray-100">
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3 w-1/3"><strong>Type:</strong></td>
                      <td class="py-3">
                        <div class="flex flex-wrap gap-2">
                          <span
                            v-for="type in selectedPokemon.types"
                            :key="type"
                            :class="[
                              'px-3 py-1 rounded-lg capitalize text-white font-semibold shadow-sm text-sm cursor-pointer',
                              typeColorClass(type)
                            ]"
                          >
                            {{ getEmojiForType(type) }} {{ type }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Weight:</strong></td>
                      <td class="py-3">
                        {{ selectedPokemon.weight }} kg
                        ({{ (selectedPokemon.weight * 2.20462).toFixed(1) }} lbs)
                      </td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Height:</strong></td>
                      <td class="py-3">
                        {{ formatHeight(selectedPokemon.height) }}
                      </td>
                    </tr>
                    <tr class="hover:bg-gray-50 transition-colors">
                      <td class="py-3"><strong>Abilities:</strong></td>
                      <td class="py-3">
                        <div class="space-y-3">
                          <div
                            v-for="ability in selectedPokemon.abilities"
                            :key="ability.name"
                            class="last:mb-0"
                          >
                            <div class="flex items-center gap-2">
                              <span class="font-medium">
                                {{ formatAbilityName(ability.name) }}
                              </span>
                              <span
                                v-if="ability.is_hidden"
                                class="text-sm text-gray-500"
                              >
                                (Hidden)
                              </span>
                            </div>
                            <p class="text-sm text-gray-600 mt-1">
                              {{ ability.description }}
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { ref, computed, watch } from "vue";
import axios from "axios";

export default {
	props: {
		selectedPokemon: Object,
	},
	setup(props, { emit }) {
		const isNormalSprite = ref(true);
		const evolutionChain = ref([]);

		const typeColorClass = (type) => {
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
		};

		const getEmojiForType = (type) => {
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
		};

		const formatHeight = (height) => {
			const heightInMeters = height / 10;
			const totalInches = heightInMeters * 39.3701;
			const feet = Math.floor(totalInches / 12);
			const inches = Math.round(totalInches % 12);
			return `${heightInMeters.toFixed(1)}m (${feet}'${inches}")`;
		};

		const formatAbilityName = (name) => {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};

		const closeModal = () => {
			emit("close-modal");
		};

		return {
			isNormalSprite,
			evolutionChain,
			typeColorClass,
			getEmojiForType,
			formatHeight,
			formatAbilityName,
			closeModal,
		};
	},
};
</script>