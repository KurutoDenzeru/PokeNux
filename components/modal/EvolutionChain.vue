<template>
  <div class="mt-8">
    <h3 class="font-bold mb-4 text-start">Evolution Chain:</h3>
    <div class="flex flex-wrap justify-center gap-8">
      <template v-for="(evolution, index) in evolutionChain" :key="evolution.id">
        <!-- Base Form -->
        <div class="flex flex-col items-center justify-center">
          <img :src="evolution.sprite"
               :alt="evolution.name"
               class="w-48 h-48 mb-2 cursor-pointer hover:scale-110 transition-transform" 
               @click="handleEvolutionClick(evolution)" />
          <span class="capitalize font-medium">{{ evolution.name }}</span>
          <div class="flex flex-wrap justify-center gap-1 mt-1">
            <span v-for="type in evolution.types"
                  :key="type"
                  :class="['px-3 py-1 rounded-lg capitalize text-white font-semibold shadow-sm text-sm relative group inline-block cursor-pointer', typeColorClass(type)]">
              {{ getEmojiForType(type) }}
              <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap">
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </div>
            </span>
          </div>

          <!-- Evolution Requirements -->
          <div v-if="evolution.requirements.length" class="mt-2 text-center">
            <ul class="space-y-1">
              <li v-for="(req, reqIndex) in evolution.requirements"
                  :key="reqIndex" 
                  class="text-sm text-gray-600 flex items-center justify-center gap-2 p-1">
                <!-- Level Up Requirement -->
                <template v-if="req.type === 'level'">
                  <div class="flex items-center gap-2 relative group">
                    <span class="font-medium">Level {{ req.value }}</span>
                    <img :src="req.sprite"
                         alt="Rare Candy"
                         class="w-auto h-auto cursor-pointer"
                         @error="handleImageError" />
                    <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap">
                      Level Up with Rare Candy
                    </div>
                  </div>
                </template>
                <template v-if="req.type === 'friendship'">
                  <div class="flex items-center gap-2 relative group">
                    <span class="font-medium">{{ req.display }}</span>
                    <img :src="req.sprite"
                         alt="Soothe Bell"
                         class="w-auto h-auto cursor-pointer"
                         @error="handleImageError" />
                    <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap">
                      Raise friendship with Soothe Bell
                    </div>
                  </div>
                </template>

                <template v-else-if="req.type === 'location' || req.type === 'time'">
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ req.display }}</span>
                  </div>
                </template>
                <!-- Other Requirements -->
                <template v-else-if="req.type === 'item' || req.type === 'held-item'">
                  <div class="flex items-center gap-2 relative group">
                    <span>{{ formatRequirement(req) }}</span>
                    <span>{{ req.display }}</span>
                    <img :src="req.sprite"
                         :alt="req.value"
                         class="w-auto h-auto cursor-pointer"
                         @error="handleImageError"
                         loading="lazy" />
                    <div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap">
                      {{ formatItemName(req.value) }}
                    </div>
                  </div>
                </template>
              </li>
            </ul>
          </div>

          <!-- Alternative Forms -->
          <div v-if="evolution.varieties?.length" class="mt-4">
            <h4 class="text-sm font-medium mb-2">Alternative Forms:</h4>
            <div class="flex flex-wrap gap-2 justify-center">
              <div v-for="variety in evolution.varieties"
                   :key="variety.id"
                   class="flex flex-col items-center">
                <img :src="variety.sprite"
                     :alt="variety.name"
                     class="w-28 h-28 cursor-pointer hover:scale-110 transition-transform"
                     @click="handleVarietyClick(variety)" />
                <span class="text-xs capitalize">
                  {{ formatVarietyName(variety.name) }}
                </span>
                <div v-if="variety.requirement"
                     class="flex items-center gap-2 mt-1">
                  <span class="text-xs">{{ variety.requirement.display }}</span>
                  <img v-if="variety.requirement.sprite"
                       :src="variety.requirement.sprite"
                       :alt="variety.requirement.name"
                       class="w-auto h-auto pixelated"
                       @error="handleImageError" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Evolution Arrow -->
        <div v-if="index < evolutionChain.length - 1"
             class="flex items-center justify-center evolution-arrow">
          <span class="hidden md:block text-2xl">→</span>
          <span class="block md:hidden text-2xl">↓</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
	name: "EvolutionChain",
	emits: ["evolution-click", "variety-click"],
	props: {
		evolutionChain: {
			type: Array,
			required: true,
			default: () => [],
		},
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
		handleEvolutionClick(evolution) {
			this.$emit("evolution-click", evolution);
		},
		handleVarietyClick(variety) {
			this.$emit("variety-click", variety);
		},
		handleImageError(event) {
			event.target.style.display = "none";
		},
		formatRequirement(req) {
			switch (req.type) {
				case "level":
					return req.display;
				case "item":
					return "Use Item:";
				case "held-item":
					return "Hold Item:";
				case "location":
					return req.display;
				case "time":
					return req.display;
				case "friendship":
					return "With Soothe Bell:";
				default:
					return req.display;
			}
		},
		formatItemName(name) {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		formatVarietyName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
	},
};
</script>