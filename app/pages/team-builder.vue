<template>
  <BaseLayout :show-navbar="true">
    <div class="bg-background flex flex-col">
      <div class="flex-1">
        <div class="container mx-auto px-4 py-8 max-w-7xl">
          <!-- Page Header -->
          <div class="mb-8">
            <h1 class="text-4xl font-bold tracking-tight mb-2">Team Builder</h1>
            <p class="text-muted-foreground">Create and manage your Pokémon teams</p>
          </div>

          <!-- Teams Grid -->
          <div class="grid grid-cols-1 gap-6">
            <!-- Create New Team Card -->
            <Card
              class="flex items-center justify-center min-h-[220px] border-4 border-dashed cursor-pointer hover:bg-secondary transition-colors"
              @click="createNewTeam">
              <div class="text-center">
                <Plus class="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p class="font-semibold">Create New Team</p>
                <p class="text-xs text-muted-foreground">Click to add a team</p>
              </div>
            </Card>

            <!-- Team Cards -->
            <Card v-for="team in teamBuilderStore.teams" :key="team.id"
              class="flex flex-col justify-between p-6 hover:shadow-lg transition-shadow">
              <div>
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h3 class="font-semibold text-lg truncate">{{ team.name }}</h3>
                    <p class="text-xs text-muted-foreground">{{team.members.filter(m => m.pokemonId).length}}/6
                      Pokémon</p>
                  </div>
                  <Button size="sm" variant="ghost" @click.stop="deleteTeam(team.id)" class="h-8 w-8 p-0">
                    <X class="w-4 h-4" />
                  </Button>
                </div>

                <!-- Team Members Preview - 3x2 Grid with Artwork -->
                <div class="grid grid-cols-3 gap-1.5 mb-4">
                  <div v-for="(member, idx) in team.members" :key="idx"
                    class="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center overflow-hidden border border-border/50">
                    <NuxtImg v-if="member.pokemonId"
                      :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemonId}.png`"
                      :alt="member.pokemonName" class="w-full h-full object-contain p-0.5" />
                    <div v-else class="text-center">
                      <Zap class="w-4 h-4 mx-auto text-muted-foreground opacity-50" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <Button size="sm" variant="default" @click="openTeamBuilder(team.id)" class="flex-1 gap-2">
                  <Edit2 class="w-4 h-4" />
                  Build
                </Button>
                <Button size="sm" variant="outline" @click="openAnalysis(team.id)" class="flex-1 gap-2">
                  <BarChart3 class="w-4 h-4" />
                  Analyze
                </Button>
              </div>

              <!-- Quick Actions -->
              <div class="flex gap-1 mt-2">
                <Button size="sm" variant="ghost" @click="randomizeTeam(team.id)" class="flex-1 h-8">
                  <Shuffle class="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" @click="exportTeam(team.id)" class="flex-1 h-8">
                  <Download class="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" @click="shareTeam(team.id)" class="flex-1 h-8">
                  <Share2 class="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" @click="importTeam" class="flex-1 h-8">
                  <Upload class="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- Team Builder Dialog -->
      <Dialog v-model:open="teamBuilderDialogOpen">
        <DialogContent class="max-w-4xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Build Team: {{ editingTeam?.name }}</DialogTitle>
            <DialogDescription>
              Add up to 6 Pokémon to your team
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <!-- Team Name Edit -->
            <div>
              <Label class="text-sm font-medium pb-1">Team Name:</Label>
              <Input v-model="editingTeamName" @blur="saveTeamName"
                class="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter team name" />
            </div>

            <!-- Team Slots Grid -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <TeamSlot v-for="(member, index) in editingTeam?.members" :key="index" :team-id="editingTeam?.id || ''"
                :slot-index="index" :member="member" />
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" @click="randomizeTeam(editingTeam?.id || '')" class="gap-2">
                <Shuffle class="w-4 h-4" />
                Randomize
              </Button>
              <Button size="sm" variant="outline" @click="clearTeam(editingTeam?.id || '')" class="gap-2">
                <Trash2 class="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="teamBuilderDialogOpen = false">Close</Button>
            <Button @click="openAnalysis(editingTeam?.id || '')">View Analysis</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Team Analysis Dialog -->
      <Dialog v-model:open="analysisDialogOpen">
        <DialogContent class="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle class="text-xl md:text-2xl">Team Analysis: {{ analyzeTeam?.name }}</DialogTitle>
          </DialogHeader>

          <TeamAnalysis v-if="analyzeTeam" :team="analyzeTeam" />

          <DialogFooter>
            <Button variant="outline" @click="analysisDialogOpen = false">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Import Dialog -->
      <Dialog v-model:open="importDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Team</DialogTitle>
            <DialogDescription>
              Paste your team JSON below to import it
            </DialogDescription>
          </DialogHeader>
          <textarea v-model="importJson" placeholder="Paste team JSON here..."
            class="w-full h-32 p-3 border rounded-lg font-mono text-sm" />
          <DialogFooter>
            <Button variant="outline" @click="importDialogOpen = false">Cancel</Button>
            <Button @click="confirmImport">Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue'
  import { Card } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
  import { useTeamBuilderStore, type Team } from '@/stores/teamBuilder'
  import { Plus, X, Shuffle, Trash2, Download, Share2, Upload, Edit2, BarChart3, Zap } from 'lucide-vue-next'
  import BaseLayout from '@/layouts/BaseLayout.vue'
  import TeamSlot from '../components/pokemon/team/TeamSlot.vue'
  import TeamAnalysis from '../components/pokemon/team/TeamAnalysis.vue'
  import { useSEO } from '@/utils/seo'

  // Configure SEO
  useSEO({
    title: 'Team Builder - PokéNux',
    description: 'Create and manage your Pokémon teams. Build strategic teams with type coverage analysis and team statistics.',
    ogTitle: 'Team Builder - PokéNux',
    ogDescription: 'Create and manage your Pokémon teams. Build strategic teams with type coverage analysis and team statistics.'
  })

  const teamBuilderStore = useTeamBuilderStore()

  // Dialog states
  const teamBuilderDialogOpen = ref(false)
  const analysisDialogOpen = ref(false)
  const importDialogOpen = ref(false)

  // Team editing state
  const editingTeam = ref<Team | null>(null)
  const editingTeamName = ref('')
  const analyzeTeam = ref<Team | null>(null)
  const importJson = ref('')

  // Initialize store from localStorage and URL on mount
  onMounted(() => {
    teamBuilderStore.initializeFromStorage()
    if (teamBuilderStore.teams.length === 0) {
      teamBuilderStore.createTeam('Team 1')
    }
  })

  const createNewTeam = () => {
    teamBuilderStore.createTeam(`Team ${teamBuilderStore.teams.length + 1}`)
  }

  const deleteTeam = (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      teamBuilderStore.deleteTeam(teamId)
    }
  }

  const openTeamBuilder = (teamId: string) => {
    const team = teamBuilderStore.teams.find(t => t.id === teamId)
    if (team) {
      editingTeam.value = team
      editingTeamName.value = team.name
      teamBuilderDialogOpen.value = true
    }
  }

  const openAnalysis = (teamId: string) => {
    const team = teamBuilderStore.teams.find(t => t.id === teamId)
    if (team) {
      analyzeTeam.value = team
      teamBuilderDialogOpen.value = false
      analysisDialogOpen.value = true
    }
  }

  const saveTeamName = () => {
    if (editingTeam.value && editingTeamName.value) {
      teamBuilderStore.updateTeamName(editingTeam.value.id, editingTeamName.value)
      editingTeam.value.name = editingTeamName.value
    }
  }

  const randomizeTeam = async (teamId: string) => {
    await teamBuilderStore.randomizeTeam(teamId)
    if (editingTeam.value?.id === teamId) {
      const updated = teamBuilderStore.teams.find(t => t.id === teamId)
      if (updated) {
        editingTeam.value = updated
      }
    }
  }

  const clearTeam = (teamId: string) => {
    if (confirm('Clear all Pokémon from this team?')) {
      teamBuilderStore.clearTeam(teamId)
      if (editingTeam.value?.id === teamId) {
        const updated = teamBuilderStore.teams.find(t => t.id === teamId)
        if (updated) {
          editingTeam.value = updated
        }
      }
    }
  }

  const exportTeam = (teamId: string) => {
    const team = teamBuilderStore.teams.find(t => t.id === teamId)
    if (team) {
      const json = teamBuilderStore.exportTeamAsJson(teamId)
      if (json) {
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${team.name.replace(/\s+/g, '-')}-team.json`
        link.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  const shareTeam = (teamId: string) => {
    const url = teamBuilderStore.exportTeamAsUrl(teamId)
    if (url) {
      navigator.clipboard.writeText(url)
      alert('Team URL copied to clipboard!')
    }
  }

  const importTeam = () => {
    importJson.value = ''
    importDialogOpen.value = true
  }

  const confirmImport = () => {
    if (importJson.value.trim()) {
      const success = teamBuilderStore.importTeamFromJson(importJson.value)
      if (success) {
        importDialogOpen.value = false
        importJson.value = ''
      } else {
        alert('Failed to import team. Invalid JSON format.')
      }
    }
  }
</script>
