<template>
  <footer
    class="bg-white border border-gray-300 rounded-lg shadow-md m-4 mx-auto"
  >
    <div class="w-full max-w-screen-xl mx-auto p-6 md:py-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <a
          href="https://pokenuxt.nuxt.dev/"
          class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
        >
          <img src="/rotom.avif" class="h-12" alt="PokeNuxt Logo" />
          <span
            class="self-center text-2xl font-bold whitespace-nowrap bg-gradient-to-t from-emerald-500 to-emerald-900 bg-clip-text text-transparent"
            >PokeNuxt</span
          >
        </a>
        <div class="flex items-center space-x-4">
          <ul
            class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0"
          >
            <li>
              <a
                href="https://pokenuxt.nuxt.dev/"
                class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
              >
                <span class="self-center text-2xl font-semibold whitespace-nowrap"
                  >Powered by</span
                >
                <img src="/pokeapi.avif" class="h-8" alt="PokeNuxt Logo" />
              </a>
            </li>
          </ul>
        </div>
      </div>
      <hr class="my-6 border-gray-300 sm:my-8" />
      <span class="block text-sm text-gray-500 sm:text-center"
        >© {{ currentYear }}
        <a
          href="https://github.com/KurutoDenzeru/PokeNuxt"
          class="hover:underline"
          >PokeNuxt</a
        >. All Rights Reserved.</span
      >
    </div>
  </footer>
</template>

<script>
import { ref } from "vue";

export default {
	name: "Footer",
	setup() {
		const currentYear = ref(new Date().getFullYear());

		return {
			currentYear,
		};
	},
};
</script>