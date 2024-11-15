<template>
    <div class="relative" lang="en">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>
        </div>
        <div class="p-6 w-full h-full mx-auto max-w-screen-xl">
            <!-- Search and Filter Section -->
            <div class="flex flex-col items-center pt-16">
                <div class="py-12">
                    <a href="pokenuxt.nuxt.dev" class="lg:text-9xl md:text-8xl sm:text-9xl xs:text-8xl text-7xl font-bold bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">
                        PokeNuxt
                    </a>
                </div>
                <input v-model="searchQuery" type="text" placeholder="Search Pokémon"
                    class="g-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 max-w-md" />

                <div class="py-6 text-left w-full">
                    <h1 class="text-2xl font-semibold text-left w-full">Types:</h1>
                </div>

                <!-- Element Type Filter with Pill Design -->
				<div class="flex flex-wrap justify-center gap-4 mb-4">
					<label v-for="(type, index) in elementTypes" :key="type" class="flex items-center cursor-pointer"
						:class="{
							'w-full flex justify-center': index >= 18,
							'w-auto': index < 18,
						}">
						<input type="radio" :value="type" v-model="selectedElementType" class="hidden" @change="filterByType" />
						<span :class="['px-4 py-1 rounded-lg text-white text-md font-semibold', typeColorClass(type)]">
							{{ getEmojiForType(type) }} {{ type }}
						</span>
					</label>
				</div>

                <hr class="my-4 h-px p-1 w-full border-t-0 bg-transparent bg-gradient-to-r from-transparent via-emerald-900 to-transparent opacity-25 dark:via-neutral-400" />

                <div class="py-6 text-left w-full">
                    <h1 class="text-2xl font-semibold text-left w-full">
  Select your Pokémon ({{ filteredAndSortedPokemon.length }} of {{ totalPokemon }}):
</h1>
                </div>

                <!-- Generation and Sorting Filters -->
                <div class="flex text-left flex-wrap w-full gap-4 mb-4">
                    <div class="flex items-center">
                        <label for="generation-filter" class="mr-2 font-semibold">Game Generation:</label>
                        <select id="generation-filter" v-model="selectedGeneration" class="border rounded-lg px-4 py-2">
                            <option value="All">All</option>
                            <option v-for="gen in generations" :key="gen" :value="gen">{{ gen }}</option>
                        </select>
                    </div>
                    <div class="flex items-center">
                        <label for="sort-filter" class="mr-2 font-semibold">Sort Pokémon:</label>
                        <select id="sort-filter" v-model="sortOption" class="border rounded-lg px-4 py-2">
                            <option value="number">Number</option>
                            <option value="name">Name</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Pokémon List Pagination -->
            <div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-6">
				<div v-for="pokemon in paginatedPokemon" :key="pokemon.id"
					@click="openModal(pokemon)"
					@mousemove="handleMouseMove"
					@mouseleave="handleMouseLeave"
					:class="['pokemon-card bg-white border-2 border-gray-200 rounded-2xl shadow p-4 text-center cursor-pointer transition-transform duration-300', (pokemon.types[0])]">
					<p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
					<img :src="pokemon.sprite" :alt="pokemon.name" class="w-28 h-28 mx-auto mb-2" />
					<p class="capitalize">{{ pokemon.name }}</p>
					<!-- Updated type badges container -->
					<div class="flex flex-row flex-nowrap justify-center gap-1 mt-2">
						<span v-for="type in pokemon.types" :key="type"
							:class="['inline-flex items-center px-2 py-1 rounded-lg capitalize text-white text-xs lg:text-sm whitespace-nowrap', typeColorClass(type)]">
							{{ getEmojiForType(type) }} {{ type }}
						</span>
					</div>
				</div>
			</div>

            <!-- Pagination Controls -->
			<div class="my-6 flex justify-end">
				<a @click="prevPage" class="flex items-center justify-center px-4 h-10 me-3 text-base font-medium cursor-pointer text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700" :disabled="page === 1">
					<svg class="w-3.5 h-3.5 me-2 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 14 10">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5H1m0 0 4 4M1 5l4-4"/>
					</svg>
					Previous
				</a>
				<a @click="nextPage" class="flex items-center justify-center px-4 h-10 text-base font-medium text-gray-500 cursor-pointer bg-white border border-gray-300 rounded-lg hover:bg-gray-100 hover:text-gray-700" :disabled="page === totalPages">
					Next
					<svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" fill="none" viewBox="0 0 14 10">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
					</svg>
				</a>
			</div>

            <!-- Modal for Pokémon Details -->
            <transition name="fade">
				<div v-if="selectedPokemon" class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center backdrop-blur-md z-50" @click.self="closeModal">
					<div class="bg-white shadow-sm rounded-xl max-w-4xl w-full relative m-6 max-h-[90vh] flex flex-col" @click.stop>
					<!-- Modal Header - Sticky -->
					<div class="sticky top-0 rounded-t-xl  bg-white z-10 px-6 md:px-8 py-4 border-b">
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<span class="text-gray-600 font-semibold text-xl">#{{ String(selectedPokemon.id).padStart(4, '0') }}</span>
							<h2 class="text-xl font-semibold text-gray-900 capitalize">{{ selectedPokemon.name }}</h2>
							</div>
							<button @click="closeModal" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center">
								<svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
								</svg>
								<span class="sr-only">Close modal</span>
							</button>
						</div>
					</div>

					<!-- Scrollable Content Area -->
					<div class="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-emerald-600 scrollbar-track-gray-200">
						<div class="px-6 md:px-8 py-4 space-y-4">
						<div class="flex flex-col items-center gap-4">
						<!-- Artwork -->
						<img
							:src="selectedPokemon.currentSprite || selectedPokemon.sprite"
							:alt="selectedPokemon.name"
							class="w-auto h-auto mx-auto p-6 drop-shadow-sm animate-bounce"
						/>

							<!-- Controls Section -->
							<div class="flex flex-col md:flex-row md:justify-between items-center w-full mb-4 gap-4">
								<!-- Normal/Shiny Toggle -->
								<div class="inline-flex rounded-md shadow-sm" role="group">
									<button
									@click="toggleSprite('normal')"
									type="button"
									:class="[
										'px-4 py-2 text-sm font-medium border rounded-s-lg focus:z-10 focus:ring-2',
										isNormalSprite ?
										'text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700' :
										'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
									]"
									>
									Normal
									</button>
									<button
									@click="toggleSprite('shiny')"
									type="button"
									:class="[
										'px-4 py-2 text-sm font-medium border rounded-e-lg focus:z-10 focus:ring-2',
										!isNormalSprite ?
										'text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700' :
										'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
									]"
									>
									Shiny
									</button>
								</div>

								<!-- Cry Buttons -->
								<div class="inline-flex rounded-md shadow-sm" role="group">
									<button
									@click="playCry('legacy')"
									type="button"
									:class="[
										'px-4 py-2 text-sm font-medium border rounded-s-lg focus:z-10 focus:ring-2',
										'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
									]"
									:disabled="!selectedPokemon?.cries?.legacy"
									>
									<span class="flex items-center gap-2">
										<span v-if="isPlayingLegacy" class="animate-pulse">🔊</span>
										Legacy Cry
									</span>
									</button>
									<button
									@click="playCry('latest')"
									type="button"
									:class="[
										'px-4 py-2 text-sm font-medium border rounded-e-lg focus:z-10 focus:ring-2',
										'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
									]"
									:disabled="!selectedPokemon?.cries?.latest"
									>
									<span class="flex items-center gap-2">
										<span v-if="isPlayingLatest" class="animate-pulse">🔊</span>
										Latest Cry
									</span>
									</button>
								</div>
							</div>
						</div>

						<div class="bg-white p-4 mb-4">
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
										<td class="py-3 px-4 w-1/3"><strong>Pokédex No:</strong></td>
										<td class="py-3 px-4">
										# {{ String(selectedPokemon.id).padStart(4, '0') }}
										</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Generation:</strong></td>
										<td class="py-3 px-4">{{ selectedPokemon.generation }}</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Category:</strong></td>
										<td class="py-3 px-4">{{ selectedPokemon.genus || 'Unknown' }}</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Shape:</strong></td>
										<td class="py-3 px-4 capitalize">
										{{ selectedPokemon.shape || 'Unknown' }}
										</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Color:</strong></td>
										<td class="py-3 px-4 capitalize">
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
										<td class="py-3 px-4 w-1/3"><strong>Type:</strong></td>
										<td class="py-3 px-4">
										<div class="flex flex-wrap gap-2">
											<span
											v-for="type in selectedPokemon.types"
											:key="type"
											:class="[
												'px-3 py-1 rounded-lg capitalize text-white font-semibold shadow-sm text-sm',
												typeColorClass(type)
											]"
											>
											{{ getEmojiForType(type) }} {{ type }}
											</span>
										</div>
										</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Weight:</strong></td>
										<td class="py-3 px-4">
										{{ selectedPokemon.weight }} kg
										({{ (selectedPokemon.weight * 2.20462).toFixed(1) }} lbs)
										</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Height:</strong></td>
										<td class="py-3 px-4">
										{{ formatHeight(selectedPokemon.height) }}
										</td>
									</tr>
									<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4"><strong>Abilities:</strong></td>
										<td class="py-3 px-4">
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

							<!-- Breeding Section -->
							<div class="mt-4">
							<h3 class="font-bold mb-2">Breeding:</h3>
							<div class="bg-white">
								<table class="w-full table-fixed">
									<tbody class="divide-y divide-gray-100">
										<tr class="hover:bg-gray-50 transition-colors">
										<td class="py-3 px-4 w-1/3"><strong>Gender Ratio:</strong></td>
											<td class="py-3 px-4">
												<div class="flex items-center gap-2">
												<template v-if="selectedPokemon.breeding.genderRate === -1">
													<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-purple-500 hover:bg-purple-600 transition-colors">
													<span class="flex items-center gap-1">
														<span>⚥</span> Genderless
													</span>
													</button>
												</template>
												<template v-else>
													<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors">
													<span class="flex items-center gap-1">
														<span>♂</span> {{ calculateGenderRatio(selectedPokemon.breeding.genderRate)[0] }}%
													</span>
													</button>
													<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-pink-500 hover:bg-pink-600 transition-colors">
													<span class="flex items-center gap-1">
														<span>♀</span> {{ calculateGenderRatio(selectedPokemon.breeding.genderRate)[1] }}%
													</span>
													</button>
												</template>
												</div>
											</td>
										</tr>
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3 px-4"><strong>Growth Rate:</strong></td>
											<td class="py-3 px-4 capitalize">
												{{ selectedPokemon.breeding.growthRate.replace(/-/g, ' ') }}
											</td>
										</tr>
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3 px-4"><strong>Egg Cycles:</strong></td>
												<td class="py-3 px-4">
													{{ selectedPokemon.breeding.hatchCounter }}
													({{ formatNumber(selectedPokemon.breeding.hatchCounter * 255) }} steps)
												</td>
										</tr>
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3 px-4"><strong>Baby Trigger Item:</strong></td>
												<td class="py-3 px-4 capitalize">
													<div v-if="selectedPokemon.breeding.babyTriggerItem" class="flex items-center gap-2">
													<span>{{ formatItemName(selectedPokemon.breeding.babyTriggerItem) }}</span>
													<img 
														:src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${selectedPokemon.breeding.babyTriggerItem.replace(/-/g, '')}.png`"
														:alt="selectedPokemon.breeding.babyTriggerItem"
														class="w-6 h-6"
														@error="handleImageError"
													/>
													</div>
													<span v-else>None</span>
												</td>
										</tr>
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3 px-4"><strong>Habitat:</strong></td>
											<td class="py-3 px-4 capitalize">
												{{ selectedPokemon.breeding.habitat }}
											</td>
										</tr>
										<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3 px-4"><strong>Egg Groups:</strong></td>
											<td class="py-3 px-4">
												<div class="flex flex-wrap gap-2">
												<button 
													v-for="group in selectedPokemon.breeding.eggGroups" 
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

						<!-- Base Stats -->
						<div>
							<h3 class="font-bold mb-2">Base Stats:</h3>
							<ul>
								<li v-for="stat in selectedPokemon.stats" :key="stat.stat.name" class="mb-2 px-4">
									<div class="grid grid-cols-12 gap-4 items-center">
									<!-- Stat Name -->
									<div class="col-span-3">
										<span class="text-base font-medium text-gray-700">
										{{
											stat.stat.name === 'hp' ? 'HP' :
											stat.stat.name === 'attack' ? 'Attack' :
											stat.stat.name === 'defense' ? 'Defense' :
											stat.stat.name === 'special-attack' ? 'Sp. Attack' :
											stat.stat.name === 'special-defense' ? 'Sp. Defense' :
											'Speed'
										}}
										</span>
									</div>

									<!-- Progress Bar -->
									<div class="col-span-6">
										<div class="flex justify-between mb-1">
											<span class="text-sm font-medium text-emerald-700">{{ stat.base_stat }}</span>
										</div>
										<div class="w-full bg-gray-200 rounded-full h-2.5">
											<div class="bg-emerald-600 h-2.5 rounded-full"
												:style="{ width: (stat.base_stat / maxStat * 100) + '%' }">
											</div>
										</div>
									</div>

										<!-- Min/Max Values -->
										<div class="col-span-3 grid grid-cols-2 gap-2 text-md font-medium justify-items-center">
											<div class="text-gray-500">{{ calculateMinStat(stat) }}</div>
											<div class="text-gray-500 text-right">{{ calculateMaxStat(stat) }}</div>
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
								<div class="col-span-3 grid grid-cols-2 gap-2 text-md font-semibold justify-items-center">
									<div>Min</div>
									<div>Max</div>
								</div>
							</div>

							<!-- Evolution Chain -->
							<div class="mt-8">
								<h3 class="font-bold mb-4 text-center">Evolution Chain:</h3>
								<div class="flex flex-wrap justify-center gap-8">
									<template v-for="(evolution, index) in evolutionChain" :key="evolution.id">
										<!-- Pokémon Artwork and Name -->
										<div class="flex flex-col items-center">
											<img :src="evolution.sprite" :alt="evolution.name" class="w-48 h-48 mb-2 cursor-pointer hover:scale-110 transition-transform" 
        @click="handleEvolutionClick(evolution)" />
											<span class="capitalize font-medium">{{ evolution.name }}</span>
											<!-- Evolution Requirements -->
											<div v-if="evolution.requirements.length" class="mt-2 text-center">
												<ul class="space-y-1">
													<li v-for="(req, reqIndex) in evolution.requirements" 
														:key="reqIndex" 
														class="text-sm text-gray-600 flex items-center justify-center gap-2 p-1">
														<span>{{ formatRequirement(req) }}</span>
														<template v-if="shouldShowItemSprite(req)">
															<img 
																:src="getItemSprite(req)"
																:alt="getItemName(req)"
																class="w-8 h-8"
																@error="handleImageError"
																loading="lazy"
															/>
														</template>
													</li>
												</ul>
											</div>
										</div>

										<!-- Evolution Arrow -->
										<div v-if="index < evolutionChain.length - 1"
											class="flex items-center justify-center evolution-arrow">
											<!-- Desktop arrow (horizontal) -->
											<span class="hidden md:block text-2xl">→</span>
											<!-- Mobile arrow (vertical) -->
											<span class="block md:hidden text-2xl">↓</span>
										</div>
									</template>
								</div>
							</div>

						</div>

					</div>
					</div>
				</div>
            </transition>

            <footer class="bg-white border border-gray-300 rounded-lg shadow-md m-4 mx-auto">
                <div class="w-full max-w-screen-xl mx-auto p-6 md:py-8">
                    <div class="sm:flex sm:items-center sm:justify-between">
                        <a href="https://pokenuxt.nuxt.dev/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
                            <img src="/public/rotom.avif" class="h-12" alt="PokeNuxt Logo" />
                            <span class="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">PokeNuxt</span>
                        </a>
                        <ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 ">
                            <li>
								<a href="https://pokenuxt.nuxt.dev/" class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
								<span class="self-center text-2xl font-semibold whitespace-nowrap ">Powered by</span>
								<img src="/public/pokeapi.avif" class="h-8" alt="PokeNuxt Logo" />
								</a>
                            </li>
                        </ul>
                    </div>
                    <hr class="my-6 border-gray-300 sm:my-8" />
                    <span class="block text-sm text-gray-500 sm:text-center">© 2024 <a href="https://github.com/KurutoDenzeru/PokeNuxt" class="hover:underline">PokeNuxt</a> by KurutoDenzeru. All Rights Reserved.</span>
                </div>
            </footer>

        </div>
    </div>
</template>

<script>
import axios from "axios";
import { computed, ref, watch } from "vue";

export default {
	setup() {
		// SEO and Meta
		useHead({
			title: "PokeNuxt",
			meta: [
				{
					name: "description",
					content:
						"Sleek Pokédex with detailed Pokémon info, built with Nuxt.js, Tailwind CSS, and PokéAPI.",
				},
			],
			link: [
				{
					rel: "icon",
					type: "image/x-icon",
					href: "/favicon.ico",
				},
			],
		});

		// Search & Filter
		const searchQuery = ref("");
		const selectedGeneration = ref("All");
		const selectedGenerations = ref([]);
		const selectedElementTypes = ref([]);
		const selectedElementType = ref("");
		const sortOption = ref("number");
		const generations = [
			"Generation 1",
			"Generation 2",
			"Generation 3",
			"Generation 4",
			"Generation 5",
			"Generation 6",
			"Generation 7",
			"Generation 8",
			"Generation 9",
		];

		const elementTypes = [
			"Normal",
			"Fire",
			"Water",
			"Grass",
			"Electric",
			"Ice",
			"Fighting",
			"Poison",
			"Ground",
			"Flying",
			"Psychic",
			"Bug",
			"Rock",
			"Dragon",
			"Ghost",
			"Dark",
			"Steel",
			"Fairy",
		];

		// Pokémon and pagination data
		const page = ref(1);
		const perPage = 24;
		const pokemonList = ref([]);
		const filteredPokemon = ref([]);
		const selectedPokemon = ref(null);

		const filteredAndSortedPokemon = computed(() => {
			let filtered = [...pokemonList.value];

			// 1. Apply Generation Filter
			if (selectedGeneration.value !== "All") {
				const genNumber = Number(selectedGeneration.value.split(" ")[1]);
				const genRanges = {
					1: [1, 151],
					2: [152, 251],
					3: [252, 386],
					4: [387, 493],
					5: [494, 649],
					6: [650, 721],
					7: [722, 809],
					8: [810, 898],
					9: [899, 1008],
					10: [1009, 1025],
				};
				const [min, max] = genRanges[genNumber] || [0, 0];
				filtered = filtered.filter(
					(pokemon) => pokemon.id >= min && pokemon.id <= max,
				);
			}

			// 2. Apply Element Type Filter
			if (selectedElementType.value) {
				filtered = filtered.filter((pokemon) =>
					pokemon.types.includes(selectedElementType.value.toLowerCase()),
				);
			}

			// 3. Apply Search Query
			if (searchQuery.value.trim()) {
				const query = searchQuery.value.toLowerCase().trim();
				filtered = filtered.filter((pokemon) =>
					pokemon.name.toLowerCase().includes(query),
				);
			}

			// 4. Apply Sorting
			if (sortOption.value === "name") {
				filtered.sort((a, b) => a.name.localeCompare(b.name));
			} else if (sortOption.value === "number") {
				filtered.sort((a, b) => a.id - b.id);
			}

			return filtered;
		});

		// Fetch Pokémon data
		const fetchPokemon = async () => {
			try {
				const response = await axios.get(
					"https://pokeapi.co/api/v2/pokemon?limit=1025",
				);
				pokemonList.value = response.data.results.map((pokemon, index) => ({
					id: index + 1,
					name: pokemon.name,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
						index + 1
					}.png`,
					url: pokemon.url,
					types: [],
					generation: "",
				}));

				// Fetch type and generation data for the initial page only
				await Promise.all(
					pokemonList.value.slice(0, perPage).map(async (pokemon) => {
						await fetchPokemonDetails(pokemon);
					}),
				);

				filteredPokemon.value = pokemonList.value;
			} catch (error) {
				console.error("Error fetching Pokémon data:", error);
			}
		};

		const isNormalSprite = ref(true);

		// Fetch detailed Pokémon information when modal is opened
		const fetchPokemonDetails = async (pokemon) => {
			try {
				// Basic Pokemon data fetch
				const detailsResponse = await axios.get(pokemon.url);
				const speciesResponse = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`,
				);

				// Update basic Pokemon data
				pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
				pokemon.shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;
				pokemon.cries = {
					latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`,
					legacy: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemon.id}.ogg`,
				};
				pokemon.currentSprite = pokemon.sprite;
				pokemon.types = detailsResponse.data.types.map((t) => t.type.name);
				pokemon.weight = detailsResponse.data.weight / 10;
				pokemon.height = detailsResponse.data.height;
				pokemon.stats = detailsResponse.data.stats;
				pokemon.cryUrl = detailsResponse.data.cries?.latest;

				// Extract genus (category)
				const englishGenus = speciesResponse.data.genera.find(
					(g) => g.language.name === "en",
				);
				pokemon.genus = englishGenus ? englishGenus.genus : "Unknown";

				// Extract generation from species data
				const generationName = speciesResponse.data.generation.name;
				const generationNum = generationName.split("-")[1];

				// Convert roman numeral to number if needed
				const romanToNum = {
					i: 1,
					ii: 2,
					iii: 3,
					iv: 4,
					v: 5,
					vi: 6,
					vii: 7,
					viii: 8,
					ix: 9,
				};

				const genNumber =
					romanToNum[generationNum] || Number.parseInt(generationNum);
				pokemon.generation = `Generation ${genNumber}`;

				// Get the most recent English flavor text
				const englishFlavorTexts =
					speciesResponse.data.flavor_text_entries.filter(
						(entry) => entry.language.name === "en",
					);

				// Get the most recent entry and clean up the text
				const flavorText =
					englishFlavorTexts[englishFlavorTexts.length - 1]?.flavor_text || "";
				pokemon.description = flavorText
					.replace(/\f/g, " ")
					.replace(/\n/g, " ")
					.replace(/POKéMON/g, "Pokémon");

				// Extract shape and color
				pokemon.shape = speciesResponse.data.shape?.name || "Unknown";
				pokemon.color = speciesResponse.data.color?.name || "Unknown";

				// Handle gender ratio
				const breedingData = {
					genderRate: speciesResponse.data.gender_rate,
					growthRate: speciesResponse.data.growth_rate.name,
					hatchCounter: speciesResponse.data.hatch_counter,
					isBaby: speciesResponse.data.is_baby,
					habitat: speciesResponse.data.habitat?.name || "Unknown",
					eggGroups: speciesResponse.data.egg_groups.map((group) => group.name),
				};

				if (speciesResponse.data.evolution_chain?.url) {
					// Fetch baby trigger item if exists
					const evolutionChainResponse = await axios.get(
						speciesResponse.data.evolution_chain.url,
					);
					breedingData.babyTriggerItem =
						evolutionChainResponse.data.baby_trigger_item?.name || null;
				}

				pokemon.breeding = breedingData;

				// Fetch abilities with descriptions
				const abilitiesPromises = detailsResponse.data.abilities.map(
					async (abilityData) => {
						const abilityDetails = await fetchAbilityDescription(
							abilityData.ability.url,
						);
						return {
							...abilityDetails,
							is_hidden: abilityData.is_hidden,
						};
					},
				);

				pokemon.abilities = await Promise.all(abilitiesPromises);
			} catch (error) {
				console.error(`Error fetching details for ${pokemon.name}:`, error);
				// Set fallback values if fetch fails
				pokemon.generation = "Unknown";
				pokemon.genus = "Unknown";
				pokemon.shape = "Unknown";
				pokemon.color = "Unknown";
			}
		};

		const toggleSprite = (type) => {
			if (!selectedPokemon.value) return;

			isNormalSprite.value = type === "normal";
			selectedPokemon.value.currentSprite =
				type === "normal"
					? selectedPokemon.value.sprite
					: selectedPokemon.value.shinySprite;
		};

		// Watcher for live search
		watch(searchQuery, (newQuery) => {
			if (newQuery) {
				filteredPokemon.value = pokemonList.value.filter((pokemon) =>
					pokemon.name.toLowerCase().includes(newQuery.toLowerCase()),
				);
			} else {
				filteredPokemon.value = pokemonList.value;
			}
		});

		const fetchAbilityDescription = async (abilityUrl) => {
			try {
				const response = await axios.get(abilityUrl);
				const englishEntry = response.data.effect_entries.find(
					(entry) => entry.language.name === "en",
				);
				return {
					name: response.data.name,
					description: englishEntry
						? englishEntry.short_effect
						: "No description available",
					apiUrl: abilityUrl,
				};
			} catch (error) {
				console.error(`Error fetching ability description: ${error}`);
				return {
					name: "unknown",
					description: "Failed to load ability description",
					apiUrl: abilityUrl,
				};
			}
		};

		watch(selectedGeneration, (newGeneration) => {
			if (newGeneration === "All") {
				selectedGenerations.value = [];
			} else {
				selectedGenerations.value = [newGeneration];
			}
		});

		// Watcher for generation filter
		watch(selectedGeneration, () => {
			applyFilters();
		});

		// Watcher for sort option
		watch(sortOption, () => {
			applyFilters();
		});

		// Update watchers
		watch(
			[selectedGeneration, selectedElementType, sortOption, searchQuery],
			() => {
				page.value = 1; // Reset to first page when filters change
			},
		);

		// Call fetchPokemonDetails when a new page is loaded or filters are applied
		watch(page, (newPage) => {
			const start = (newPage - 1) * perPage;
			const end = start + perPage;
			// biome-ignore lint/complexity/noForEach: <explanation>
			pokemonList.value.slice(start, end).forEach((pokemon) => {
				if (!pokemon.types.length) {
					// Check if details are already fetched
					fetchPokemonDetails(pokemon);
				}
			});
		});

		// Computed property for paginated Pokémon
		const paginatedPokemon = computed(() => {
			const start = (page.value - 1) * perPage;
			return filteredAndSortedPokemon.value.slice(start, start + perPage);
		});

		// Watcher to fetch types immediately for displayed Pokémon
		watch(paginatedPokemon, (newPaginatedPokemon) => {
			for (const pokemon of newPaginatedPokemon) {
				if (!pokemon.types.length) {
					fetchPokemonDetails(pokemon);
				}
			}
		});

		// Pagination controls
		const totalPages = computed(() =>
			Math.ceil(filteredAndSortedPokemon.value.length / perPage),
		);
		const nextPage = () => {
			if (page.value < totalPages.value) page.value++;
		};
		const prevPage = () => {
			if (page.value > 1) page.value--;
		};

		// Modal controls
		const openModal = async (pokemon) => {
			isNormalSprite.value = true; // Reset to normal sprite
			await fetchPokemonDetails(pokemon);
			selectedPokemon.value = pokemon;
			selectedPokemon.value.currentSprite = pokemon.sprite; // Set initial sprite
		};
		const closeModal = () => {
			selectedPokemon.value = null;
			this.saveModalState();
		};

		// Apply filters
		const applyFilters = () => {
			const filtered = pokemonList.value.filter((pokemon) => {
				const matchesGeneration =
					selectedGeneration.value === "All" ||
					selectedGenerations.value.some((gen) => {
						const genNumber = Number.parseInt(gen.split(" ")[1]);
						return (
							(genNumber === 1 && pokemon.id <= 151) ||
							(genNumber === 2 && pokemon.id >= 152 && pokemon.id <= 251) ||
							(genNumber === 3 && pokemon.id >= 252 && pokemon.id <= 386) ||
							(genNumber === 4 && pokemon.id >= 387 && pokemon.id <= 493) ||
							(genNumber === 5 && pokemon.id >= 494 && pokemon.id <= 649) ||
							(genNumber === 6 && pokemon.id >= 650 && pokemon.id <= 721) ||
							(genNumber === 7 && pokemon.id >= 722 && pokemon.id <= 809) ||
							(genNumber === 8 && pokemon.id >= 810 && pokemon.id <= 898) ||
							(genNumber === 9 && pokemon.id >= 899 && pokemon.id <= 1008) ||
							(genNumber === 10 && pokemon.id >= 1009 && pokemon.id <= 1025)
						);
					});

				const matchesType =
					selectedElementTypes.value.length === 0 ||
					pokemon.types.some((type) =>
						selectedElementTypes.value.includes(type),
					);

				return matchesGeneration && matchesType;
			});

			if (sortOption.value === "name") {
				filtered.sort((a, b) => a.name.localeCompare(b.name));
			} else if (sortOption.value === "number") {
				filtered.sort((a, b) => a.id - b.id);
			}

			filteredPokemon.value = filtered;
			page.value = 1;
		};

		// Filter Pokémon by type
		const filterByType = async () => {
			page.value = 1;
			const type = selectedElementType.value;
			if (type) {
				const response = await axios.get(
					`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`,
				);
				const pokemonOfType = response.data.pokemon.map((p) => p.pokemon.name);
				filteredPokemon.value = pokemonList.value.filter((pokemon) =>
					pokemonOfType.includes(pokemon.name),
				);
			} else {
				filteredPokemon.value = pokemonList.value;
			}
		};

		fetchPokemon();

		// Type color classes
		const typeColorClass = (type) => {
			switch (type.toLowerCase()) {
				case "fire":
					return "bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300";
				case "water":
					return "bg-blue-400 hover:bg-blue-500 focus:ring-4 focus:ring-blue-300";
				case "grass":
					return "bg-lime-500 hover:bg-lime-600 focus:ring-4 focus:ring-lime-300";
				case "electric":
					return "bg-yellow-500 hover:bg-yellow-600 focus:ring-4 focus:ring-yellow-300";
				case "ice":
					return "bg-teal-500 hover:bg-teal-600 focus:ring-4 focus:ring-teal-300";
				case "fighting":
					return "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300";
				case "poison":
					return "bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300";
				case "ground":
					return "bg-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:ring-yellow-300";
				case "flying":
					return "bg-violet-400 hover:bg-violet-500 focus:ring-4 focus:ring-violet-300";
				case "psychic":
					return "bg-pink-500 hover:bg-pink-600 focus:ring-4 focus:ring-pink-300";
				case "bug":
					return "bg-lime-600 hover:bg-lime-700 focus:ring-4 focus:ring-lime-300";
				case "rock":
					return "bg-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:ring-yellow-300";
				case "dragon":
					return "bg-indigo-500 hover:bg-indigo-600 focus:ring-4 focus:ring-indigo-300";
				case "ghost":
					return "bg-purple-500 hover:bg-purple-600 focus:ring-4 focus:ring-purple-300";
				case "dark":
					return "bg-gray-800 hover:bg-gray-900 focus:ring-4 focus:ring-gray-700";
				case "steel":
					return "bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300";
				case "fairy":
					return "bg-pink-400 hover:bg-pink-500 focus:ring-4 focus:ring-pink-300";
				default:
					return "bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:ring-gray-300";
			}
		};

		return {
			searchQuery,
			sortOption,
			selectedGeneration,
			selectedGenerations,
			selectedElementType,
			selectedElementTypes,
			filterByType,
			generations,
			elementTypes,
			paginatedPokemon,
			page,
			totalPages,
			nextPage,
			prevPage,
			openModal,
			closeModal,
			applyFilters,
			typeColorClass,
			selectedPokemon,
			isNormalSprite,
			toggleSprite,
			fetchAbilityDescription,
			filteredAndSortedPokemon,
		};
	},
	data() {
		return {
			totalPokemon: 0,
			evolutionChain: [],
			isPlayingLegacy: false,
			isPlayingLatest: false,
			audioCache: new Map(),
		};
	},
	mounted() {
		// Add event listeners
		document.addEventListener("keydown", this.handleEscKey);

		// Get total Pokemon count
		fetch("https://pokeapi.co/api/v2/pokemon?limit=1025")
			.then((response) => response.json())
			.then((data) => {
				this.totalPokemon = data.count;
			})
			.catch((error) => {
				console.error("Error fetching Pokémon data:", error);
			});

		// Check localStorage and restore modal if needed
		const savedState = localStorage.getItem("pokemonModalState");
		if (savedState) {
			this.restoreModalState();
		}
	},

	// Clean up event listener
	beforeUnmount() {
		document.removeEventListener("keydown", this.handleEscKey);
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
		handleMouseMove(event) {
			const card = event.currentTarget;
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;
			const centerX = rect.width / 2;
			const centerY = rect.height / 2;
			const deltaX = (x - centerX) / centerX;
			const deltaY = (y - centerY) / centerY;
			const angleX = deltaY * 25;
			const angleY = -deltaX * 25;
			card.style.transform = `rotateX(${angleX}deg) rotateY(${angleY}deg)`;
			card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 100, 0, 0.5), transparent)`;
			card.style.border = `radial-gradient(circle at ${x}px ${y}px, rgba(0, 100, 0, 1), transparent) 1`;
			card.style.borderRadius = "1rem";
		},
		handleMouseLeave(event) {
			const card = event.currentTarget;
			card.style.transform = "rotateX(0) rotateY(0)";
			card.style.background = "";
			card.style.border = "";
			card.style.borderRadius = "";
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
		formatHeight(height) {
			const heightInMeters = height / 10;
			const totalInches = heightInMeters * 39.3701;
			const feet = Math.floor(totalInches / 12);
			const inches = Math.round(totalInches % 12);
			return `${heightInMeters.toFixed(1)}m (${feet}'${inches}")`;
		},
		formatAbilityName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		formatNumber(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		},
		formatItemName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		formatRequirement(req) {
			// Remove the item name if it's an item requirement
			return req.includes("Use Item:") ? "Use Item" : req;
		},
		shouldShowItemSprite(req) {
			return (
				req.includes("Use Item:") ||
				req.includes("Holding:") ||
				req.toLowerCase().includes("stone")
			);
		},
		getItemName(req) {
			const itemMatch = req.match(/(Use Item:|Holding:)\s+(.+)/);
			return itemMatch ? itemMatch[2].toLowerCase().trim() : "";
		},
		getItemSprite(req) {
			const itemName = this.getItemName(req);
			if (!itemName) return "";

			const formattedName = itemName
				.replace(/\s+/g, "-")
				.replace(/[.']/g, "")
				.toLowerCase();

			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${formattedName}.png`;
		},
		handleImageError(event) {
			event.target.style.display = "none";
		},
		handleEscKey(e) {
			if (e.key === "Escape" && this.selectedPokemon) {
				this.closeModal();
			}
		},
		calculateGenderRatio(genderRate) {
			if (genderRate === -1) return [0, 0];
			const femalePercentage = (genderRate / 8) * 100;
			return [100 - femalePercentage, femalePercentage];
		},

		formatEggGroup(group) {
			return group
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		closeModal() {
			this.selectedPokemon = null;
			this.evolutionChain = [];
			// Clear the modal state from localStorage
			localStorage.removeItem("pokemonModalState");
		},
		async handleEvolutionClick(evolution) {
			// Create a new Pokemon object with the evolution data
			const pokemon = {
				id: evolution.id,
				name: evolution.name,
				sprite: evolution.sprite,
				url: `https://pokeapi.co/api/v2/pokemon/${evolution.id}`,
			};

			// Close current modal
			this.selectedPokemon = null;
			this.evolutionChain = [];

			// Open new modal with the selected evolution
			await this.openModal(pokemon);
		},
		async playCry(type) {
			if (!this.selectedPokemon?.cries?.[type]) return;

			try {
				// Set playing state
				if (type === "legacy") {
					this.isPlayingLegacy = true;
				} else {
					this.isPlayingLatest = true;
				}

				// Get or create audio instance
				let audio = this.audioCache.get(`${this.selectedPokemon.id}-${type}`);

				if (!audio) {
					audio = new Audio(this.selectedPokemon.cries[type]);
					this.audioCache.set(`${this.selectedPokemon.id}-${type}`, audio);
				}

				// Reset audio if it was playing
				audio.currentTime = 0;

				// Play audio and handle completion
				await audio.play();

				audio.onended = () => {
					if (type === "legacy") {
						this.isPlayingLegacy = false;
					} else {
						this.isPlayingLatest = false;
					}
				};
			} catch (error) {
				console.error(`Error playing ${type} cry:`, error);
				// Reset playing state on error
				if (type === "legacy") {
					this.isPlayingLegacy = false;
				} else {
					this.isPlayingLatest = false;
				}
			}
		},
		saveModalState() {
			if (this.selectedPokemon) {
				const state = {
					pokemonId: this.selectedPokemon.id,
					isNormalSprite: this.isNormalSprite,
				};
				localStorage.setItem("pokemonModalState", JSON.stringify(state));
			} else {
				localStorage.removeItem("pokemonModalState");
			}
		},
		async restoreModalState() {
			const savedState = localStorage.getItem("pokemonModalState");
			if (!savedState) return;

			try {
				const { pokemonId, isNormalSprite } = JSON.parse(savedState);

				// Fetch pokemon details
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
				);

				if (response.data) {
					const pokemon = {
						id: response.data.id,
						name: response.data.name,
						sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
						shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemonId}.png`,
						url: `https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
						types: response.data.types.map((t) => t.type.name),
						stats: response.data.stats,
						weight: response.data.weight / 10,
						height: response.data.height,
					};

					// Set sprite based on saved state
					pokemon.currentSprite = isNormalSprite
						? pokemon.sprite
						: pokemon.shinySprite;

					// Update isNormalSprite
					this.isNormalSprite = isNormalSprite;

					// Open modal with the pokemon data
					await this.openModal(pokemon);
				}
			} catch (error) {
				console.error("Error restoring modal state:", error);
				localStorage.removeItem("pokemonModalState");
			}
		},

		async fetchAbilityDescription(abilityUrl) {
			try {
				const response = await axios.get(abilityUrl);
				const englishEntry = response.data.effect_entries.find(
					(entry) => entry.language.name === "en",
				);
				return {
					name: response.data.name,
					description: englishEntry
						? englishEntry.short_effect
						: "No description available",
					apiUrl: abilityUrl,
				};
			} catch (error) {
				console.error(`Error fetching ability description: ${error}`);
				return {
					name: "unknown",
					description: "Failed to load ability description",
					apiUrl: abilityUrl,
				};
			}
		},

		async fetchEvolutionChain(pokemonId) {
			try {
				// Use ID instead of name for species endpoint
				const speciesResponse = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
				);

				// Check if evolution chain exists
				if (!speciesResponse.data.evolution_chain?.url) {
					console.log("No evolution chain available for this Pokémon");
					this.evolutionChain = [
						{
							id: this.selectedPokemon.id,
							name: this.selectedPokemon.name,
							sprite: this.selectedPokemon.sprite,
							requirements: ["Base Form"],
						},
					];
					return;
				}

				const evolutionResponse = await axios.get(
					speciesResponse.data.evolution_chain.url,
				);
				const chain = evolutionResponse.data.chain;

				const evoChain = [];
				await this.parseEvolutionChain(chain, evoChain);
				this.evolutionChain = evoChain;
			} catch (error) {
				console.error("Error fetching evolution chain:", error);
				// Set fallback data if fetch fails
				this.evolutionChain = [
					{
						id: this.selectedPokemon.id,
						name: this.selectedPokemon.name,
						sprite: this.selectedPokemon.sprite,
						requirements: ["Evolution data unavailable"],
					},
				];
			}
		},

		async parseEvolutionChain(node, evoChain) {
			const speciesName = node.species.name;
			const speciesUrl = node.species.url;

			// Get species ID from URL
			const speciesId = speciesUrl.split("/").filter(Boolean).pop();

			const speciesDataResponse = await axios.get(
				`https://pokeapi.co/api/v2/pokemon/${speciesId}`,
			);
			const sprite =
				speciesDataResponse.data.sprites.other["official-artwork"]
					.front_default;

			const evoDetails = node.evolution_details[0];
			const requirements = [];

			if (evoDetails) {
				if (evoDetails.min_level) {
					requirements.push(`Level ${evoDetails.min_level}+`);
				}
				if (evoDetails.item) {
					requirements.push(
						`Use Item: ${this.capitalize(evoDetails.item.name)}`,
					);
				}
				if (evoDetails.min_happiness) {
					requirements.push("High Friendship");
					if (evoDetails.held_item) {
						requirements.push(
							`Holding: ${this.capitalize(evoDetails.held_item.name)}`,
						);
					}
				}
				if (evoDetails.min_affection) {
					requirements.push(`Min Affection: ${evoDetails.min_affection}`);
				}
				if (evoDetails.time_of_day && evoDetails.time_of_day !== "") {
					requirements.push(
						`Evolve during ${this.capitalize(evoDetails.time_of_day)}`,
					);
				}
				if (evoDetails.known_move) {
					requirements.push(
						`Knows Move: ${this.capitalize(evoDetails.known_move.name.replace("-", " "))}`,
					);
				}
				if (evoDetails.location) {
					requirements.push(
						`Evolve in: ${this.capitalize(evoDetails.location.name.replace("-", " "))}`,
					);
				}
				if (evoDetails.gender !== null) {
					requirements.push(
						`Gender: ${evoDetails.gender === 1 ? "Female" : "Male"}`,
					);
				}
				if (evoDetails.trigger.name === "trade") {
					requirements.push("Trade");
				}
				if (evoDetails.held_item) {
					requirements.push(
						`Holding: ${this.capitalize(evoDetails.held_item.name)}`,
					);
				}
				if (evoDetails.known_move_type) {
					requirements.push(
						`Knows Move Type: ${this.capitalize(evoDetails.known_move_type.name)}`,
					);
				}
				if (evoDetails.region) {
					requirements.push(
						`Region: ${this.capitalize(evoDetails.region.name)}`,
					);
				}
			} else {
				requirements.push("Start");
			}

			evoChain.push({
				id: speciesDataResponse.data.id,
				name: speciesName,
				sprite: sprite,
				requirements: requirements,
			});

			if (node.evolves_to?.length > 0) {
				for (const evo of node.evolves_to) {
					await this.parseEvolutionChain(evo, evoChain);
				}
			}
		},

		capitalize(string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},

		async openModal(pokemon) {
			this.selectedPokemon = pokemon;
			this.fetchEvolutionChain(pokemon.id);
			this.saveModalState();
		},
	},
	computed: {
		totalStats() {
			if (!this.selectedPokemon?.stats) return 0;
			return this.selectedPokemon.stats.reduce(
				(total, stat) => total + stat.base_stat,
				0,
			);
		},
		maxStat() {
			return 255;
		},
		maxTotalStat() {
			return 1530;
		},
	},
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}

.pokemon-card {
  perspective: 1000px;
}

.pokemon-card:hover {
  border-radius: 15px;
}


@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}

.evolution-chain {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.evolution-chain .evolution-stage {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
}

.evolution-chain .evolution-stage .evolution-arrow {
    margin: 0 1rem;
}

.evolution-chain .evolution-stage .evolution-pokemon {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.evolution-chain .evolution-stage .evolution-pokemon img {
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
}

.evolution-chain .evolution-stage .evolution-pokemon span {
    font-size: 0.875rem;
    font-weight: 500;
    text-transform: capitalize;
}

.evolution-chain .evolution-stage .evolution-requirements {
    margin-top: 0.5rem;
    text-align: center;
}

.evolution-chain .evolution-stage .evolution-requirements ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.evolution-chain .evolution-stage .evolution-requirements ul li {
    font-size: 0.75rem;
    color: #4a5568;
    display: flex;
    align-items: center;
    justify-content: center;
}

.evolution-chain .evolution-stage .evolution-requirements ul li img {
    width: 32px;
    height: 32px;
    margin-left: 0.25rem;
}

/* Add these styles */
.evolution-arrow {
  padding: 1rem;
}

/* Make evolution chain responsive */
@media (max-width: 768px) {
  .evolution-chain {
    flex-direction: column;
    gap: 1rem;
  }
  
  .evolution-stage {
    flex-direction: column;
    width: 100%;
  }
}

@media (min-width: 769px) {
  .evolution-chain {
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 2rem;
  }
  
  .evolution-stage {
    flex-direction: row;
  }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>