/**
 * Team Builder Utilities
 * Helpers for team export, import, and serialization
 */

import type { Team } from '@/stores/teamBuilder'

/**
 * Export team as JSON string
 */
export const exportTeamJSON = (team: Team): string => {
  return JSON.stringify(team, null, 2)
}

/**
 * Export team as downloadable JSON file
 */
export const downloadTeamJSON = (team: Team): void => {
  const json = exportTeamJSON(team)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${team.name.replace(/\s+/g, '-')}-team.json`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Encode team as URL parameter
 */
export const encodeTeamUrl = (team: Team): string => {
  return btoa(JSON.stringify(team))
}

/**
 * Decode team from URL parameter
 */
export const decodeTeamUrl = (encoded: string): Team | null => {
  try {
    return JSON.parse(atob(encoded))
  } catch (error) {
    console.error('Failed to decode team from URL:', error)
    return null
  }
}

/**
 * Generate shareable URL for team
 */
export const generateTeamShareUrl = (team: Team, baseUrl?: string): string => {
  const encoded = encodeTeamUrl(team)
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '')
  return `${url}?team=${encoded}`
}

/**
 * Copy team share URL to clipboard
 */
export const copyTeamShareUrl = async (team: Team): Promise<boolean> => {
  try {
    const url = generateTeamShareUrl(team)
    await navigator.clipboard.writeText(url)
    return true
  } catch (error) {
    console.error('Failed to copy URL to clipboard:', error)
    return false
  }
}

/**
 * Validate team structure
 */
export const isValidTeam = (team: unknown): team is Team => {
  if (!team || typeof team !== 'object') return false

  const t = team as Record<string, unknown>

  return (
    typeof t.name === 'string' &&
    Array.isArray(t.members) &&
    t.members.length === 6 &&
    t.members.every(
      (m: unknown) =>
        typeof m === 'object' &&
        m !== null &&
        ('pokemonId' in m) &&
        ('pokemonName' in m)
    )
  )
}

/**
 * Get team statistics
 */
export const getTeamStats = (team: Team) => {
  const filledSlots = team.members.filter(m => m.pokemonId !== null).length
  const types = new Set(
    team.members
      .filter(m => m.pokemonId !== null)
      .map(m => m.pokemonName)
  )

  return {
    filledSlots,
    uniquePokemon: types.size,
    isComplete: filledSlots === 6
  }
}

/**
 * Merge two teams (for combining strategies)
 */
export const mergeTeams = (team1: Team, team2: Team, newName: string): Team => {
  const merged: Team = {
    name: newName,
    members: Array(6).fill(null).map(() => ({
      pokemonId: null,
      pokemonName: ''
    }))
  }

  // Combine members, preferring team1
  let index = 0
  for (const member of team1.members) {
    if (member.pokemonId && index < 6) {
      merged.members[index] = { ...member }
      index++
    }
  }

  for (const member of team2.members) {
    if (member.pokemonId && index < 6) {
      merged.members[index] = { ...member }
      index++
    }
  }

  return merged
}

/**
 * Get team by URL parameter if available
 */
export const getTeamFromUrl = (): Team | null => {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const teamParam = params.get('team')

  if (!teamParam) return null

  const team = decodeTeamUrl(teamParam)
  return isValidTeam(team) ? team : null
}

/**
 * Clear team URL parameter
 */
export const clearTeamUrl = (): void => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', window.location.pathname)
  }
}
