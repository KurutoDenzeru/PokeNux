<template>
  <div class="fixed top-4 right-4 z-50 ml-auto w-fit">
  <button
    @click="toggleTheme"
    @keydown="handleKeyDown"
    class="rounded-md p-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
    aria-label="Toggle theme"
    tabindex="0"
  >
    <!-- Sun icon for light mode -->
    <svg
      v-if="currentIcon === 'light'"
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="gray"
    >
      <path
        fill-rule="evenodd"
        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
        clip-rule="evenodd"
      />
    </svg>
    <!-- Moon icon for dark mode -->
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>
  </button>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useTheme } from '~/composables/useTheme';

export default {
  name: 'ThemeSwitcher',
  setup() {
    const { theme, setTheme } = useTheme();

    // Compute the current icon based on theme
    const currentIcon = computed(() => {
      return theme.value === 'light' ? 'light' : 'dark';
    });

    const toggleTheme = () => {
      setTheme(theme.value === 'light' ? 'dark' : 'light');
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleTheme();
      }
    };

    return {
      currentIcon,
      toggleTheme,
      handleKeyDown
    };
  }
};
</script>