import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-01-13',
	devtools: { enabled: false },
	modules: [
		'@nuxt/image',
		'shadcn-nuxt',
		'@pinia/nuxt',
		'nuxt-vitalizer',
	],

	css: ['~/assets/css/tailwind.css'],
	vite: {
		plugins: [tailwindcss()] as any,
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
})