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
