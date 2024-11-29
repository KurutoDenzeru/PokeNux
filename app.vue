<template>
    <div class="relative" lang="en">
        <div class="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
            <div class="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-400 opacity-20 blur-[100px]"></div>
        </div>
        <div class="p-6 w-full h-full mx-auto max-w-screen-xl">
            <!-- Search and Filter Section -->
            <div class="flex flex-col items-center pt-16">
                <div class="py-12">
                    <a href="/" class="lg:text-9xl md:text-8xl sm:text-9xl xs:text-8xl text-7xl font-bold bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent">
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
                    <h1 class="text-2xl font-semibold text-left w-full ">
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

			<!-- List Grid Pagination -->
			<div class="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-6 antialiased">
				<div v-for="pokemon in paginatedPokemon"
						:key="pokemon.id"
						@click="openModal(pokemon)"
						@mousemove="handleMouseMove"
						@mouseleave="handleMouseLeave"
						class="tilt-card bg-white border-2 border-gray-200 rounded-2xl shadow py-4 text-center cursor-pointer transition-all duration-300 ease-out hover:scale-105">
					<div class="glow opacity-0 transition-opacity duration-300"></div>
					<div class="tilt-card-content flex flex-col items-center relative z-10">
						<p class="text-gray-500">#{{ String(pokemon.id).padStart(4, '0') }}</p>
							<img :src="pokemon.sprite" :alt="pokemon.name"
						class="w-28 h-28 mx-auto mb-2" />
						<p class="capitalize">{{ pokemon.name }}</p>
						<div class="flex flex-row flex-wrap justify-center gap-1 mt-2">
							<span v-for="type in pokemon.types"
								:key="type"
								:class="['inline-flex items-center px-2 py-1 rounded-lg capitalize text-white text-xs lg:text-sm whitespace-nowrap', typeColorClass(type)]">
							{{ getEmojiForType(type) }} {{ type }}
							</span>
						</div>
					</div>
				</div>
			</div>

            <!-- Pagination Controls -->
			<div class="my-6 flex justify-end">
				<div class="flex flex-col items-end gap-4">
					<!-- Showing entries text -->
					<span class="text-sm text-gray-700">
						Showing
						<span class="font-semibold text-gray-900">{{ ((page - 1) * perPage) + 1 }}</span>
						to
						<span class="font-semibold text-gray-900">
							{{ Math.min(page * perPage, filteredAndSortedPokemon.length) }}
						</span>
						of
						<span class="font-semibold text-gray-900">{{ filteredAndSortedPokemon.length }}</span>
						Entries
					</span>

					<!-- Pagination navigation -->
					<nav aria-label="Page navigation">
						<ul class="flex items-center -space-x-px h-10 text-base">
							<!-- Previous button -->
							<li>
								<a @click="prevPage"
								:class="[
									'flex items-center justify-center px-4 h-10 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg',
									page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer'
								]">
									<span class="sr-only">Previous</span>
									<svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
									</svg>
								</a>
							</li>

							<!-- Page numbers -->
							<template v-for="pageNum in displayedPages" :key="pageNum">
								<!-- Ellipsis -->
								<li v-if="pageNum === '...'" class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
									...
								</li>
								<!-- Page number -->
								<li v-else>
									<a @click="page = pageNum"
									class="flex items-center justify-center px-4 h-10 leading-tight cursor-pointer border border-gray-300"
									:class="[
										pageNum === page 
										? 'z-10 text-emerald-600 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700'
										: 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
									]">
										{{ pageNum }}
									</a>
								</li>
							</template>

							<!-- Next button -->
							<li>
								<a @click="nextPage"
								:class="[
									'flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 rounded-e-lg',
									page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer'
								]">
									<span class="sr-only">Next</span>
									<svg class="w-3 h-3 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
									</svg>
								</a>
							</li>
						</ul>
					</nav>
				</div>
			</div>

            <!-- Modal for Pokémon Details -->
            <transition name="fade" v-if="selectedPokemon">
				<div class="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center backdrop-blur-md z-50" @click.self="closeModal">
					<div class="bg-white shadow-sm rounded-xl max-w-7xl w-full relative m-6 max-h-[90vh] flex flex-col" @click.stop>
						<!-- Modal Header - Sticky -->
						<div class="sticky top-0 rounded-t-xl  bg-white z-10 px-6 md:px-8 py-4 border-b">
							<div class="flex items-center justify-between">
								<div class="flex items-center space-x-2">
									<span class="text-gray-600 font-semibold text-xl">#{{ String(selectedPokemon.id).padStart(4, '0') }}</span>
								<h2 class="text-xl font-semibold text-gray-900 capitalize">{{ selectedPokemon.name }}</h2>
									<span class="px-4 bg-blue-900 py-1 rounded-lg text-white text-md font-semibold">
										Button Here
									</span>
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
												:disabled="!selectedPokemon?.cries?.legacy || isAudioLoading.legacy"
												>
												<span class="flex items-center gap-2">
													<span v-if="isPlayingLegacy || isAudioLoading.legacy" 
															:class="{'animate-pulse': isAudioLoading.legacy}">
														🔊
													</span>
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

								<!-- Breeding & Training Sections -->
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
														<template v-if="selectedPokemon?.breeding?.genderRate === -1">
															<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-purple-500 hover:bg-purple-600 transition-colors">
															<span class="flex items-center gap-1">
																<span>⚥</span> Genderless
															</span>
															</button>
														</template>
														<template v-else-if="selectedPokemon?.breeding?.genderRate !== undefined">
															<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-blue-500 hover:bg-blue-600 transition-colors">
																<span class="flex items-center gap-1">
																	<span>♂</span> {{ calculateGenderRatio(selectedPokemon.breeding.genderRate).male }}%
																</span>
															</button>
															<button class="px-3 py-1 text-sm font-medium rounded-lg text-white bg-pink-500 hover:bg-pink-600 transition-colors">
																<span class="flex items-center gap-1">
																	<span>♀</span> {{ calculateGenderRatio(selectedPokemon.breeding.genderRate).female }}%
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
													{{ selectedPokemon.breeding?.growthRate?.replace?.(/-/g, ' ') || 'Unknown' }}
												</td>
											</tr>
											<template v-if="selectedPokemon?.breeding">
												<tr class="hover:bg-gray-50 transition-colors">
													<td class="py-3"><strong>Egg Cycles:</strong></td>
														<td class="py-3">
															{{ selectedPokemon.breeding.hatchCounter || 0 }}
															({{ formatNumber((selectedPokemon.breeding.hatchCounter || 0) * 255) }} steps)
														</td>
												</tr>
											</template>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Baby Trigger Item:</strong></td>
												<td class="py-3 capitalize">
													<div v-if="selectedPokemon.breeding.babyTriggerItem" class="flex items-center gap-2">
													<span>{{ formatItemName(selectedPokemon.breeding.babyTriggerItem) }}</span>
													<img
														:src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${selectedPokemon.breeding.babyTriggerItem}.png`"
														:alt="selectedPokemon.breeding.babyTriggerItem"
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
												{{ selectedPokemon.breeding.habitat }}
											</td>
											</tr>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Egg Groups:</strong></td>
											<td class="py-3">
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
												<span v-for="ev in selectedPokemon.training.evYield" :key="ev.stat" class="text-sm">
													{{ formatStatName(ev.stat) }}: +{{ ev.value }}
												</span>
												</div>
											</td>
											</tr>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Catch Rate:</strong></td>
											<td class="py-3">
												{{ selectedPokemon.training.catchRate }} 
												({{ (selectedPokemon.training.catchRate / 255 * 100).toFixed(1) }}%)
											</td>
											</tr>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Base Happiness:</strong></td>
											<td class="py-3">
												{{ selectedPokemon.training.baseHappiness }}
												<span class="text-sm text-gray-500">
												({{ getHappinessLevel(selectedPokemon.training.baseHappiness) }})
												</span>
											</td>
											</tr>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Base XP:</strong></td>
											<td class="py-3">{{ selectedPokemon.training.baseExp }}</td>
											</tr>
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Held Items:</strong></td>
											<td class="py-3">
												<div v-if="selectedPokemon.training.heldItems.length" class="flex flex-col gap-2">
													<div v-for="item in selectedPokemon.training.heldItems" :key="item.name" class="flex items-center gap-2">
														<span>{{ formatItemName(item.name) }}</span>
															<img
															:src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${item.name}.png`"
															:alt="item.name"
															class="w-auto h-auto"
															@error="handleImageError"
															/>
														<!-- <span class="text-sm text-gray-500">({{ item.rarity }}%)</span> -->
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

								<!-- Relations & Forms Sections -->
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
												>
												<div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
											</label>
											<span class="text-sm font-medium text-gray-900">Attacking</span>
											</div>
										</div>

										<div class="bg-white">
											<table class="w-full table-fixed">
												<tbody class="divide-y divide-gray-100">
													<tr v-for="(types, category) in typeRelations" :key="category" class="hover:bg-gray-50 transition-colors">
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
																	typeColorClass(type)
																	]"
																	>
																	{{ getEmojiForType(type) }}
																	<div class="opacity-0 invisible group-hover:opacity-100 group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-gray-800 border border-gray-300 rounded-lg shadow-lg py-1 px-2 text-sm z-10 whitespace-nowrap">
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
												{{ selectedPokemon.forms?.hasAlternativeForms ? 'Yes' : 'No' }}
											</td>
											</tr>

											<!-- Varieties -->
											<tr class="hover:bg-gray-50 transition-colors">
											<td class="py-3"><strong>Varieties:</strong></td>
												<td class="py-3">
													<div v-if="selectedPokemon.forms?.varieties.length" class="flex flex-wrap gap-2">
														<button
														v-for="variety in selectedPokemon.forms.varieties"
														:key="variety.id"
														@click="handleVarietyClick(variety)"
														class="px-3 py-1 text-sm font-medium rounded-lg text-emerald-600 border border-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
													>
														<img
															:src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${variety.id}.png`"
															:alt="variety.name"
															class="w-10 h-10"
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
													<div v-if="selectedPokemon.forms?.hasGenderDifferences" class="space-y-2">
													<p class="text-sm text-gray-600">{{ selectedPokemon.forms.genderDifferencesDescription }}</p>
														<div class="flex gap-4 mt-2">
															<div class="flex items-center gap-2">
															<span class="text-blue-500">♂</span>
																<img
																	:src="selectedPokemon.forms.maleSprite"
																	:alt="selectedPokemon.name + ' male'"
																	class="w-auto h-auto"
																	@error="handleImageError"
																/>
															</div>
															<div class="flex items-center gap-2">
															<span class="text-pink-500">♀</span>
																<img
																	:src="selectedPokemon.forms.femaleSprite"
																	:alt="selectedPokemon.name + ' female'"
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

								<!-- Base Stats -->
								<div>
									<h3 class="font-bold mb-2">Base Stats:</h3>
									<ul>
										<li v-for="stat in selectedPokemon.stats" :key="stat.stat.name" class="mb-2">
											<div class="grid grid-cols-12 gap-2 items-center">
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
																class="w-6 h-6"
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

								<!-- Sprite Sheets -->
								<div class="mt-8">
									<h3 class="font-bold mb-4">Sprite Collection</h3>

									<!-- Main Sprites Accordion -->
									<div class="border rounded-lg mb-4">
									<button
										@click="toggleSpriteAccordion('mainSprites')"
										class="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
										<span class="font-medium">Main Sprites</span>
										<svg
										class="w-5 h-5 transition-transform duration-200"
										:class="{ 'rotate-180': spriteAccordions.mainSprites }"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
										>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
											clip-rule="evenodd"
										/>
										</svg>
									</button>

									<div v-if="spriteAccordions.mainSprites" class="p-4 flex flex-wrap items-center justify-center gap-8">
										<div v-for="(url, key) in spriteData.mainSprites" :key="key" class="text-center">
										<img
											v-if="url"
											:src="url"
											:alt="key"
											class="w-48 h-48 object-contain mx-auto pixelated"
										>
										<span v-else class="text-sm text-gray-400">No sprite available</span>
										<span class="text-sm text-gray-600 mt-2">{{ formatSpriteLabel(key) }}</span>
										</div>
									</div>
									</div>

									<h3 class="font-bold mb-4">Other Sprites</h3>

									<!-- Other Sprites Accordion -->
									<div id="accordionExample">
										<!-- Showdown Sprites -->
										<div class="rounded-t-lg border">
											<h2 class="mb-0" id="headingShowdown">
											<button
												class="group relative flex w-full rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
												type="button"
												@click="toggleSpriteAccordion('showdownSprites')"
												aria-expanded="true"
												aria-controls="collapseShowdown"
											>
												<span class="font-medium">Showndown Sprites</span>
												<span
												class="-me-1 ms-auto h-5 w-5 shrink-0 rotate-[-180deg] transition-transform duration-200 ease-in-out group-data-[twe-collapse-collapsed]:me-0 group-data-[twe-collapse-collapsed]:rotate-0 motion-reduce:transition-none [&>svg]:h-6 [&>svg]:w-6"
												>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
													<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
												</svg>
												</span>
											</button>
											</h2>
											<div
											id="collapseShowdown"
											class="!visible"
											v-if="spriteAccordions.showdownSprites"
											aria-labelledby="headingShowdown"
											data-twe-parent="#accordionExample"
											>
											<div class="px-5 py-4 flex flex-wrap items-center justify-center gap-8">
												<!-- Front Default -->
												<div class="text-center">
												<img
													:src="spriteData.showdownSprites.frontDefaultAnimated"
													alt="Front Default"
													class="w-full h-full object-contain mx-auto pixelated"
												/>
												<span class="text-sm text-gray-600 mt-2">Front Default</span>
												</div>
												<!-- Back Default -->
												<div class="text-center">
												<img
													:src="spriteData.showdownSprites.backDefaultAnimated"
													alt="Back Default"
													class="w-full h-full object-contain mx-auto pixelated"
												/>
												<span class="text-sm text-gray-600 mt-2">Back Default</span>
												</div>
												<!-- Front Shiny -->
												<div class="text-center">
												<img
													:src="spriteData.showdownSprites.frontShinyAnimated"
													alt="Front Shiny"
													class="w-full h-full object-contain mx-auto pixelated"
												/>
												<span class="text-sm text-gray-600 mt-2">Front Shiny</span>
												</div>
												<!-- Back Shiny -->
												<div class="text-center">
												<img
													:src="spriteData.showdownSprites.backShinyAnimated"
													alt="Back Shiny"
													class="w-full h-full object-contain mx-auto pixelated"
												/>
												<span class="text-sm text-gray-600 mt-2">Back Shiny</span>
												</div>
											</div>
											</div>
										</div>

										<!-- Official Artwork Sprites -->
										<div class="border border-t-0">
											<h2 class="mb-0" id="headingOfficial">
											<button
												class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
												type="button"
												@click="toggleSpriteAccordion('officialArtwork')"
												aria-expanded="false"
												aria-controls="collapseOfficial"
											>
												<span class="font-medium">Official Artwork</span>
												<svg
														class="w-5 h-5 transition-transform duration-200"
														:class="{ 'rotate-180': spriteAccordions.dreamworld }"
														viewBox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
														>
														<path
															fill-rule="evenodd"
															d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
															clip-rule="evenodd"
														/>
													</svg>
											</button>
											</h2>
												<div v-if="spriteAccordions.officialArtwork" class="p-4 flex flex-wrap items-center justify-center gap-8">
													<div v-for="(url, key) in spriteData.officialArtwork" :key="key" class="text-center">
														<img
															:src="url"
															:alt="key"
															class="w-1/2 h-1/2 object-contain mx-auto pixelated"
														>
														<span class="text-sm text-gray-600">{{ formatSpriteLabel(key) }}</span>
													</div>
												</div>
										</div>

										<!-- Pokemon Home Sprites -->
										<div class="border border-t-0 border-neutral-200 bg-white">
											<h2 class="mb-0" id="headingHome">
											<button
												class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
												type="button"
												@click="toggleSpriteAccordion('pokemonHome')"
												aria-expanded="false"
												aria-controls="collapseHome"
											>
												<span class="font-medium">Pokemon Home</span>
													<svg
														class="w-5 h-5 transition-transform duration-200"
														:class="{ 'rotate-180': spriteAccordions.dreamworld }"
														viewBox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
														>
														<path
															fill-rule="evenodd"
															d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
															clip-rule="evenodd"
														/>
													</svg>
											</button>
											</h2>
												<div v-if="spriteAccordions.pokemonHome" class="p-4 flex flex-wrap items-center justify-center gap-8">
													<div class="text-center">
														<img
														:src="spriteData.pokemonHome.default"
														alt="Default Home"
														class="w-1/2 h-1/2 object-contain mx-auto"
														>
														<span class="text-sm text-gray-600">Default Home</span>
													</div>
													<div class="text-center">
														<img
														:src="spriteData.pokemonHome.shiny"
														alt="Shiny Home"
														class="w-1/2 h-1/2 object-contain mx-auto"
														>
														<span class="text-sm text-gray-600">Shiny Home</span>
													</div>
												</div>
										</div>

										<!-- Dreamworld Sprites -->
										<div class="rounded-b-lg border border-t-0 mb-4 border-neutral-200 bg-white">
											<h2 class="mb-0" id="headingDreamworld">
												<button
													class="group relative flex w-full justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
													type="button"
													@click="toggleSpriteAccordion('dreamworld')"
												>
													<span class="font-medium">Dreamworld</span>
													<svg
														class="w-5 h-5 transition-transform duration-200"
														:class="{ 'rotate-180': spriteAccordions.dreamworld }"
														viewBox="0 0 20 20"
														fill="currentColor"
														aria-hidden="true"
														>
														<path
															fill-rule="evenodd"
															d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
															clip-rule="evenodd"
														/>
													</svg>
												</button>
											</h2>
												<div v-if="spriteAccordions.dreamworld" class="p-4 flex items-center justify-center gap-8">
													<div class="text-center">
													<img
														:src="spriteData.dreamworld || ''"
														alt="Dreamworld"
														class="w-1/2 h-1/2 object-contain mx-auto pixelated"
													>
													<span class="text-sm text-gray-600">Dreamworld</span>
													</div>
												</div>
										</div>
									</div>

									<!-- Sprites by Generation Accordion -->
									<div class="border rounded-lg mb-4">
									<button 
										@click="toggleSpriteAccordion('spritesByGeneration')"
										class="w-full flex rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
										<span class="font-medium">Sprites by Generation</span>
										<svg
										class="w-5 h-5 transition-transform duration-200"
										:class="{ 'rotate-180': spriteAccordions.spritesByGeneration }"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
										>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
											clip-rule="evenodd"
										/>
										</svg>
									</button>

									<div v-if="spriteAccordions.spritesByGeneration" class="p-4">
										<div v-for="(genSprites, gen) in spriteData.generationalSprites" :key="gen" class="mb-8">
											<h4 class="font-medium mb-4 text-lg">{{ formatGeneration(gen) }}</h4>
											<div v-for="(versionData, version) in getGenSprites(genSprites)" :key="version" class="mb-6">
											<h5 class="font-medium mb-2 text-gray-700">{{ versionData.label }}</h5>
											<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
												<!-- Front Default -->
												<div v-if="versionData.static.front_default" class="text-center">
												<img
													:src="versionData.static.front_default"
													:alt="`Front Default - ${version}`"
													class="w-32 h-32 object-contain mx-auto pixelated"
												>
												<span class="text-sm text-gray-600">Front Default</span>
												</div>

												<!-- Back Default -->
												<div v-if="versionData.static.back_default" class="text-center">
												<img
													:src="versionData.static.back_default"
													:alt="`Back Default - ${version}`"
													class="w-32 h-32 object-contain mx-auto pixelated"
												>
												<span class="text-sm text-gray-600">Back Default</span>
												</div>

												<!-- Front Shiny -->
												<div v-if="versionData.static.front_shiny" class="text-center">
												<img
													:src="versionData.static.front_shiny"
													:alt="`Front Shiny - ${version}`"
													class="w-32 h-32 object-contain mx-auto pixelated"
												>
												<span class="text-sm text-gray-600">Front Shiny</span>
												</div>

												<!-- Back Shiny -->
												<div v-if="versionData.static.back_shiny" class="text-center">
												<img
													:src="versionData.static.back_shiny"
													:alt="`Back Shiny - ${version}`"
													class="w-32 h-32 object-contain mx-auto pixelated"
												>
												<span class="text-sm text-gray-600">Back Shiny</span>
												</div>

												<!-- Animated Sprites (Gen 5+) -->
												<template v-if="versionData.animated">
												<div v-for="(url, type) in versionData.animated" :key="type" class="text-center">
													<img
													v-if="url"
													:src="url"
													:alt="`${formatSpriteLabel(type)} - ${version} (Animated)`"
													class="w-32 h-32 object-contain mx-auto pixelated"
													>
													<span class="text-sm text-gray-600">{{ formatSpriteLabel(type) }} (Animated)</span>
												</div>
												</template>
											</div>
											</div>
										</div>
										</div>
									</div>

									<!-- Pokemon Icon Accordion -->
									<div class="border rounded-lg">
									<button 
										@click="toggleSpriteAccordion('pokemonIcon')"
										class="w-full flex rounded-t-lg justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
										<span class="font-medium">Pokemon Icon</span>
										<svg
										class="w-5 h-5 transition-transform duration-200"
										:class="{ 'rotate-180': spriteAccordions.pokemonIcon }"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
										>
										<path
											fill-rule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
											clip-rule="evenodd"
										/>
										</svg>
									</button>

									<div v-if="spriteAccordions.pokemonIcon" class="p-4 flex items-center justify-center gap-4">
										<img 
										v-if="spriteData.icon"
										:src="spriteData.icon || ''"
										class="w-auto h-auto mr-2 pixelated"
										alt="Pokemon Icon"
										>
										<span class="text-sm text-gray-600">Pokemon Icon</span>
									</div>
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
			"Generation 10",
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
		const isAttacking = ref(true);
		const selectedLearnMethod = ref("all");
		const selectedGameVersion = ref("all");
		const typeRelations = ref({
			immune: [],
			quarterDamage: [],
			halfDamage: [],
			doubleDamage: [],
			quadrupleDamage: [],
		});

		const selectedPokemon = ref(null);

		const updateSelectedPokemon = (pokemon) => {
			selectedPokemon.value = pokemon;
		};

		const moveData = ref({
			isLoading: false,
			error: null,
			moves: [],
		});

		const evolutionChain = ref([]);

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
				const { data } = await axios.get(
					"https://pokeapi.co/api/v2/pokemon?limit=1302",
				);

				pokemonList.value = data.results.map((pokemon, index) => ({
					id: index + 1,
					name: pokemon.name,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${index + 1}.png`,
					url: pokemon.url,
					types: [],
					generation: "",
				}));

				await Promise.all(
					pokemonList.value.slice(0, perPage).map(fetchPokemonDetails),
				);
				filteredPokemon.value = pokemonList.value;
			} catch (error) {
				console.error("Error fetching Pokémon data:", error);
			}
		};

		const isNormalSprite = ref(true);

		// Fetch detailed Pokémon information when modal is opened
		const fetchPokemonDetails = async (pokemon) => {
			if (pokemon.detailsFetched) return;

			try {
				// Fetch both pokemon and species data
				const [pokemonResponse, speciesResponse] = await Promise.all([
					axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`),
					axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`),
				]);

				const generationId = speciesResponse.data.generation.url
					.split("/")
					.slice(-2, -1)[0];
				pokemon.generation = `Generation ${generationId}`;

				const englishFlavorText = speciesResponse.data.flavor_text_entries.find(
					(entry) => entry.language.name === "en",
				);

				pokemon.description = englishFlavorText
					? englishFlavorText.flavor_text
							.replace(/\f/g, " ")
							.replace(/\f/g, " ")
							.replace(/\n/g, " ")
							.replace(/\r/g, " ")
							.replace(/\s{2,}/g, " ")
							.trim()
					: "No description available.";

				const abilitiesPromises = pokemonResponse.data.abilities.map(
					async (ability) => {
						const abilityResponse = await axios.get(ability.ability.url);
						const englishDescription = abilityResponse.data.effect_entries.find(
							(entry) => entry.language.name === "en",
						);

						return {
							name: ability.ability.name,
							is_hidden: ability.is_hidden,
							description: englishDescription
								? englishDescription.short_effect
								: "No description available",
						};
					},
				);
				pokemon.abilities = await Promise.all(abilitiesPromises);

				pokemon.forms = {
					hasAlternativeForms: pokemonResponse.data.forms.length > 1,
					varieties: speciesResponse.data.varieties
						.filter((v) => v.pokemon.name !== pokemon.name)
						.map((v) => ({
							id: Number(v.pokemon.url.split("/").slice(-2, -1)[0]),
							name: v.pokemon.name,
						})),
					hasGenderDifferences: speciesResponse.data.has_gender_differences,
					genderDifferencesDescription:
						"Gender differences visible in appearance",
				};

				pokemon.breeding = {
					genderRate: speciesResponse.data.gender_rate,
					growthRate: speciesResponse.data.growth_rate?.name || "",
					hatchCounter: speciesResponse.data.hatch_counter || 0,
					eggGroups:
						speciesResponse.data.egg_groups.map((group) => group.name) || [],
					habitat: speciesResponse.data.habitat?.name || "Unknown",
					babyTriggerItem: speciesResponse.data.baby_trigger_item?.name || null,
				};

				// Training Data
				pokemon.training = {
					evYield: pokemonResponse.data.stats
						.map((stat) => ({
							stat: stat.stat.name,
							value: stat.effort,
						}))
						.filter((ev) => ev.value > 0),
					catchRate: speciesResponse.data.capture_rate,
					baseHappiness: speciesResponse.data.base_happiness,
					baseExp: pokemonResponse.data.base_experience,
					heldItems: pokemonResponse.data.held_items.map((item) => ({
						name: item.item.name,
						rarity: item.rarity,
					})),
				};

				if (pokemon.forms.hasGenderDifferences) {
					pokemon.forms.maleSprite = pokemonResponse.data.sprites.front_default;
					pokemon.forms.femaleSprite =
						pokemonResponse.data.sprites.front_female;
				}
				if (pokemon.forms.varieties.length > 0) {
					pokemon.forms.varieties.unshift({
						id: pokemon.id,
						name: pokemon.name,
						isDefault: true,
					});
				}

				pokemon.sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
				pokemon.shinySprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`;
				pokemon.cries = {
					latest: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${pokemon.id}.ogg`,
					legacy: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/${pokemon.id}.ogg`,
				};
				pokemon.currentSprite = pokemon.sprite;
				pokemon.types = pokemonResponse.data.types.map((t) => t.type.name);
				pokemon.weight = pokemonResponse.data.weight / 10;
				pokemon.height = pokemonResponse.data.height;
				pokemon.stats = pokemonResponse.data.stats;

				const englishGenus = speciesResponse.data.genera.find(
					(g) => g.language.name === "en",
				);
				pokemon.genus = englishGenus ? englishGenus.genus : "Unknown";
				pokemon.shape = speciesResponse.data.shape?.name || "Unknown";
				pokemon.color = speciesResponse.data.color?.name || "Unknown";

				pokemon.detailsFetched = true;
			} catch (error) {
				console.error(`Error fetching details for ${pokemon.name}:`, error);
				// Set default values for failed fetches
				pokemon.generation = "Unknown";
				pokemon.abilities = [];
				pokemon.forms = {
					hasAlternativeForms: false,
					varieties: [],
					hasGenderDifferences: false,
					genderDifferencesDescription: "",
					maleSprite: null,
					femaleSprite: null,
				};
				pokemon.breeding = {
					genderRate: undefined,
					growthRate: "",
					hatchCounter: 0,
					eggGroups: [],
					habitat: "Unknown",
					babyTriggerItem: null,
				};
				pokemon.training = {
					evYield: [],
					catchRate: 0,
					baseHappiness: 0,
					baseExp: 0,
					heldItems: [],
				};
				pokemon.detailsFetched = true;
			}
		};

		const fetchTypeRelations = async () => {
			if (!selectedPokemon.value?.types) return;

			try {
				const typePromises = selectedPokemon.value.types.map((type) =>
					axios.get(`https://pokeapi.co/api/v2/type/${type}`),
				);

				const typeResponses = await Promise.all(typePromises);

				// Reset relations
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

		watch(
			() => selectedPokemon.value?.types,
			(newTypes) => {
				if (newTypes) {
					fetchTypeRelations();
				}
			},
			{ immediate: true },
		);

		onMounted(() => {
			if (selectedPokemon.value?.types) {
				fetchTypeRelations();
			}
		});

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

		const parseEvolutionChain = async (node, evoChain) => {
			if (!node?.species) {
				console.error("Invalid evolution node structure");
				return;
			}

			try {
				const speciesId = node.species.url.split("/").filter(Boolean).pop();
				const pokemonSprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;

				const [speciesResponse, pokemonResponse] = await Promise.all([
					axios.get(`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`),
					axios.get(`https://pokeapi.co/api/v2/pokemon/${speciesId}`),
				]);

				const requirements = [];

				if (node.evolution_details?.length > 0) {
					const details = node.evolution_details[0];

					if (details.min_level) {
						const rareCandySprite = await getItemSprite("rare-candy");
						requirements.push({
							type: "level",
							value: details.min_level,
							display: `Level ${details.min_level}`,
							sprite: rareCandySprite,
						});
					}

					if (details.min_friendship) {
						requirements.push({
							type: "friendship",
							value: details.min_friendship,
							display: "High Friendship",
							sprite: await getItemSprite("soothe-bell"),
						});
					}

					if (details.item?.name) {
						requirements.push({
							type: "item",
							value: details.item.name,
							sprite: await getItemSprite(details.item.name),
							display: formatItemName(details.item.name),
						});
					}

					if (details.held_item?.name) {
						requirements.push({
							type: "held-item",
							value: details.held_item.name,
							sprite: await getItemSprite(details.held_item.name),
							display: formatItemName(details.held_item.name),
						});
					}

					if (details.location?.name) {
						requirements.push({
							type: "location",
							value: details.location.name,
							display: `At ${formatLocationName(details.location.name)}`,
						});
					}

					if (details.time_of_day) {
						requirements.push({
							type: "time",
							value: details.time_of_day,
							display: `During ${details.time_of_day}`,
						});
					}

					// Trade evolutions
					if (details.trade_species) {
						requirements.push({
							type: "trade",
							value: "trade",
							display: `Trade with ${formatPokemonName(details.trade_species.name)}`,
							sprite: await getPokemonSprite(details.trade_species.name),
						});
					} else if (details.needs_overworld_rain) {
						requirements.push({
							type: "weather",
							value: "rain",
							display: "During Rain",
						});
					} else if (details.trade_species) {
						requirements.push({
							type: "trade",
							value: "trade",
							display: "Trade",
						});
					}
				} else {
					requirements.push({ type: "base", display: "Base Form" });
				}

				const varieties = [];
				if (speciesResponse.data.varieties.length > 1) {
					for (const variety of speciesResponse.data.varieties) {
						if (variety.pokemon.name !== node.species.name) {
							const varId = variety.pokemon.url
								.split("/")
								.filter(Boolean)
								.pop();
							const isMega = variety.pokemon.name.includes("mega");
							const isGmax = variety.pokemon.name.includes("gmax");

							let requirementSprite = null;
							let requirementName = null;

							// Handle Mega Evolution stones
							if (isMega) {
								const pokemonBaseName = node.species.name.toLowerCase();
								requirementName = `${pokemonBaseName}ite`; // e.g., venusaurite, charizardite-x
								if (variety.pokemon.name.includes("-x")) {
									requirementName += "-x";
								} else if (variety.pokemon.name.includes("-y")) {
									requirementName += "-y";
								}
								requirementSprite = await getItemSprite(requirementName);
							}
							// Handle G-max forms
							else if (isGmax) {
								requirementName = "max-mushrooms";
								requirementSprite = await getItemSprite(requirementName);
							}

							varieties.push({
								id: Number(varId),
								name: variety.pokemon.name,
								sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${varId}.png`,
								requirement: requirementName
									? {
											type: isMega ? "mega" : "gmax",
											name: requirementName,
											sprite: requirementSprite,
											display: isMega ? "Mega Evolution" : "Gigantamax Factor",
										}
									: null,
							});
						}
					}
				}

				const evolutionEntry = {
					id: Number(speciesId),
					name: node.species.name,
					sprite: pokemonSprite,
					requirements: requirements,
					varieties: varieties.map((v) => ({
						...v,
						requirement: v.requirement
							? {
									...v.requirement,
									display: `Use ${formatItemName(v.requirement.name)}`,
									sprite: v.requirement.sprite,
								}
							: null,
					})),
					types: pokemonResponse.data.types.map((t) => t.type.name),
				};

				evoChain.push(evolutionEntry);

				if (node.evolves_to?.length > 0) {
					for (const nextEvolution of node.evolves_to) {
						await parseEvolutionChain(nextEvolution, evoChain);
					}
				}
			} catch (error) {
				console.error(
					`Error parsing evolution chain for ${node.species?.name || "unknown"}:`,
					error,
				);

				// Fallback evolution entry
				if (node.species) {
					evoChain.push({
						id: Number(node.species.url.split("/").filter(Boolean).pop()),
						name: node.species.name,
						sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${node.species.url.split("/").filter(Boolean).pop()}.png`,
						requirements: [
							{ type: "error", display: "Error loading evolution data" },
						],
						varieties: [],
						types: [],
					});
				}
			}
		};

		const formatItemName = (name) => {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
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
				page.value = 1;
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
			const end = start + perPage;
			return filteredAndSortedPokemon.value.slice(start, end);
		});

		// Watcher to fetch types immediately for displayed Pokémon
		watch(
			() => paginatedPokemon.value,
			async (newPokemon) => {
				if (newPokemon) {
					await Promise.all(
						newPokemon.map(async (pokemon) => {
							if (!pokemon.types?.length) {
								await fetchPokemonDetails(pokemon);
							}
						}),
					);
				}
			},
			{ immediate: true },
		);

		const checkGenerationFilter = (pokemon) => {
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
			return pokemon.id >= min && pokemon.id <= max;
		};

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
		const getItemSprite = async (itemName) => {
			if (!itemName) return "";
			const cleanName = itemName
				.toLowerCase()
				.replace(/\s+/g, "-")
				.replace(/[.']/g, "")
				.replace(/:/g, "")
				.trim();

			// Special case for rare candy
			if (cleanName === "rare-candy") {
				return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png";
			}

			return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${cleanName}.png`;
		};
		const formatLocationName = (name) => {
			if (!name) return "";
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		};
		const fetchEvolutionChain = async (pokemonId) => {
			try {
				const speciesResponse = await axios.get(
					`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`,
				);

				if (!speciesResponse.data.evolution_chain?.url) {
					console.log("No evolution chain available for this Pokémon");
					evolutionChain.value = [
						{
							id: selectedPokemon.value.id,
							name: selectedPokemon.value.name,
							sprite: selectedPokemon.value.sprite,
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
				await parseEvolutionChain(chain, evoChain);
				evolutionChain.value = evoChain;
			} catch (error) {
				console.error("Error fetching evolution chain:", error);
				evolutionChain.value = [
					{
						id: selectedPokemon.value.id,
						name: selectedPokemon.value.name,
						sprite: selectedPokemon.value.sprite,
						requirements: ["Evolution data unavailable"],
					},
				];
			}
		};

		const saveModalState = () => {
			if (!selectedPokemon.value) {
				localStorage.removeItem("pokemonModalState");
				return;
			}

			const state = {
				pokemonId: selectedPokemon.value.id,
				isNormalSprite: isNormalSprite.value,
				currentSprite: selectedPokemon.value.currentSprite,
				types: selectedPokemon.value.types,
				name: selectedPokemon.value.name,
				generation: selectedPokemon.value.generation,
				abilities: selectedPokemon.value.abilities,
				forms: selectedPokemon.value.forms,
				genus: selectedPokemon.value.genus,
				shape: selectedPokemon.value.shape,
				color: selectedPokemon.value.color,
				weight: selectedPokemon.value.weight,
				height: selectedPokemon.value.height,
				breeding: selectedPokemon.value.breeding,
				training: selectedPokemon.value.training,
				description: selectedPokemon.value.description,
				stats: selectedPokemon.value.stats,
			};
			localStorage.setItem("pokemonModalState", JSON.stringify(state));
		};

		watch(
			[selectedLearnMethod, selectedGameVersion],
			async ([method, version]) => {
				if (selectedPokemon.value) {
					await fetchMoves(selectedPokemon.value.id, method, version);
				}
			},
		);

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
			// Reset page when filter changes
			page.value = 1;

			try {
				if (!selectedElementType.value) {
					// If no type selected, reset to initial filtered state
					filteredPokemon.value = pokemonList.value;
					return;
				}

				const type = selectedElementType.value.toLowerCase();
				const response = await axios.get(
					`https://pokeapi.co/api/v2/type/${type}`,
				);
				const pokemonOfType = response.data.pokemon.map((p) => {
					return {
						id: Number.parseInt(p.pokemon.url.split("/")[6]),
						name: p.pokemon.name,
					};
				});

				// Filter pokemon list considering both type and generation
				filteredPokemon.value = pokemonList.value.filter((pokemon) => {
					const matchesType = pokemonOfType.some((p) => p.id === pokemon.id);
					const matchesGeneration =
						selectedGeneration.value === "All" ||
						checkGenerationFilter(pokemon);
					return matchesType && matchesGeneration;
				});

				// Fetch details for the first page of filtered results
				const firstPagePokemon = filteredPokemon.value.slice(0, perPage);
				await Promise.all(
					firstPagePokemon.map(async (pokemon) => {
						if (!pokemon.types?.length) {
							await fetchPokemonDetails(pokemon);
						}
					}),
				);
			} catch (error) {
				console.error("Error filtering by type:", error);
			}
		};

		watch([selectedElementType, selectedGeneration, sortOption], async () => {
			await filterByType();
			page.value = 1;
		});

		fetchPokemon();

		// Type color classes
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

		return {
			perPage,
			isAttacking,
			typeRelations,
			fetchTypeRelations,
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
			applyFilters,
			typeColorClass,
			selectedPokemon,
			updateSelectedPokemon,
			isNormalSprite,
			toggleSprite,
			filteredAndSortedPokemon,
			evolutionChain,
			fetchEvolutionChain,
			fetchPokemonDetails,
			saveModalState,
			formatLocationName,
			getItemSprite,
			parseEvolutionChain,
			formatItemName,
		};
	},
	data() {
		return {
			isPlayingLegacy: false,
			isPlayingLatest: false,
			audioPlayers: {
				legacy: null,
				latest: null,
			},
			isAudioLoading: {
				legacy: false,
				latest: false,
			},
			openSections: {
				mainSprites: false,
				otherSprites: false,
				genSprites: false,
			},
			mainSprites: {},
			showdownSprites: {},
			otherSprites: {},
			generationSprites: {},
			spriteData: {
				mainSprites: {
					frontDefault: null,
					backDefault: null,
					frontShiny: null,
					backShiny: null,
				},
				showdownSprites: {
					frontDefault: null,
					backDefault: null,
					frontShiny: null,
					backShiny: null,
					frontDefaultAnimated: null,
					backDefaultAnimated: null,
					frontShinyAnimated: null,
					backShinyAnimated: null,
				},
				officialArtwork: {
					officialArtwork: null,
					officialArtworkShiny: null,
				},
				pokemonHome: {
					shiny: null,
				},
				dreamworld: null,
				generationalSprites: {},
				icon: null,
			},
			spriteAccordions: {
				mainSprites: true,
				otherSprites: false,
				showdownSprites: false,
				officialArtwork: false,
				pokemonHome: false,
				dreamworld: false,
				spritesByGeneration: false,
				pokemonIcon: false,
			},
		};
	},
	async mounted() {
		document.addEventListener("keydown", this.handleEscKey);

		try {
			const response = await fetch(
				"https://pokeapi.co/api/v2/pokemon?limit=1302",
			);
			const data = await response.json();
			this.totalPokemon = data.count;
		} catch (error) {
			console.error("Error fetching Pokémon data:", error);
		}

		this.restoreModalState();

		if (this.selectedPokemon?.types) {
			await this.fetchTypeRelations();
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
			const content = card.querySelector(".tilt-card-content");
			const glow = card.querySelector(".glow");
			const rect = card.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			const centerX = rect.width / 2;
			const centerY = rect.height / 2;

			const percentX = (x - centerX) / centerX;
			const percentY = -((y - centerY) / centerY);

			card.style.transform = `perspective(1000px) rotateY(${percentX * 10}deg) rotateX(${percentY * 10}deg)`;
			content.style.transform = "translateZ(50px)";
			glow.style.opacity = "1";
			glow.style.backgroundImage = `
			radial-gradient(
			circle at
			${x}px ${y}px,
			rgba(16, 185, 129, 0.40),
			rgba(0, 0, 0, 0.05)
			)
		`;
		},
		handleMouseLeave(event) {
			const card = event.currentTarget;
			const content = card.querySelector(".tilt-card-content");
			const glow = card.querySelector(".glow");

			card.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)";
			content.style.transform = "translateZ(0px)";
			glow.style.opacity = "0";
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
		formatTypeName(type) {
			return type.charAt(0).toUpperCase() + type.slice(1);
		},
		formatAbilityName(name) {
			return name
				.split("-")
				.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
				.join(" ");
		},
		getMoveEmoji(category) {
			return (
				{
					physical: "👊",
					special: "✨",
					status: "⭐",
				}[category] || ""
			);
		},
		formatNumber(number) {
			return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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
					return req.display || "";
			}
		},
		shouldShowItemSprite(req) {
			return (
				req.includes("Use Item:") ||
				req.includes("Holding:") ||
				req.toLowerCase().includes("stone")
			);
		},
		formatSpriteLabel(key) {
			return key
				.split(/(?=[A-Z])/)
				.join(" ")
				.toLowerCase()
				.replace(/\b\w/g, (l) => l.toUpperCase());
		},
		formatGeneration(gen) {
			const genNumber = gen.split("-")[1];
			return `Generation ${genNumber}`;
		},
		isGen5OrHigher(gen) {
			const genNum = Number.parseInt(gen.split("-")[1]);
			return genNum >= 5;
		},
		toggleSpriteAccordion(section) {
			this.spriteAccordions[section] = !this.spriteAccordions[section];
		},
		getGenSprites(genSprites) {
			const sprites = {};

			const gameVersions = {
				"red-blue": "Red / Blue",
				yellow: "Yellow",
				gold: "Gold",
				silver: "Silver",
				crystal: "Crystal",
				"ruby-sapphire": "Ruby / Sapphire",
				emerald: "Emerald",
				"firered-leafgreen": "FireRed / LeafGreen",
				"diamond-pearl": "Diamond / Pearl",
				platinum: "Platinum",
				"heartgold-soulsilver": "HeartGold / SoulSilver",
				"black-white": "Black / White",
				"black-2-white-2": "Black 2 / White 2",
				"x-y": "X / Y",
				"omega-ruby-alpha-sapphire": "Omega Ruby / Alpha Sapphire",
				"sun-moon": "Sun / Moon",
				"ultra-sun-ultra-moon": "Ultra Sun / Ultra Moon",
				"sword-shield": "Sword / Shield",
				"brilliant-diamond-shining-pearl": "Brilliant Diamond / Shining Pearl",
				"legends-arceus": "Legends: Arceus",
				"scarlet-violet": "Scarlet / Violet",
			};

			if (genSprites?.["black-white"]?.animated) {
				sprites["black-white"] = {
					static: {
						front_default: genSprites["black-white"].front_default,
						back_default: genSprites["black-white"].back_default,
						front_shiny: genSprites["black-white"].front_shiny,
						back_shiny: genSprites["black-white"].back_shiny,
					},
					animated: {
						front_default: genSprites["black-white"].animated.front_default,
						back_default: genSprites["black-white"].animated.back_default,
						front_shiny: genSprites["black-white"].animated.front_shiny,
						back_shiny: genSprites["black-white"].animated.back_shiny,
					},
					label: gameVersions["black-white"],
				};
			}

			// Process other versions
			for (const [version, versionData] of Object.entries(genSprites)) {
				if (version === "animated") continue;

				const spriteUrls = {
					front_default: versionData.front_default,
					front_shiny: versionData.front_shiny,
					back_default: versionData.back_default,
					back_shiny: versionData.back_shiny,
				};

				// Only add version if it has at least one sprite
				if (Object.values(spriteUrls).some((url) => url)) {
					sprites[version] = {
						static: spriteUrls,
						label: gameVersions[version] || version,
					};
				}
			}

			return sprites;
		},
		async playCry(type) {
			if (type === "legacy" && this.isPlayingLegacy) return;
			if (type === "latest" && this.isPlayingLatest) return;

			await this.stopAllCries();

			this.isAudioLoading[type] = true;

			try {
				if (!this.audioPlayers[type]) {
					this.audioPlayers[type] = new Audio();
				}

				const audio = this.audioPlayers[type];
				audio.src = this.selectedPokemon.cries[type];

				audio.addEventListener("ended", () => {
					if (type === "legacy") {
						this.isPlayingLegacy = false;
					} else {
						this.isPlayingLatest = false;
					}
				});

				audio.addEventListener("loadeddata", () => {
					this.isAudioLoading[type] = false;
				});

				audio.addEventListener("error", (e) => {
					console.error(`Error loading ${type} cry:`, e);
					this.isAudioLoading[type] = false;
				});

				// Play the cry
				await audio.play();

				// Update playing state
				if (type === "legacy") {
					this.isPlayingLegacy = true;
				} else {
					this.isPlayingLatest = true;
				}
			} catch (error) {
				console.error(`Error playing ${type} cry:`, error);
				this.isAudioLoading[type] = false;
				if (type === "legacy") {
					this.isPlayingLegacy = false;
				} else {
					this.isPlayingLatest = false;
				}
			}
		},

		async stopAllCries() {
			// Stop all currently playing cries
			for (const type of ["legacy", "latest"]) {
				if (this.audioPlayers[type]) {
					this.audioPlayers[type].pause();
					this.audioPlayers[type].currentTime = 0;
				}
			}
			this.isPlayingLegacy = false;
			this.isPlayingLatest = false;
			this.isAudioLoading = {
				legacy: false,
				latest: false,
			};
		},
		async fetchSprites(pokemonId) {
			try {
				if (!pokemonId) {
					throw new Error("Pokemon ID is required");
				}

				// Fetch basic sprites
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon/${pokemonId}`,
				);
				const sprites = response.data.sprites;
				const pokemonName = response.data.name.toLowerCase();

				this.spriteData.mainSprites = {
					frontDefault: sprites.front_default || null,
					backDefault: sprites.back_default || null,
					frontShiny: sprites.front_shiny || null,
					backShiny: sprites.back_shiny || null,
				};

				this.spriteData.showdownSprites = {
					frontDefault: `https://play.pokemonshowdown.com/sprites/gen5/${pokemonName}.png`,
					backDefault: `https://play.pokemonshowdown.com/sprites/gen5-back/${pokemonName}.png`,
					frontShiny: `https://play.pokemonshowdown.com/sprites/gen5-shiny/${pokemonName}.png`,
					backShiny: `https://play.pokemonshowdown.com/sprites/gen5-back-shiny/${pokemonName}.png`,
					// Animated sprites
					frontDefaultAnimated: `https://play.pokemonshowdown.com/sprites/ani/${pokemonName}.gif`,
					backDefaultAnimated: `https://play.pokemonshowdown.com/sprites/ani-back/${pokemonName}.gif`,
					frontShinyAnimated: `https://play.pokemonshowdown.com/sprites/ani-shiny/${pokemonName}.gif`,
					backShinyAnimated: `https://play.pokemonshowdown.com/sprites/ani-back-shiny/${pokemonName}.gif`,
				};

				this.spriteData.officialArtwork = {
					officialArtwork:
						sprites.other?.["official-artwork"]?.front_default || null,
					officialArtworkShiny:
						sprites.other?.["official-artwork"]?.front_shiny || null,
				};

				this.spriteData.pokemonHome = {
					default: sprites.other?.home?.front_default || null,
					shiny: sprites.other?.home?.front_shiny || null,
				};

				// Dreamworld
				this.spriteData.dreamworld =
					sprites.other?.dream_world?.front_default || null;

				this.spriteData.generationalSprites = {
					"gen-1": {
						"red-blue": sprites.versions?.["generation-i"]?.["red-blue"] || {},
						yellow: sprites.versions?.["generation-i"]?.yellow || {},
					},
					"gen-2": {
						crystal: sprites.versions?.["generation-ii"]?.crystal || {},
						gold: sprites.versions?.["generation-ii"]?.gold || {},
						silver: sprites.versions?.["generation-ii"]?.silver || {},
					},
					"gen-3": {
						emerald: sprites.versions?.["generation-iii"]?.emerald || {},
						"ruby-sapphire":
							sprites.versions?.["generation-iii"]?.["ruby-sapphire"] || {},
						"firered-leafgreen":
							sprites.versions?.["generation-iii"]?.["firered-leafgreen"] || {},
					},
					"gen-4": {
						"diamond-pearl":
							sprites.versions?.["generation-iv"]?.["diamond-pearl"] || {},
						platinum: sprites.versions?.["generation-iv"]?.platinum || {},
						"heartgold-soulsilver":
							sprites.versions?.["generation-iv"]?.["heartgold-soulsilver"] ||
							{},
					},
					"gen-5": {
						"black-white": {
							static: {
								front_default:
									sprites.versions?.["generation-v"]?.["black-white"]
										?.front_default,
								back_default:
									sprites.versions?.["generation-v"]?.["black-white"]
										?.back_default,
								front_shiny:
									sprites.versions?.["generation-v"]?.["black-white"]
										?.front_shiny,
								back_shiny:
									sprites.versions?.["generation-v"]?.["black-white"]
										?.back_shiny,
							},
							animated:
								sprites.versions?.["generation-v"]?.["black-white"]?.animated ||
								{},
						},
						"black-2-white-2": {
							static: {
								front_default:
									sprites.versions?.["generation-v"]?.["black-2-white-2"]
										?.front_default,
								back_default:
									sprites.versions?.["generation-v"]?.["black-2-white-2"]
										?.back_default,
								front_shiny:
									sprites.versions?.["generation-v"]?.["black-2-white-2"]
										?.front_shiny,
								back_shiny:
									sprites.versions?.["generation-v"]?.["black-2-white-2"]
										?.back_shiny,
							},
							animated:
								sprites.versions?.["generation-v"]?.["black-2-white-2"]
									?.animated || {},
						},
					},
					"gen-6": {
						"x-y": sprites.versions?.["generation-vi"]?.["x-y"] || {},
						"omega-ruby-alpha-sapphire":
							sprites.versions?.["generation-vi"]?.[
								"omega-ruby-alpha-sapphire"
							] || {},
					},
					"gen-7": {
						"sun-moon":
							sprites.versions?.["generation-vii"]?.["sun-moon"] || {},
						"ultra-sun-ultra-moon":
							sprites.versions?.["generation-vii"]?.["ultra-sun-ultra-moon"] ||
							{},
					},
					"gen-8": {
						"sword-shield":
							sprites.versions?.["generation-viii"]?.["sword-shield"] || {},
						"brilliant-diamond-shining-pearl":
							sprites.versions?.["generation-viii"]?.[
								"brilliant-diamond-shining-pearl"
							] || {},
						"legends-arceus":
							sprites.versions?.["generation-viii"]?.["legends-arceus"] || {},
					},
					"gen-9": {
						"scarlet-violet":
							sprites.versions?.["generation-ix"]?.["scarlet-violet"] || {},
					},
				};

				// Icon sprite
				const genNumber = Math.floor((pokemonId - 1) / 151) + 1;

				if (genNumber >= 8) {
					this.spriteData.icon =
						sprites.other?.home?.front_default ||
						// Fallback to official artwork scaled down
						sprites.other?.["official-artwork"]?.front_default ||
						// Final fallback to gen 7 icon
						`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vii/icons/${pokemonId}.png`;
				} else {
					// Gen 1-7 use pixelated icons
					this.spriteData.icon = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-viii/icons/${pokemonId}.png`;
				}
			} catch (error) {
				console.error("Error fetching sprites:", error);
				this.spriteData = {
					mainSprites: {},
					showdownSprites: {},
					officialArtwork: {},
					pokemonHome: {},
					dreamworld: null,
					generationalSprites: {},
					icon: null,
				};
			}
		},
		getItemName(req) {
			const itemMatch = req.match(/(Use Item:|Holding:)\s+(.+)/);
			return itemMatch ? itemMatch[2].toLowerCase().trim() : "";
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
			// Add more robust null checks
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
		async handleVarietyClick(variety) {
			try {
				const response = await axios.get(
					`https://pokeapi.co/api/v2/pokemon/${variety.id}`,
				);

				const pokemon = {
					id: variety.id,
					name: variety.name,
					sprite: this.getOfficialArtwork(variety.id),
					shinySprite: this.getOfficialArtworkShiny(variety.id),
					url: `https://pokeapi.co/api/v2/pokemon/${variety.id}`,
					types: response.data.types.map((t) => t.type.name),
				};

				this.selectedPokemon = null;
				this.evolutionChain = [];
				await this.openModal(pokemon);
			} catch (error) {
				console.error("Error fetching variety data:", error);
			}
		},
		async closeModal() {
			await this.stopAllCries();
			this.updateSelectedPokemon(null);
			this.evolutionChain = [];
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
			await this.openModal(pokemon);
		},
		async restoreModalState() {
			try {
				const savedState = localStorage.getItem("pokemonModalState");
				if (!savedState) return;

				const state = JSON.parse(savedState);

				// Create complete Pokemon object with all saved data
				const pokemon = {
					id: state.pokemonId,
					name: state.name,
					sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${state.pokemonId}.png`,
					shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${state.pokemonId}.png`,
					currentSprite: state.currentSprite,
					url: `https://pokeapi.co/api/v2/pokemon/${state.pokemonId}`,
					types: state.types || [],
					generation: state.generation,
					genus: state.genus,
					shape: state.shape,
					color: state.color,
					weight: state.weight,
					height: state.height,
					abilities: state.abilities || [],
					breeding: state.breeding || {
						genderRate: undefined,
						growthRate: "",
						hatchCounter: 0,
						eggGroups: [],
						habitat: "",
					},
					training: state.training || {
						evYield: [],
						catchRate: 0,
						baseHappiness: 0,
						baseExp: 0,
						heldItems: [],
					},
					forms: state.forms || {
						hasAlternativeForms: false,
						varieties: [],
						hasGenderDifferences: false,
						genderDifferencesDescription: "",
						maleSprite: null,
						femaleSprite: null,
					},
					description: state.description,
					stats: state.stats || [],
					detailsFetched: true,
				};

				// Fetch fresh data if needed
				if (!pokemon.detailsFetched) {
					await this.fetchPokemonDetails(pokemon);
				}

				await this.openModal(pokemon);

				// Restore sprite state
				this.isNormalSprite = state.isNormalSprite;
				if (this.selectedPokemon) {
					this.selectedPokemon.currentSprite = state.currentSprite;
				}
			} catch (error) {
				console.error("Error restoring modal state:", error);
				localStorage.removeItem("pokemonModalState");
			}
		},

		async openModal(pokemon) {
			try {
				if (!pokemon.detailsFetched) {
					await this.fetchPokemonDetails(pokemon);
				}

				const pokemonData = {
					...pokemon,
					breeding: {
						genderRate: undefined,
						growthRate: "",
						hatchCounter: 0,
						eggGroups: [],
						habitat: "",
						...pokemon.breeding,
					},
					forms: {
						hasAlternativeForms: false,
						varieties: [],
						hasGenderDifferences: false,
						genderDifferencesDescription: "",
						maleSprite: null,
						femaleSprite: null,
						...pokemon.forms,
					},
					training: {
						evYield: [],
						catchRate: 0,
						baseHappiness: 0,
						baseExp: 0,
						heldItems: [],
						...pokemon.training,
					},
				};

				await this.fetchSprites(pokemon.id);
				this.updateSelectedPokemon(pokemonData);
				await this.fetchEvolutionChain(pokemonData.id);
				this.saveModalState();
			} catch (error) {
				console.error("Error opening modal:", error);
			}
		},
	},
	computed: {
		totalStats() {
			return (
				this.selectedPokemon?.stats?.reduce(
					(total, stat) => total + stat.base_stat,
					0,
				) || 0
			);
		},
		maxStat() {
			return 255;
		},
		displayedPages() {
			const total = this.totalPages;
			const current = this.page;
			const delta = 2;

			let pages = [];

			if (total <= 7) {
				pages = Array.from({ length: total }, (_, i) => i + 1);
			} else {
				pages.push(1);

				if (current - delta <= 2) {
					const showPages = Array.from({ length: 4 }, (_, i) => i + 1);
					pages.push(...showPages);
					pages.push("...", total);
				} else if (current + delta >= total - 1) {
					pages.push("...");
					const showPages = Array.from({ length: 4 }, (_, i) => total - 4 + i);
					pages.push(...showPages);
				} else {
					pages.push("...");
					for (let i = current - delta; i <= current + delta; i++) {
						pages.push(i);
					}
					pages.push("...", total);
				}
			}

			return [...new Set(pages)];
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

.tilt-card {
  transform-style: preserve-3d;
  transform: perspective(1000px);
}

.tilt-card-content {
  transform: translateZ(50px);
}

.glow {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 1rem;
  background-image: radial-gradient(circle at 50% -20%, rgba(15, 119, 84, 0.15), rgba(0, 0, 0, 0.05));
}

.rotate-180 {
  transform: rotate(180deg);
}

.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}

.group:hover .group-hover\:visible {
  visibility: visible;
}

.transition-transform {
  transition: transform 0.2s;
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

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.rotate-180 {
  transform: rotate(180deg);
}

/* Optional: Add smooth height transition for accordion content */
.transition-all {
  transition: all 0.2s ease-in-out;
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

.pixelated {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
</style>