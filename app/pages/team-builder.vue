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
          <div>
            <Card
              class="flex items-center justify-center min-h-[220px] border-2 border-dashed border-emerald-300 dark:border-emerald-600 bg-linear-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30 transition-all duration-300"
              @click="createNewTeam">
              <div class="text-center">
                <Plus class="w-12 h-12 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                <p class="font-semibold text-emerald-900 dark:text-emerald-100">Create New Team</p>
                <p class="text-xs text-emerald-700 dark:text-emerald-300">Click to add a team</p>
              </div>
            </Card>

            <!-- Team Cards Grid - 2 columns on larger screens -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <Card v-for="team in paginatedTeams" :key="team.name"
                class="flex flex-col justify-between p-6 hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div>
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                      <h3 class="font-semibold text-lg truncate text-zinc-900 dark:text-zinc-100">{{ team.name }}</h3>
                      <p class="text-xs text-zinc-600 dark:text-zinc-400">{{team.members.filter(m =>
                        m.pokemonId).length}}/6
                        Pokémon</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="ghost" @click.stop="deleteTeam(team.name)" class="h-8 w-8 p-0">
                            <X class="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete this team</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <!-- Team Members Preview - Single Row Layout -->
                  <div class="flex gap-2 overflow-x-auto">
                    <div v-for="(member, idx) in team.members" :key="idx"
                      class="w-18 h-18 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
                      <NuxtImg v-if="member.pokemonId"
                        :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemonId}.png`"
                        :alt="member.pokemonName" class="w-full h-full object-contain p-0.5" />
                      <div v-else class="text-center">
                        <Zap class="w-4 h-4 mx-auto text-zinc-400 dark:text-zinc-600 opacity-50" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="default" @click="openTeamBuilder(team.name)"
                          class="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors duration-200">
                          <Edit2 class="w-4 h-4" />
                          Build
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit team members and composition</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="outline" @click="openAnalysis(team.name)"
                          class="flex-1 gap-2 border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200">
                          <BarChart3 class="w-4 h-4" />
                          Analyze
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View type coverage and team statistics</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <!-- Quick Actions -->
                <div class="flex gap-1 mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" @click="randomizeTeam(team.name)"
                          class="flex-1 h-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
                          <Shuffle class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fill team with random Pokémon</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" @click="duplicateTeam(team.name)"
                          class="flex-1 h-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
                          <Copy class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Create a copy of this team</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" @click="exportTeam(team.name)"
                          class="flex-1 h-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
                          <Download class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download team as JSON file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" @click="shareTeam(team.name)"
                          class="flex-1 h-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
                          <Share2 class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy shareable URL to clipboard</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="sm" variant="ghost" @click="importTeam"
                          class="flex-1 h-8 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200">
                          <Upload class="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Import team from JSON file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </Card>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="mt-8 flex justify-center items-center gap-2">
              <Button size="sm" variant="outline" @click="currentPage = 1" :disabled="currentPage === 1">
                First
              </Button>
              <Button size="sm" variant="outline" @click="currentPage = Math.max(1, currentPage - 1)"
                :disabled="currentPage === 1">
                Previous
              </Button>

              <div class="flex gap-1">
                <Button v-for="page in totalPages" :key="page" size="sm"
                  :variant="currentPage === page ? 'default' : 'outline'" @click="currentPage = page" class="w-10">
                  {{ page }}
                </Button>
              </div>

              <Button size="sm" variant="outline" @click="currentPage = Math.min(totalPages, currentPage + 1)"
                :disabled="currentPage === totalPages">
                Next
              </Button>
              <Button size="sm" variant="outline" @click="currentPage = totalPages"
                :disabled="currentPage === totalPages">
                Last
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Team Builder Dialog -->
      <Dialog v-model:open="teamBuilderDialogOpen">
        <DialogContent class="max-w-4xl! max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
              <Wrench class="w-5 h-5" />
              Build Team: {{ editingTeam?.name }}
            </DialogTitle>
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
              <TeamSlot v-for="(member, index) in editingTeam?.members" :key="index"
                :ref="(el) => teamSlotRefs[index] = el as any" :team-id="editingTeam?.name || ''" :slot-index="index"
                :member="member" />
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-2">
              <Button size="sm" @click="openAddPokemon"
                class="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors duration-200">
                <Plus class="w-4 h-4" />
                Add Pokémon
              </Button>
              <Button size="sm" @click="randomizeTeam(editingTeam?.name || '')" variant="outline" class="gap-2">
                <Shuffle class="w-4 h-4" />
                Randomize
              </Button>
              <Button variant="outline" size="sm" @click="clearTeam(editingTeam?.name || '')" class="gap-2">
                <Trash2 class="w-4 h-4" />
                Clear All
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="teamBuilderDialogOpen = false">Close</Button>
            <Button @click="openAnalysis(editingTeam?.name || '')"
              class="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors duration-200">
              <BarChart3 class="w-4 h-4" />
              View Analysis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Team Analysis Dialog -->
      <Dialog v-model:open="analysisDialogOpen">
        <DialogContent class="max-w-3xl!">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2 text-xl md:text-2xl">
              <BarChart3 class="w-6 h-6" />
              Team Analysis: {{ analyzeTeam?.name }}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea class="h-[calc(90vh-120px)] pr-4">
            <TeamAnalysis v-if="analyzeTeam" :team="analyzeTeam" />
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" @click="analysisDialogOpen = false" class="w-full">Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Import Dialog -->
      <Dialog v-model:open="importDialogOpen">
        <DialogContent>
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
              <Upload class="w-5 h-5" />
              Import Team
            </DialogTitle>
            <DialogDescription>
              Paste your team JSON below to import it, or upload a file
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <div>
              <Label class="text-sm font-medium mb-2 block">Paste JSON or Upload File</Label>
              <Textarea v-model="importJson" placeholder="Paste team JSON here..."
                class="w-full h-32 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
            </div>

            <div>
              <Label class="text-sm font-medium mb-2 block">Or Upload JSON File</Label>
              <Input type="file" accept=".json" @change="handleFileImport"
                class="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 cursor-pointer" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="importDialogOpen = false">Cancel</Button>
            <Button @click="confirmImport"
              class="gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white transition-colors duration-200">
              <Upload class="w-4 h-4" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <!-- Download Dialog -->
      <Dialog v-model:open="downloadDialogOpen">
        <DialogContent class="max-w-2xl">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2">
              <FileJson class="w-5 h-5 text-green-600 dark:text-green-400" />
              Download Team: {{ downloadTeamForExport?.name }}
            </DialogTitle>
            <DialogDescription>
              Copy your team JSON or download it as a file
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-4">
            <div class="relative">
              <label class="text-sm font-medium mb-2 block">Team JSON</label>
              <textarea v-model="downloadTeamJson" readonly
                class="w-full h-48 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" />
              <Button size="sm" variant="ghost" @click="copyDownloadJson"
                class="absolute top-10 right-2 h-8 w-8 p-0 opacity-70 hover:opacity-100 transition-opacity text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                <Copy class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="downloadDialogOpen = false">Close</Button>
            <Button @click="downloadTeamFile"
              class="gap-2 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white transition-colors duration-200">
              <Download class="w-4 h-4" />
              Download
            </Button>
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
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { useTeamBuilderStore, type Team } from '@/stores/teamBuilder'
  import { Plus, X, Shuffle, Trash2, Download, Share2, Upload, Edit2, BarChart3, Zap, Wrench, FileJson, Copy } from 'lucide-vue-next'
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
  const downloadDialogOpen = ref(false)

  // Pagination state
  const currentPage = ref(1)
  const teamsPerPage = 6

  // Team editing state
  const editingTeam = ref<Team | null>(null)
  const editingTeamName = ref('')
  const analyzeTeam = ref<Team | null>(null)
  const importJson = ref('')
  const downloadTeamJson = ref('')
  const downloadTeamForExport = ref<Team | null>(null)
  const teamSlotRefs = ref<any[]>([])

  // Computed paginated teams
  const paginatedTeams = computed(() => {
    const start = (currentPage.value - 1) * teamsPerPage
    const end = start + teamsPerPage
    return teamBuilderStore.teams.slice(start, end)
  })

  // Computed total pages
  const totalPages = computed(() => {
    return Math.ceil(teamBuilderStore.teams.length / teamsPerPage)
  })

  // Initialize store from localStorage and URL on mount
  onMounted(async () => {
    await teamBuilderStore.initializeFromStorage()
    if (teamBuilderStore.teams.length === 0) {
      teamBuilderStore.createTeam('Team 1')
    }
  })

  const createNewTeam = () => {
    teamBuilderStore.createTeam(`Team ${teamBuilderStore.teams.length + 1}`)
    currentPage.value = 1
  }

  const deleteTeam = (teamName: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      teamBuilderStore.deleteTeam(teamName)
      // Reset page if we're beyond the total pages
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
    }
  }

  const openTeamBuilder = (teamName: string) => {
    const team = teamBuilderStore.teams.find(t => t.name === teamName)
    if (team) {
      editingTeam.value = team
      editingTeamName.value = team.name
      teamBuilderDialogOpen.value = true
    }
  }

  const openAnalysis = (teamName: string) => {
    const team = teamBuilderStore.teams.find(t => t.name === teamName)
    if (team) {
      analyzeTeam.value = team
      teamBuilderDialogOpen.value = false
      analysisDialogOpen.value = true
    }
  }

  const saveTeamName = () => {
    if (editingTeam.value && editingTeamName.value) {
      teamBuilderStore.updateTeamName(editingTeam.value.name, editingTeamName.value)
      editingTeam.value.name = editingTeamName.value
    }
  }

  const randomizeTeam = async (teamName: string) => {
    await teamBuilderStore.randomizeTeam(teamName)
    if (editingTeam.value?.name === teamName) {
      const updated = teamBuilderStore.teams.find(t => t.name === teamName)
      if (updated) {
        editingTeam.value = updated
      }
    }
  }

  const duplicateTeam = (teamName: string) => {
    const success = teamBuilderStore.duplicateTeam(teamName)
    if (success) {
      // Reset to last page to show the new duplicated team
      const newTotalPages = Math.ceil(teamBuilderStore.teams.length / teamsPerPage)
      currentPage.value = newTotalPages
    }
  }

  const clearTeam = (teamName: string) => {
    if (confirm('Clear all Pokémon from this team?')) {
      teamBuilderStore.clearTeam(teamName)
      if (editingTeam.value?.name === teamName) {
        const updated = teamBuilderStore.teams.find(t => t.name === teamName)
        if (updated) {
          editingTeam.value = updated
        }
      }
    }
  }

  const openAddPokemon = () => {
    // Find the first empty slot
    if (editingTeam.value) {
      const emptySlotIndex = editingTeam.value.members.findIndex(m => m.pokemonId === null)
      if (emptySlotIndex >= 0) {
        // Trigger the search dialog in the first empty slot
        const slotRef = teamSlotRefs.value[emptySlotIndex]
        if (slotRef?.openPokemonSearch) {
          slotRef.openPokemonSearch()
        }
      }
    }
  }

  const selectedSlotForAdd = ref<number | null>(null)

  const exportTeam = (teamName: string) => {
    const team = teamBuilderStore.teams.find(t => t.name === teamName)
    if (team) {
      const json = teamBuilderStore.exportTeamAsJson(teamName)
      if (json) {
        downloadTeamJson.value = json
        downloadTeamForExport.value = team
        downloadDialogOpen.value = true
      }
    }
  }

  const downloadTeamFile = () => {
    if (downloadTeamForExport.value && downloadTeamJson.value) {
      const blob = new Blob([downloadTeamJson.value], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${downloadTeamForExport.value.name.replace(/\s+/g, '-')}-team.json`
      link.click()
      URL.revokeObjectURL(url)
      downloadDialogOpen.value = false
    }
  }

  const copyDownloadJson = async () => {
    try {
      await navigator.clipboard.writeText(downloadTeamJson.value)
      alert('Team JSON copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      alert('Failed to copy to clipboard')
    }
  }

  const shareTeam = (teamName: string) => {
    const url = teamBuilderStore.exportTeamAsUrl(teamName)
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
      try {
        // If we're editing a team in the builder dialog, import into that team
        // Otherwise, create a new team
        const targetTeam = editingTeam.value?.name
        const success = teamBuilderStore.importTeamFromJson(importJson.value, targetTeam)
        if (success) {
          importDialogOpen.value = false
          importJson.value = ''

          // If we imported into the editing team, refresh it
          if (targetTeam && editingTeam.value) {
            const updated = teamBuilderStore.teams.find(t => t.name === targetTeam)
            if (updated) {
              editingTeam.value = updated
            }
          }
        } else {
          alert('Failed to import team. Invalid JSON format.')
        }
      } catch (error) {
        console.error('Import error:', error)
        if (error instanceof Error && error.message.includes('QuotaExceeded')) {
          alert('Storage is full. Please delete some teams first to make space for this import.')
        } else {
          alert('Failed to import team. Invalid JSON format or storage error.')
        }
      }
    }
  }

  const handleFileImport = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        importJson.value = content
      }
      reader.readAsText(file)
    }
  }
</script>
