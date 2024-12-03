<template>
  <div class="mt-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Breeding Section -->
      <div>
        <h3 class="font-bold mb-2">Breeding:</h3>
        <div class="bg-white">
          <table class="w-full table-fixed">
            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 w-1/3"><strong>Gender Ratio:</strong></td>
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <template v-if="pokemon?.breeding?.genderRate === -1">
                      <button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-purple-500 hover:bg-purple-600 transition-colors">
                        <span class="flex items-center gap-1">
                          <span>⚥</span> Genderless
                        </span>
                      </button>
                    </template>
                    <template v-else-if="pokemon?.breeding?.genderRate !== undefined">
                      <button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors">
                        <span class="flex items-center gap-1">
                          <span>♂</span> {{ calculateGenderRatio(pokemon.breeding.genderRate).male }}%
                        </span>
                      </button>
                      <button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-pink-500 hover:bg-pink-600 transition-colors">
                        <span class="flex items-center gap-1">
                          <span>♀</span> {{ calculateGenderRatio(pokemon.breeding.genderRate).female }}%
                        </span>
                      </button>
                    </template>
                    <template v-else>
                      <span class="text-gray-500">Unknown</span>
                    </template>
                  </div>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Growth Rate:</strong></td>
                <td class="py-3 capitalize">
                  {{ pokemon.breeding?.growthRate?.replace?.(/-/g, ' ') || 'Unknown' }}
                </td>
              </tr>
              <template v-if="pokemon?.breeding">
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="py-3"><strong>Egg Cycles:</strong></td>
                  <td class="py-3">
                    {{ pokemon.breeding.hatchCounter || 0 }}
                    ({{ formatNumber((pokemon.breeding.hatchCounter || 0) * 255) }} steps)
                  </td>
                </tr>
              </template>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Baby Trigger Item:</strong></td>
                <td class="py-3 capitalize">
                  <div v-if="pokemon.breeding.babyTriggerItem" class="flex items-center gap-2">
                    <span>{{ formatItemName(pokemon.breeding.babyTriggerItem) }}</span>
                    <img
                      :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${pokemon.breeding.babyTriggerItem}.png`"
                      :alt="pokemon.breeding.babyTriggerItem"
                      class="w-auto h-auto"
                      @error="handleImageError"
                    />
                  </div>
                  <span v-else>None</span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Habitat:</strong></td>
                <td class="py-3 capitalize">
                  {{ pokemon.breeding.habitat }}
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Egg Groups:</strong></td>
                <td class="py-3">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="group in pokemon.breeding.eggGroups" 
                      :key="group"
                      class="px-3 py-1 text-sm font-medium rounded-lg text-emerald-600 border border-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      {{ formatEggGroup(group) }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Training Section -->
      <div>
        <h3 class="font-bold mb-2">Training:</h3>
        <div class="bg-white">
          <table class="w-full table-fixed">
            <tbody class="divide-y divide-gray-100">
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3 w-1/3"><strong>EV Yield:</strong></td>
                <td class="py-3">
                  <div class="flex flex-col gap-1">
                    <span v-for="ev in pokemon.training.evYield" :key="ev.stat" class="text-sm">
                      {{ formatStatName(ev.stat) }}: +{{ ev.value }}
                    </span>
                  </div>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Catch Rate:</strong></td>
                <td class="py-3">
                  {{ pokemon.training.catchRate }} 
                  ({{ (pokemon.training.catchRate / 255 * 100).toFixed(1) }}%)
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Base Happiness:</strong></td>
                <td class="py-3">
                  {{ pokemon.training.baseHappiness }}
                  <span class="text-sm text-gray-500">
                    ({{ getHappinessLevel(pokemon.training.baseHappiness) }})
                  </span>
                </td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Base XP:</strong></td>
                <td class="py-3">{{ pokemon.training.baseExp }}</td>
              </tr>
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="py-3"><strong>Held Items:</strong></td>
                <td class="py-3">
                  <div v-if="pokemon.training.heldItems.length" class="flex flex-col gap-2">
                    <div v-for="item in pokemon.training.heldItems" :key="item.name" class="flex items-center gap-2">
                      <span>{{ formatItemName(item.name) }}</span>
                      <img
                        :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`"
                        :alt="item.name"
                        class="w-auto h-auto"
                        @error="handleImageError"
                      />
                    </div>
                  </div>
                  <span v-else>None</span>
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
export default {
	name: "BreedingTraining",
	props: {
		pokemon: {
			type: Object,
			required: true,
		},
	},
	methods: {
		calculateGenderRatio(genderRate) {
			if (
				genderRate === undefined ||
				genderRate === null ||
				genderRate === -1
			) {
				return { isGenderless: true, male: 0, female: 0 };
			}
			const femalePercentage = (genderRate / 8) * 100;
			return {
				isGenderless: false,
				male: 100 - femalePercentage,
				female: femalePercentage,
			};
		},
		formatNumber(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		formatItemName(name) {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		formatEggGroup(group) {
			return group
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		formatStatName(statName) {
			const statNames = {
				hp: "HP",
				attack: "Attack",
				defense: "Defense",
				"special-attack": "Sp. Attack",
				"special-defense": "Sp. Defense",
				speed: "Speed",
			};
			return statNames[statName] || statName;
		},
		getHappinessLevel(happiness) {
			if (happiness > 70) return "Higher than normal";
			if (happiness < 70) return "Lower than normal";
			return "Normal";
		},
		handleImageError(event) {
			event.target.style.display = "none";
		},
	},
};
</script>