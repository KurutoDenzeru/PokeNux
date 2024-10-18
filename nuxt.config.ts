// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-04-03",
	devtools: { enabled: true },
	css: ["~/assets/css/main.css"],

	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

	modules: ["@nuxtjs/seo"],

	site: {
		url: "https://pokenuxt.nuxt.dev/",
		name: "PokeNuxt",
		description:
			"Sleek and responsive Pokédex built with Nuxt,js, styled using Tailwind CSS, and powered by PokéAPI. It offers an intuitive interface for exploring detailed Pokémon information effortlessly.Welcome to my awesome site!",
		defaultLocale: "en", // not needed if you have @nuxtjs/i18n installed
	},
});
