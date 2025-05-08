// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	modules: ["@nuxtjs/tailwindcss", "nuxt-vitalizer", "@nuxtjs/sitemap"],
	compatibilityDate: "2024-11-01",
	devtools: {
		enabled: true,
	},
	css: ["~/assets/css/main.css"],
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
		routeRules: {
			'/**': {
				headers: {
					'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
					'X-Content-Type-Options': 'nosniff',
					'X-Frame-Options': 'DENY',
					'X-XSS-Protection': '1; mode=block',
					'Referrer-Policy': 'strict-origin-when-cross-origin',

					'Content-Security-Policy':
						"default-src 'self'; " +
						"script-src 'self' 'unsafe-inline'; " +
						"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
						"img-src 'self' data: https://*.pokeapi.co https://raw.githubusercontent.com https://play.pokemonshowdown.com; " +
						"font-src 'self' https://fonts.gstatic.com; " +
						"connect-src 'self' https://pokeapi.co https://api.pokemontcg.io; " +
						"object-src 'none'; " +
						"frame-src 'none'; " +
						"form-action 'self'"
				}
			}
		}
	},
	site: {
		url: 'https://pokenux.nuxt.dev/',
		name: 'PokéNux',
		description: 'Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind CSS, and powered by PokéAPI and the Pokémon TCG API. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG card stats, rarities, and sets.',
	},
	app: {
		head: {
			title: "PokéNux",
			meta: [
				{ charset: "utf-8" },
				{ name: "viewport", content: "width=device-width, initial-scale=1" },
				{
					name: "description",
					content:
						"Sleek and responsive Pokédex built with Nuxt.js, styled using Tailwind CSS, and powered by PokéAPI and the Pokémon TCG API. It provides an intuitive interface for exploring Pokémon details and a comprehensive database of Pokémon TCG card stats, rarities, and sets.",
				},
			],
			link: [
				{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
				{ rel: "canonical", href: "https://pokenux.nuxt.dev/" }
			],
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