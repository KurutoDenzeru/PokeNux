<template>
  <!-- Base Stats -->
  <div>
    <h3 class="font-bold mb-2">Base Stats:</h3>
    <ul>
      <li
        v-for="stat in pokemon.stats"
        :key="stat.stat.name"
        class="mb-2"
      >
        <div class="grid grid-cols-12 gap-2 items-center">
          <!-- Stat Name -->
          <div class="col-span-3">
            <span class="text-base font-medium text-gray-700">
              {{
                stat.stat.name === "hp"
                  ? "HP"
                  : stat.stat.name === "attack"
                  ? "Attack"
                  : stat.stat.name === "defense"
                  ? "Defense"
                  : stat.stat.name === "special-attack"
                  ? "Sp. Attack"
                  : stat.stat.name === "special-defense"
                  ? "Sp. Defense"
                  : "Speed"
              }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="col-span-6">
            <div class="flex justify-between mb-1">
              <span class="text-sm font-medium text-emerald-700">{{
                stat.base_stat
              }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2.5">
              <div
                class="bg-emerald-600 h-2.5 rounded-full"
                :style="{ width: (stat.base_stat / maxStat) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <!-- Min/Max Values -->
          <div
            class="col-span-3 grid grid-cols-2 gap-2 text-md font-medium justify-items-center"
          >
            <div class="text-gray-500">{{ calculateMinStat(stat) }}</div>
            <div class="text-gray-500 text-right">
              {{ calculateMaxStat(stat) }}
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>

  <!-- Total Stats -->
  <div class="grid grid-cols-12 gap-4 items-center">
    <div class="col-span-3">
      <span class="font-semibold">Total:</span>
    </div>
    <div class="col-span-6">
      <div class="flex justify-between">
        <span class="text-sm font-semibold">{{ totalStats }}</span>
      </div>
    </div>
    <div
      class="col-span-3 grid grid-cols-2 gap-2 text-md font-semibold justify-items-center"
    >
      <div>Min</div>
      <div>Max</div>
    </div>
  </div>
</template>

<script>
export default {
	name: "BaseTotalStats",
	props: {
		pokemon: {
			type: Object,
			required: true,
		},
	},
	methods: {
		calculateMinStat(stat) {
			if (stat.stat.name === "hp") {
				return Math.floor((2 * stat.base_stat * 100) / 100 + 100 + 10);
			}
			return Math.floor((2 * stat.base_stat * 100) / 100 + 5);
		},
		calculateMaxStat(stat) {
			if (stat.stat.name === "hp") {
				return Math.floor(
					((2 * stat.base_stat + 31 + 252 / 4) * 100) / 100 + 100 + 10,
				);
			}
			return Math.floor(((2 * stat.base_stat + 31 + 252 / 4) * 100) / 100 + 5);
		},
	},
	computed: {
		totalStats() {
			return (
				this.pokemon?.stats?.reduce(
					(total, stat) => total + stat.base_stat,
					0,
				) || 0
			);
		},
		maxStat() {
			return 255;
		},
	},
};
</script>