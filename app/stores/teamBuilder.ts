import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TeamMember {
  pokemonId: number | null
  pokemonName: string
  moves: string[] // Array of move IDs or names
  nickname: string
}

export interface Team {
  id: string
  name: string
  members: TeamMember[] // Array of exactly 6 members
  createdAt: number
  updatedAt: number
}

export const useTeamBuilderStore = defineStore('teamBuilder', () => {
  const teams = ref<Team[]>([])
  const activeTeamId = ref<string | null>(null)

  // Initialize from localStorage and URL parameters
  const initializeFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedTeams = localStorage.getItem('pokenux-teams')
      const urlParams = new URLSearchParams(window.location.search)
      const teamFromUrl = urlParams.get('team')

      if (storedTeams) {
        try {
          const parsed = JSON.parse(storedTeams)
          teams.value = parsed.teams || []
          activeTeamId.value = parsed.activeTeamId || null

          // Override with URL parameter if present
          if (teamFromUrl) {
            try {
              const importedTeam = JSON.parse(atob(teamFromUrl))
              const existingIndex = teams.value.findIndex(t => t.id === importedTeam.id)
              if (existingIndex >= 0) {
                teams.value[existingIndex] = importedTeam
              } else {
                teams.value.push(importedTeam)
              }
              activeTeamId.value = importedTeam.id
              updateUrlWithTeam()
            } catch (error) {
              console.warn('Failed to import team from URL:', error)
            }
          }
        } catch (error) {
          console.warn('Failed to parse stored teams:', error)
        }
      } else if (teamFromUrl) {
        try {
          const importedTeam = JSON.parse(atob(teamFromUrl))
          teams.value = [importedTeam]
          activeTeamId.value = importedTeam.id
          saveToStorage()
        } catch (error) {
          console.warn('Failed to import team from URL:', error)
        }
      }
    }
  }

  // Save to localStorage
  const saveToStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'pokenux-teams',
        JSON.stringify({
          teams: teams.value,
          activeTeamId: activeTeamId.value
        })
      )
    }
  }

  // Update URL with current active team
  const updateUrlWithTeam = () => {
    if (typeof window !== 'undefined' && activeTeamId.value) {
      const activeTeam = teams.value.find(t => t.id === activeTeamId.value)
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
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      members: Array(6).fill(null).map(() => ({
        pokemonId: null,
        pokemonName: '',
        moves: [],
        nickname: ''
      })),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    teams.value.push(team)
    activeTeamId.value = team.id
    saveToStorage()
    return team
  }

  // Update team name
  const updateTeamName = (teamId: string, newName: string) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.name = newName
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Delete team
  const deleteTeam = (teamId: string) => {
    const index = teams.value.findIndex(t => t.id === teamId)
    if (index >= 0) {
      teams.value.splice(index, 1)
      if (activeTeamId.value === teamId) {
        activeTeamId.value = teams.value.length > 0 ? teams.value[0]?.id || null : null
      }
      saveToStorage()
    }
  }

  // Set active team
  const setActiveTeam = (teamId: string) => {
    if (teams.value.find(t => t.id === teamId)) {
      activeTeamId.value = teamId
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Update team member (pokemon)
  const updateTeamMember = (teamId: string, slotIndex: number, member: Partial<TeamMember>) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team && slotIndex >= 0 && slotIndex < 6 && team.members[slotIndex]) {
      const currentMember = team.members[slotIndex]
      team.members[slotIndex] = {
        pokemonId: member.pokemonId ?? currentMember.pokemonId,
        pokemonName: member.pokemonName ?? currentMember.pokemonName,
        moves: member.moves ?? currentMember.moves,
        nickname: member.nickname ?? currentMember.nickname
      }
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Add move to team member
  const addMoveToMember = (teamId: string, slotIndex: number, moveId: string) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team && slotIndex >= 0 && slotIndex < 6 && team.members[slotIndex]) {
      const member = team.members[slotIndex]
      if (member?.moves && member.moves.length < 4 && !member.moves.includes(moveId)) {
        member.moves.push(moveId)
        team.updatedAt = Date.now()
        saveToStorage()
        updateUrlWithTeam()
      }
    }
  }

  // Remove move from team member
  const removeMoveFromMember = (teamId: string, slotIndex: number, moveIndex: number) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team && slotIndex >= 0 && slotIndex < 6 && team.members[slotIndex]) {
      team.members[slotIndex].moves?.splice(moveIndex, 1)
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Clear team member
  const clearTeamMember = (teamId: string, slotIndex: number) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team && slotIndex >= 0 && slotIndex < 6) {
      team.members[slotIndex] = {
        pokemonId: null,
        pokemonName: '',
        moves: [],
        nickname: ''
      }
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Clear entire team
  const clearTeam = (teamId: string) => {
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      team.members = Array(6).fill(null).map(() => ({
        pokemonId: null,
        pokemonName: '',
        moves: [],
        nickname: ''
      }))
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    }
  }

  // Get active team
  const activeTeam = computed(() => {
    return teams.value.find(t => t.id === activeTeamId.value)
  })

  // Get filled slots count
  const filledSlotsCount = computed(() => {
    if (!activeTeam.value) return 0
    return activeTeam.value.members.filter(m => m.pokemonId !== null).length
  })

  // Export team as JSON
  const exportTeamAsJson = (teamId: string): string | null => {
    const team = teams.value.find(t => t.id === teamId)
    return team ? JSON.stringify(team, null, 2) : null
  }

  // Export team as URL
  const exportTeamAsUrl = (teamId: string): string | null => {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return null
    const encoded = btoa(JSON.stringify(team))
    return `${window.location.origin}${window.location.pathname}?team=${encoded}`
  }

  // Import team from JSON
  const importTeamFromJson = (jsonString: string): boolean => {
    try {
      const imported = JSON.parse(jsonString)
      // Validate structure
      if (imported.id && imported.name && Array.isArray(imported.members) && imported.members.length === 6) {
        const existingIndex = teams.value.findIndex(t => t.id === imported.id)
        if (existingIndex >= 0) {
          teams.value[existingIndex] = imported
        } else {
          teams.value.push(imported)
        }
        activeTeamId.value = imported.id
        saveToStorage()
        updateUrlWithTeam()
        return true
      }
    } catch (error) {
      console.error('Failed to import team:', error)
    }
    return false
  }

  // Randomize team (fill with random pokemon)
  const randomizeTeam = async (teamId: string) => {
    const team = teams.value.find(t => t.id === teamId)
    if (!team) return

    try {
      // Fetch random pokemon IDs (1-1025)
      for (let i = 0; i < 6; i++) {
        const randomId = Math.floor(Math.random() * 1025) + 1
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        if (response.ok) {
          const data = await response.json()
          team.members[i] = {
            pokemonId: data.id,
            pokemonName: data.name,
            moves: data.moves.slice(0, 4).map((m: any) => m.move.name),
            nickname: data.name
          }
        }
      }
      team.updatedAt = Date.now()
      saveToStorage()
      updateUrlWithTeam()
    } catch (error) {
      console.error('Failed to randomize team:', error)
    }
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
    addMoveToMember,
    removeMoveFromMember,
    clearTeamMember,
    clearTeam,
    exportTeamAsJson,
    exportTeamAsUrl,
    importTeamFromJson,
    randomizeTeam
  }
})
