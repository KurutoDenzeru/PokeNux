import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
    const theme = ref<Theme>('system');
    const isDark = ref(false);

    // Check if we're on the client side
    const isClient = typeof window !== 'undefined';

    // Apply theme to document
    const applyTheme = (newTheme: Theme) => {
        if (!isClient) return;

        // Save theme preference to localStorage
        localStorage.setItem('theme', newTheme);
        theme.value = newTheme;

        // Determine if we should use dark mode
        if (newTheme === 'system') {
            isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
            isDark.value = newTheme === 'dark';
        }

        // Apply dark class to document
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Initialize theme on mount
    onMounted(() => {
        if (!isClient) return;

        // Get saved theme from localStorage or default to system
        const savedTheme = localStorage.getItem('theme') as Theme || 'system';
        applyTheme(savedTheme);

        // Watch for system preference changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (theme.value === 'system') {
                isDark.value = mediaQuery.matches;
                if (isDark.value) {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            }
        };

        mediaQuery.addEventListener('change', handleChange);

        // Call handleChange once to ensure the system theme is applied correctly
        handleChange();
    });

    // Watch for theme changes
    watch(theme, (newTheme) => {
        applyTheme(newTheme);
    });

    return {
        theme,
        isDark,
        setTheme: applyTheme
    };
};