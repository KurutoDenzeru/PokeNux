<template>
  <div class="filters">
    <!-- Search Bar -->
    <input
      :value="searchQuery"
      @input="$emit('update:searchQuery', $event.target.value)"
      type="text"
      placeholder="Search Pokémon"
      class="border rounded-lg px-4 py-2 mb-4 w-full max-w-md"
    />

    <!-- Generation Filter -->
    <div class="flex flex-wrap justify-center gap-4 mb-4">
      <label v-for="gen in generations" :key="gen" class="flex items-center space-x-2 bg-gray-100 p-2 rounded-md shadow-sm cursor-pointer">
        <input type="checkbox" :value="gen" :checked="selectedGenerations.includes(gen)" @change="toggleGeneration(gen)" class="form-checkbox h-5 w-5 text-blue-500 rounded" />
        <span>{{ gen }}</span>
      </label>
    </div>

    <!-- Type Filter with Pill Design -->
    <div class="flex flex-wrap justify-center gap-4 mb-4">
      <label v-for="type in elementTypes" :key="type" class="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" :value="type" :checked="selectedElementTypes.includes(type)" @change="toggleElementType(type)" class="hidden" />
        <span :class="['px-4 py-1 rounded-full text-white font-semibold', typeColorClass(type)]">{{ type }}</span>
      </label>
    </div>

    <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">Filter</button>
  </div>
</template>

<script>
export default {
	props: {
		searchQuery: String,
		selectedGenerations: Array,
		selectedElementTypes: Array,
		generations: Array,
		elementTypes: Array,
	},
	emits: [
		"update:searchQuery",
		"update:selectedGenerations",
		"update:selectedElementTypes",
		"applyFilters",
	],
	methods: {
		toggleGeneration(gen) {
			const newGenerations = [...this.selectedGenerations];
			const index = newGenerations.indexOf(gen);
			if (index >= 0) {
				newGenerations.splice(index, 1); // Remove if already selected
			} else {
				newGenerations.push(gen); // Add if not selected
			}
			this.$emit("update:selectedGenerations", newGenerations);
		},
		toggleElementType(type) {
			const newElementTypes = [...this.selectedElementTypes];
			const index = newElementTypes.indexOf(type);
			if (index >= 0) {
				newElementTypes.splice(index, 1); // Remove if already selected
			} else {
				newElementTypes.push(type); // Add if not selected
			}
			this.$emit("update:selectedElementTypes", newElementTypes);
		},
		applyFilters() {
			this.$emit("applyFilters");
		},
		typeColorClass(type) {
			switch (type) {
				case "Fire":
					return "bg-red-500";
				case "Water":
					return "bg-blue-500";
				case "Grass":
					return "bg-green-500";
				case "Electric":
					return "bg-yellow-500";
				case "Ice":
					return "bg-teal-400";
				case "Fighting":
					return "bg-orange-500";
				case "Poison":
					return "bg-purple-600";
				case "Ground":
					return "bg-yellow-800";
				case "Flying":
					return "bg-blue-300";
				case "Psychic":
					return "bg-pink-500";
				case "Bug":
					return "bg-green-700";
				case "Rock":
					return "bg-gray-600";
				case "Dragon":
					return "bg-indigo-500";
				case "Ghost":
					return "bg-indigo-800";
				case "Dark":
					return "bg-gray-800";
				case "Steel":
					return "bg-gray-500";
				case "Fairy":
					return "bg-pink-300";
				default:
					return "bg-gray-400";
			}
		},
	},
};
</script>
