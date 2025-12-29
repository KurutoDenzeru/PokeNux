import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-08-29',
	devtools: { enabled: true },
	modules: [
		'@nuxt/image',
		'shadcn-nuxt',
		'@pinia/nuxt',
		'nuxt-vitalizer',
	],

	css: ['~/assets/css/tailwind.css'],
	vite: {
		plugins: [
			tailwindcss(),
		],
		build: { sourcemap: false },
		optimizeDeps: {
			exclude: ['@vueuse/core']
		},
		ssr: {
			noExternal: ['@vueuse/core']
		}
	},

	// Shadcn
	shadcn: {
		prefix: '',
		componentDir: './app/components/ui'
	},

	components: {
		global: true,
		dirs: [
			'~/layouts',
			'~/components',
			'~/components/ui',
			'~/composables',
		],
	},

	// Nuxt Vitalizer
	vitalizer: {
		// Remove the render-blocking entry CSS
		// disableStylesheets: 'entry',
		// Disable prefetch links
		disablePrefetchLinks: true
	}
})