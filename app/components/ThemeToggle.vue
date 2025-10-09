<template>
  <div class="fixed top-4 right-4 z-50">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="outline" size="icon" class="rounded-md shadow-lg bg-white dark:bg-zinc-900">
          <Sun class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-40">
        <DropdownMenuItem @click="setTheme('light')" class="cursor-pointer">
          <Sun class="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('dark')" class="cursor-pointer">
          <Moon class="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem @click="setTheme('system')" class="cursor-pointer">
          <Monitor class="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { Sun, Moon, Monitor } from 'lucide-vue-next'
  import Button from '@/components/ui/button/Button.vue'
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from '@/components/ui/dropdown-menu'

  type Theme = 'light' | 'dark' | 'system'

  const currentTheme = ref<Theme>('system')

  const setTheme = (theme: Theme) => {
    currentTheme.value = theme

    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)

      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', systemTheme === 'dark')
      } else {
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    }
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme || 'system'
      currentTheme.value = savedTheme
      setTheme(savedTheme)
    }
  })
</script>
