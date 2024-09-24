<template>
  <div v-if="pokemon" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center">
    <div class="bg-white border-4 border shadow-sm p-8 rounded-xl max-w-lg w-full relative">
      <button @click="closeModal" class="absolute top-2 right-2 text-gray-500 p-2">X</button>
      <h2 class="text-xl font-bold mb-4 capitalize">{{ pokemon.name }}</h2>
      <img :src="pokemon.sprite" :alt="pokemon.name" class="w-28 h-28 mx-auto mb-4" />

      <!-- Pokemon Details -->
      <p><strong>Origin:</strong> {{ pokemon.origin }}</p>
      <p><strong>Evolution Chain:</strong> {{ pokemon.evolutionChain }}</p>
      <p><strong>Gender Ratio:</strong> {{ pokemon.genderRatio }}</p>
      <p><strong>Weight:</strong> {{ pokemon.weight }} kg</p>

      <!-- Stats -->
      <h3 class="mt-4 mb-2 font-semibold">Stats:</h3>
      <ul>
        <li v-for="stat in pokemon.stats" :key="stat.name">
          <strong>{{ stat.name }}:</strong> {{ stat.base_stat }}
        </li>
      </ul>

      <!-- Abilities -->
      <h3 class="mt-4 mb-2 font-semibold">Abilities:</h3>
      <ul>
        <li v-for="ability in pokemon.abilities" :key="ability.name">
          {{ ability.name }} <span v-if="ability.is_hidden">(Hidden)</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
	props: {
		pokemon: Object,
	},
	emits: ["close"],
	methods: {
		closeModal() {
			this.$emit("close");
		},
	},
};
</script>
