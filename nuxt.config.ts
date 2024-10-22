// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxtjs/tailwindcss", "nuxt-vitalizer"],
	compatibilityDate: "2024-04-03",
	devtools: { enabled: false },
	// css: ["~/assets/css/main.css"],

	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

	app: {
		pageTransition: {
			name: "fade",
			mode: "out-in", // default
		},
		layoutTransition: {
			name: "slide",
			mode: "out-in", // default
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
