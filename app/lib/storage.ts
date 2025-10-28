// Safe localStorage wrapper for SSR-safe operations
export const storage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },

  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },

  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },

  clear: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  }
}
