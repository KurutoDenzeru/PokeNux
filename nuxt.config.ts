// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxtjs/tailwindcss", "nuxt-vitalizer"],
	compatibilityDate: "2024-04-03",
	devtools: { enabled: false },
	// css: ["~/assets/css/main.css"],
	experimental: {
		payloadExtraction: false,
	},
	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},
	nitro: {
		prerender: {
			routes: ["/"],
		},
	},
	app: {
		head: {
			title: "PokeNuxt",
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{
					name: "description",
					content:
						"Sleek Pokédex with detailed Pokémon info, built with Nuxt.js, Tailwind CSS, and PokéAPI.",
				},
			],
			link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
		},
		baseURL: "/",
		buildAssetsDir: "/_nuxt/",
		pageTransition: {
			name: "fade",
			mode: "out-in",
		},
		layoutTransition: {
			name: "slide",
			mode: "out-in",
		},
	},

	components: true,
	pages: true,

	tailwindcss: {
		cssPath: ["~/assets/css/main.css", { injectPosition: "first" }],
		configPath: "tailwind.config",
		exposeConfig: {
			level: 2,
		},
		config: {},
		viewer: true,
	},

	vitalizer: {
		disableStylesheets: "entry",
	},
});
