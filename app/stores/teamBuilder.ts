import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchWithRetry, type FetchResult } from '@/lib/fetchUtils'

export interface TeamMember {
  pokemonId: number | null
  pokemonName: string
}

export interface Team {
  name: string
  members: TeamMember[]
}

export const useTeamBuilderStore = defineStore('teamBuilder', () => {
  const teams = ref<Team[]>([])
  const activeTeamId = ref<string | null>(null)

  // Initialize from storage and URL parameters (now async)
  const initializeFromStorage = async () => {
    if (typeof window !== 'undefined') {
      // Load teams from IndexedDB or localStorage
      await loadFromStorage()

      const urlParams = new URLSearchParams(window.location.search)
      const teamFromUrl = urlParams.get('team')

      if (teamFromUrl) {
        try {
          const importedTeam = JSON.parse(atob(teamFromUrl))
          const existingIndex = teams.value.findIndex(t => t.name === importedTeam.name)
          if (existingIndex >= 0) {
            teams.value[existingIndex] = importedTeam
          } else {
            teams.value.push(importedTeam)
          }
          activeTeamId.value = importedTeam.name
          await saveToStorage()
          updateUrlWithTeam()
        } catch (error) {
          console.warn('Failed to import team from URL:', error)
        }
      }
    }
  }

  // Initialize IndexedDB
  const initializeDB = async (): Promise<IDBDatabase | null> => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open('pokenux-db', 2)

      request.onerror = () => {
        console.error('IndexedDB open error:', request.error)
        resolve(null)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        // Delete old object store if it exists (migration from id-based to name-based)
        if (db.objectStoreNames.contains('teams')) {
          db.deleteObjectStore('teams')
        }
        // Create new object store with name as keyPath
        db.createObjectStore('teams', { keyPath: 'name' })
      }
    })
  }

  // Helper: Clean team data for storage (remove non-serializable properties)
  const cleanTeamForStorage = (team: Team): Team => {
    return {
      name: team.name,
      members: team.members.map(m => ({
        pokemonId: m.pokemonId,
        pokemonName: m.pokemonName
      }))
    }
  }

  // Save to IndexedDB with localStorage fallback (async, non-blocking)
  const saveToStorage = () => {
    if (typeof window === 'undefined') {
      return
    }

    const data = {
      teams: teams.value,
      activeTeamName: activeTeamId.value
    }

      // Fire and forget - save in background
      ; (async () => {
        try {
          const db = await initializeDB()
          if (db) {
            const transaction = db.transaction(['teams'], 'readwrite')
            const store = transaction.objectStore('teams')

            // First, clear all existing teams (except metadata)
            const allKeysRequest = store.getAllKeys()

            await new Promise<void>((resolve, reject) => {
              allKeysRequest.onsuccess = () => {
                const keys = allKeysRequest.result as string[]
                // Delete all keys except metadata
                for (const key of keys) {
                  if (key !== '__metadata__') {
                    store.delete(key)
                  }
                }
                resolve()
              }
              allKeysRequest.onerror = () => reject(allKeysRequest.error)
            })

            // Save each team individually for better performance (cleaned for serialization)
            for (const team of teams.value) {
              store.put(cleanTeamForStorage(team))
            }

            // Save metadata
            store.put({
              name: '__metadata__',
              activeTeamName: activeTeamId.value,
              isMetadata: true,
              members: []
            } as any)

            // Wait for transaction to complete
            await new Promise<void>((resolve, reject) => {
              transaction.oncomplete = () => resolve()
              transaction.onerror = () => reject(transaction.error)
            })
          } else {
            // IndexedDB not available, use localStorage
            saveToLocalStorage(data)
          }
        } catch (error) {
          console.warn('IndexedDB save failed, falling back to localStorage:', error)
          saveToLocalStorage(data)
        }
      })()
  }

  // Helper: Save to localStorage with basic error handling
  const saveToLocalStorage = (data: { teams: Team[]; activeTeamName: string | null }) => {
    try {
      localStorage.setItem('pokenux-teams', JSON.stringify(data))
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('Both IndexedDB and localStorage failed. Storage is full.')
        alert('Storage is full. Please delete some teams to free up space.')
      } else {
        console.error('Failed to save teams:', error)
        alert('Failed to save teams. Please try again.')
      }
    }
  }

  // Load from IndexedDB with localStorage fallback
  const loadFromStorage = async (): Promise<void> => {
    if (typeof window === 'undefined') {
      return
    }

    // Try IndexedDB first
    try {
      const db = await initializeDB()
      if (db) {
        const transaction = db.transaction(['teams'], 'readonly')
        const store = transaction.objectStore('teams')
        const allRequest = store.getAll()

        return new Promise((resolve) => {
          allRequest.onsuccess = () => {
            const records = allRequest.result as any[]
            if (records && records.length > 0) {
              // Filter out metadata
              const loadedTeams = records.filter(r => !r.isMetadata)
              const metadata = records.find(r => r.isMetadata)

              if (loadedTeams.length > 0) {
                teams.value = loadedTeams
                activeTeamId.value = metadata?.activeTeamName || null
                resolve()
                return
              }
            }

            // Fallback to localStorage if IndexedDB is empty
            loadFromLocalStorage()
            resolve()
          }

          allRequest.onerror = () => {
            console.warn('IndexedDB load failed, falling back to localStorage')
            loadFromLocalStorage()
            resolve()
          }
        })
      } else {
        loadFromLocalStorage()
      }
    } catch (error) {
      console.error('IndexedDB error during load:', error)
      loadFromLocalStorage()
    }
  }

  // Helper: Load from localStorage
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('pokenux-teams')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        teams.value = parsed.teams || []
        activeTeamId.value = parsed.activeTeamName || null
      } catch (error) {
        console.error('Failed to parse stored teams:', error)
      }
    }
  }

  // Update URL with current active team
  const updateUrlWithTeam = () => {
    if (typeof window !== 'undefined' && activeTeamId.value) {
      const activeTeam = teams.value.find(t => t.name === activeTeamId.value)
      if (activeTeam) {
        const encoded = btoa(JSON.stringify(activeTeam))
        const url = `${window.location.pathname}?team=${encoded}`
        window.history.replaceState({ team: activeTeamId.value }, '', url)
      }
    }
  }

  // Create a new empty team
  const createTeam = (name: string = 'New Team'): Team => {
    const team: Team = {
      name,
      members: Array(6).fill(null).map(() => ({
        pokemonId: null,
        pokemonName: ''
      }))
    }
    teams.value.push(team)
    activeTeamId.value = team.name
    saveToStorage()
    return team
  }

  // Update team name
  const updateTeamName = (teamName: string, newName: string) => {
    const team = teams.value.find(t => t.name === teamName)
    if (team) {
      team.name = newName
      if (activeTeamId.value === teamName) {
        activeTeamId.value = newName
      }
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Delete team
  const deleteTeam = (teamName: string) => {
    const index = teams.value.findIndex(t => t.name === teamName)
    if (index >= 0) {
      teams.value.splice(index, 1)
      if (activeTeamId.value === teamName) {
        activeTeamId.value = teams.value.length > 0 ? teams.value[0]?.name || null : null
      }
      saveToStorage()
    }
  }

  // Set active team
  const setActiveTeam = (teamName: string) => {
    if (teams.value.find(t => t.name === teamName)) {
      activeTeamId.value = teamName
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Update team member (pokemon)
  const updateTeamMember = (teamName: string, slotIndex: number, member: Partial<TeamMember>) => {
    const team = teams.value.find(t => t.name === teamName)
    if (team && slotIndex >= 0 && slotIndex < 6 && team.members[slotIndex]) {
      const currentMember = team.members[slotIndex]
      team.members[slotIndex] = {
        pokemonId: member.pokemonId ?? currentMember.pokemonId,
        pokemonName: member.pokemonName ?? currentMember.pokemonName
      }
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Clear team member
  const clearTeamMember = (teamName: string, slotIndex: number) => {
    const team = teams.value.find(t => t.name === teamName)
    if (team && slotIndex >= 0 && slotIndex < 6) {
      team.members[slotIndex] = {
        pokemonId: null,
        pokemonName: ''
      }
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Clear entire team
  const clearTeam = (teamName: string) => {
    const team = teams.value.find(t => t.name === teamName)
    if (team) {
      team.members = Array(6).fill(null).map(() => ({
        pokemonId: null,
        pokemonName: ''
      }))
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Get active team
  const activeTeam = computed(() => {
    return teams.value.find(t => t.name === activeTeamId.value)
  })

  // Get filled slots count
  const filledSlotsCount = computed(() => {
    if (!activeTeam.value) return 0
    return activeTeam.value.members.filter(m => m.pokemonId !== null).length
  })

  // Export team as JSON
  const exportTeamAsJson = (teamName: string): string | null => {
    const team = teams.value.find(t => t.name === teamName)
    return team ? JSON.stringify(team, null, 2) : null
  }

  // Export team as URL
  const exportTeamAsUrl = (teamName: string): string | null => {
    const team = teams.value.find(t => t.name === teamName)
    if (!team) return null
    const encoded = btoa(JSON.stringify(team))
    return `${window.location.origin}${window.location.pathname}?team=${encoded}`
  }

  // Import team from JSON
  const importTeamFromJson = (jsonString: string, targetTeamName?: string): boolean => {
    try {
      const imported = JSON.parse(jsonString)
      // Validate structure: must have name and 6 members
      if (imported.name && Array.isArray(imported.members) && imported.members.length === 6) {
        // If targeting a specific team, update it instead of creating new
        if (targetTeamName) {
          const team = teams.value.find(t => t.name === targetTeamName)
          if (team) {
            team.members = imported.members
            saveToStorage()
            updateUrlWithTeam()
            return true
          }
        }

        // Otherwise, create a new team with unique name
        let teamName = imported.name
        let counter = 1

        // If a team with this name exists, create a unique name by appending a number
        while (teams.value.some(t => t.name === teamName)) {
          teamName = `${imported.name} (${counter})`
          counter++
        }

        const teamToImport: Team = {
          name: teamName,
          members: imported.members
        }

        teams.value.push(teamToImport)
        activeTeamId.value = teamToImport.name
        saveToStorage() // Fire and forget - saves in background with IndexedDB
        updateUrlWithTeam()
        return true
      }
    } catch (error) {
      console.error('Failed to import team:', error)
    }
    return false
  }

  // Duplicate team
  const duplicateTeam = (teamName: string): boolean => {
    const team = teams.value.find(t => t.name === teamName)
    if (!team) return false

    // Find a unique name for the duplicate
    let newName = `${teamName} (Copy)`
    let counter = 1
    while (teams.value.some(t => t.name === newName)) {
      newName = `${teamName} (Copy ${counter})`
      counter++
    }

    // Create the duplicate
    const duplicatedTeam: Team = {
      name: newName,
      members: team.members.map(m => ({
        pokemonId: m.pokemonId,
        pokemonName: m.pokemonName
      }))
    }

    teams.value.push(duplicatedTeam)
    activeTeamId.value = duplicatedTeam.name
    saveToStorage()
    updateUrlWithTeam()
    return true
  }

  // Randomize team (fill with random pokemon)
  const randomizeTeam = async (teamName: string) => {
    const team = teams.value.find(t => t.name === teamName)
    if (!team) return

    try {
      // Fetch random pokemon IDs (1-1025) with retry logic and timeout protection
      for (let i = 0; i < 6; i++) {
        const randomId = Math.floor(Math.random() * 1025) + 1
        
        const result = await fetchWithRetry<{ id: number; name: string }>(
          `https://pokeapi.co/api/v2/pokemon/${randomId}`,
          {
            retries: 2,        // Retry up to 2 times for a total of 3 attempts
            timeout: 5000,     // 5 second timeout per attempt
            initialDelay: 500  // Start with 500ms backoff
          }
        )

        if (result.success && result.data) {
          team.members[i] = {
            pokemonId: result.data.id,
            pokemonName: result.data.name
          }
        } else {
          // On failure, leave the slot empty with a warning
          console.warn(`Failed to fetch random Pokemon (${randomId}) after ${result.attempts} attempts:`, result.error?.message)
          team.members[i] = {
            pokemonId: null,
            pokemonName: ''
          }
        }
      }
      saveToStorage()
      updateUrlWithTeam()
    } catch (error) {
      console.error('Failed to randomize team:', error)
    }
  }

  // Reorder team members by swapping positions
  const reorderTeamMembers = (teamName: string, fromIndex: number, toIndex: number) => {
    const team = teams.value.find(t => t.name === teamName)
    if (!team || fromIndex < 0 || toIndex < 0 || fromIndex >= 6 || toIndex >= 6) return

    // Swap the members
    const temp = team.members[fromIndex]!
    team.members[fromIndex] = team.members[toIndex]!
    team.members[toIndex] = temp

    saveToStorage()
    updateUrlWithTeam()
  }

  return {
    teams,
    activeTeamId,
    activeTeam,
    filledSlotsCount,
    initializeFromStorage,
    createTeam,
    updateTeamName,
    deleteTeam,
    setActiveTeam,
    updateTeamMember,
    clearTeamMember,
    clearTeam,
    exportTeamAsJson,
    exportTeamAsUrl,
    importTeamFromJson,
    duplicateTeam,
    randomizeTeam,
    reorderTeamMembers
  }
})
