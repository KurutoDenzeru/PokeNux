<template>
  <div
    class="border border-4 bg-slate-300 rounded-xl shadow-sm p-4 text-center cursor-pointer"
    @click="openModal(pokemon)"
  >
    <p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
    <img :src="pokemon.sprite" :alt="pokemon.name" class="w-24 h-24 mx-auto mb-2"/>
    <p class="capitalize">{{ pokemon.name }}</p>
    <div class="flex justify-center space-x-2 mt-2">
      <span v-for="type in pokemon.types" :key="type" :class="['px-3 py-1 rounded-full text-white text-xs', typeColorClass(type)]">
        {{ type }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
	props: {
		pokemon: Object,
	},
	methods: {
		openModal(pokemon) {
			this.$emit("openModal", pokemon);
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
