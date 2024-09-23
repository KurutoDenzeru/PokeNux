<template>
<div class="flex flex-col items-center p-4">
    <!-- Search Input -->
    <input 
    v-model="searchQuery" 
    type="text" 
    placeholder="Search Pokémon" 
    class="border rounded-lg px-4 py-2 mb-4 w-full max-w-md"
    />

    <!-- Generation Filter -->
    <div class="flex space-x-4 mb-4">
    <label v-for="gen in generations" :key="gen" class="flex items-center">
        <input 
        type="checkbox" 
        :value="gen" 
        v-model="selectedGenerations" 
        class="mr-2"
        />
        {{ gen }}
    </label>
    </div>

    <!-- Element Type Filter -->
    <div class="flex flex-wrap gap-4 mb-4">
    <label v-for="type in elementTypes" :key="type" class="flex items-center">
        <input 
        type="checkbox" 
        :value="type" 
        v-model="selectedElementTypes" 
        class="mr-2"
        />
        {{ type }}
    </label>
    </div>

    <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded">Filter</button>
</div>
</template>

<script setup>
import { ref } from "vue";

const searchQuery = ref("");
const selectedGenerations = ref([]);
const selectedElementTypes = ref([]);

const generations = ["Generation 1", "Generation 2", "Generation 3"];
const elementTypes = ["Fire", "Water", "Grass", "Electric", "Ice", "Dragon"];

const applyFilters = () => {
	// Emit or use the filtered data in your Pokémon list
	console.log("Search Query:", searchQuery.value);
	console.log("Selected Generations:", selectedGenerations.value);
	console.log("Selected Element Types:", selectedElementTypes.value);
};
</script>
