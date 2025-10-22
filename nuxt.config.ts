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
		/**
			* Prefix for all the imported component
			*/
		prefix: '',
		/**
			* Directory that the component lives in.
			* @default "./app/components/ui"
			*/
		componentDir: './app/components/ui'
	},

	// Nuxt Vitalizer
	vitalizer: {
		// Remove the render-blocking entry CSS
		// disableStylesheets: 'entry',
		// Disable prefetch links
		disablePrefetchLinks: true
	}
})