<template>
	<div class="flex flex-col items-center gap-4">
		<!-- Pokemon Artwork -->
		<img :src="selectedPokemon.currentSprite || selectedPokemon.sprite" :alt="selectedPokemon.name"
			class="w-auto h-auto mx-auto p-6 drop-shadow-sm animate-bounce" />

		<!-- Controls Container -->
		<div class="flex flex-col md:flex-row md:justify-between items-center w-full mb-4 gap-4">
			<!-- Normal/Shiny Toggle -->
			<div class="inline-flex rounded-md shadow-sm" role="group">
				<button @click="toggleSprite('normal')" type="button" :class="[
            'px-4 py-2 text-sm font-medium border rounded-s-lg focus:z-10 focus:ring-2',
            isNormalSprite ?
              'text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700' :
              'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
          ]">
					Normal
				</button>
				<button @click="toggleSprite('shiny')" type="button" :class="[
            'px-4 py-2 text-sm font-medium border rounded-e-lg focus:z-10 focus:ring-2',
            !isNormalSprite ?
              'text-white bg-emerald-600 border-emerald-600 hover:bg-emerald-700' :
              'text-gray-900 bg-white border-gray-200 hover:bg-gray-100'
          ]">
					Shiny
				</button>
			</div>

			<!-- Cry Buttons -->
			<div class="inline-flex rounded-md shadow-sm" role="group"
				v-if="selectedPokemon?.cries?.legacy || selectedPokemon?.cries?.latest">
				<button v-if="selectedPokemon?.cries?.legacy" @click="playCry('legacy')" type="button" :class="[
					'px-4 py-2 text-sm font-medium border focus:z-10 focus:ring-2',
					'text-gray-900 bg-white border-gray-200 hover:bg-gray-100',
					selectedPokemon?.cries?.latest ? 'rounded-s-lg' : 'rounded-lg' // Adjust rounding if it's the only button
				]" :disabled="!selectedPokemon?.cries?.legacy || isAudioLoading.legacy">
					<span class="flex items-center gap-2">
						<span v-if="isPlayingLegacy || isAudioLoading.legacy"
							:class="{ 'animate-pulse': isAudioLoading.legacy }">
							🔊
						</span>
						Legacy Cry
					</span>
				</button>
				<button v-if="selectedPokemon?.cries?.latest" @click="playCry('latest')" type="button" :class="[
					'px-4 py-2 text-sm font-medium border focus:z-10 focus:ring-2',
					'text-gray-900 bg-white border-gray-200 hover:bg-gray-100',
					selectedPokemon?.cries?.legacy ? 'rounded-e-lg' : 'rounded-lg' // Adjust rounding if it's the only button
				]" :disabled="!selectedPokemon?.cries?.latest || isAudioLoading.latest">
					<span class="flex items-center gap-2">
						<span v-if="isPlayingLatest || isAudioLoading.latest" class="animate-pulse">🔊</span>
						Latest Cry
					</span>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "ArtworkControls",
	props: {
		selectedPokemon: {
			type: Object,
			required: true,
		},
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
			isNormalSprite: true,
		};
	},
	methods: {
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

				await audio.play();

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

		toggleSprite(type) {
			if (!this.selectedPokemon) return;

			const sprite =
				type === "normal"
					? this.selectedPokemon.sprite
					: this.selectedPokemon.shinySprite;

			this.isNormalSprite = type === "normal";
			this.$emit("update-sprite", {
				type,
				sprite,
			});
		},
	},
	beforeUnmount() {
		this.stopAllCries();
	},
};
</script>