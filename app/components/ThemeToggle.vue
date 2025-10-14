<template>
  <div class="inline-flex items-center gap-2">
    <Button variant="outline" aria-label="Light theme" :class="buttonClass(current === 'light')"
      @click="setTheme('light')">
      <Sun class="w-4 h-4" :class="current === 'light' ? 'text-emerald-600' : 'text-muted-foreground'" />
    </Button>
    <Button variant="outline" aria-label="System theme" :class="buttonClass(current === 'system')"
      @click="setTheme('system')">
      <Monitor class="w-4 h-4" :class="current === 'system' ? 'text-emerald-600' : 'text-muted-foreground'" />
    </Button>
    <Button variant="outline" aria-label="Dark theme" :class="buttonClass(current === 'dark')"
      @click="setTheme('dark')">
      <Moon class="w-4 h-4" :class="current === 'dark' ? 'text-emerald-600' : 'text-muted-foreground'" />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Sun, Moon, Monitor } from 'lucide-vue-next'

  type Theme = 'light' | 'dark' | 'system'

  const current = ref<Theme>('system')

  const applyThemeClass = (theme: Theme) => {
    if (typeof window === 'undefined') return
    if (theme === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', systemIsDark)
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    }
  }

  const setTheme = (theme: Theme) => {
    current.value = theme
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('theme', theme) } catch { }
      applyThemeClass(theme)
    }
  }

  const buttonClass = (active: boolean) => {
    return [
      'inline-flex items-center justify-center p-2 rounded-md cursor-pointer',
      active ? 'border-emerald-500 text-emerald-600 font-bold' : 'border text-muted-foreground',
      'bg-transparent'
    ].join(' ')
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    current.value = saved
    applyThemeClass(saved)
    // Listen for system changes when in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (current.value === 'system') applyThemeClass('system')
    })
  })
</script>
