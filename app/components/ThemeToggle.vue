<template>
  <Tabs :model-value="current" class="w-full" @update:model-value="onThemeChange">
    <TabsList class="h-10 border border-zinc-200/80 bg-zinc-100/90 p-1 dark:border-zinc-800 dark:bg-zinc-900/80">
      <TabsTrigger value="light" aria-label="Light theme" :class="triggerClass">
        <Sun class="w-4 h-4" :class="iconClass('light')" />
      </TabsTrigger>
      <TabsTrigger value="system" aria-label="System theme" :class="triggerClass">
        <Monitor class="w-4 h-4" :class="iconClass('system')" />
      </TabsTrigger>
      <TabsTrigger value="dark" aria-label="Dark theme" :class="triggerClass">
        <Moon class="w-4 h-4" :class="iconClass('dark')" />
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import { Sun, Moon, Monitor } from 'lucide-vue-next'
  import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

  type Theme = 'light' | 'dark' | 'system'

  const current = ref<Theme>('system')
  const triggerClass = 'data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:border-zinc-700 dark:data-[state=active]:shadow-md dark:data-[state=active]:shadow-black/40'
  let mediaQuery: MediaQueryList | null = null
  let mediaQueryHandler: ((event: MediaQueryListEvent) => void) | null = null

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

  const onThemeChange = (value: string | undefined) => {
    if (value === 'light' || value === 'dark' || value === 'system') {
      setTheme(value)
    }
  }

  const iconClass = (theme: Theme) => {
    return current.value === theme
      ? 'text-emerald-600 dark:text-emerald-300'
      : 'text-muted-foreground dark:text-zinc-400'
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    current.value = saved
    applyThemeClass(saved)

    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryHandler = () => {
      if (current.value === 'system') applyThemeClass('system')
    }
    mediaQuery.addEventListener('change', mediaQueryHandler)
  })

  onBeforeUnmount(() => {
    if (mediaQuery && mediaQueryHandler) {
      mediaQuery.removeEventListener('change', mediaQueryHandler)
    }
  })
</script>
