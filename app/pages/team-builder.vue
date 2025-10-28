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
            <Card @dragover="handleDragOver" @dragleave="handleDragLeave" @drop="handleDrop" :class="[
              'flex items-center justify-center min-h-[220px] border-2 border-dashed transition-all duration-300',
              isDraggingOver
                ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 shadow-lg shadow-emerald-300 dark:shadow-emerald-900/50'
                : 'border-emerald-300 dark:border-emerald-600 bg-linear-to-br from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-200 dark:hover:shadow-emerald-900/30'
            ]">
              <div class="text-center space-y-4">
                <div class="cursor-pointer" @click="createNewTeam">
                  <Plus class="w-12 h-12 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                  <p class="font-semibold text-emerald-900 dark:text-emerald-100">Create New Team</p>
                  <p class="text-xs text-emerald-700 dark:text-emerald-300">Click to add a team</p>
                </div>

                <!-- Divider -->
                <div class="flex items-center gap-2 px-4">
                  <div class="flex-1 h-px bg-emerald-300 dark:bg-emerald-700"></div>
                  <span class="text-xs text-emerald-600 dark:text-emerald-400">or</span>
                  <div class="flex-1 h-px bg-emerald-300 dark:bg-emerald-700"></div>
                </div>

                <!-- Import File Button & Dropzone -->
                <div>
                  <input ref="fileInput" type="file" accept=".json" class="hidden" @change="handleCreateTeamFromFile" />
                  <div class="space-y-3">
                    <Button @click="fileInput?.click()" variant="outline"
                      class="border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors duration-200">
                      <Upload class="w-4 h-4 mr-2" />
                      Import Team from JSON
                    </Button>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400">
                      {{ isDraggingOver ? '✨ Drop your team file here!' : 'or drag & drop a team file' }}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <!-- Sort Teams -->
            <div class="mt-6 mb-6">
              <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Sort Teams:</label>
              <SortFilter v-model="teamSort" />
            </div>

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
                    <div v-for="(member, idx) in team.members" :key="idx" draggable="true"
                      @dragstart="handleTeamCardDragStart($event, team.name, idx)" @dragend="handleTeamCardDragEnd"
                      @dragover="handleTeamCardDragOver" @dragleave="handleTeamCardDragLeave"
                      @drop="handleTeamCardDrop($event, team.name, idx)" :class="[
                        'w-18 h-18 shrink-0 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all',
                        draggedTeamCard?.teamName === team.name && draggedTeamCard?.memberIdx === idx ? 'opacity-50' : '',
                        dragOverTeamCard?.teamName === team.name && dragOverTeamCard?.memberIdx === idx ? 'ring-2 ring-emerald-400 scale-110 border-emerald-400' : '',
                        member.pokemonId ? 'cursor-move hover:scale-105' : 'cursor-default'
                      ]">
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

            <!-- Pagination Info and Controls -->
            <div class="w-full mt-8 space-y-4">
              <!-- Pagination Display Info (Top Right) -->
              <div class="w-full flex justify-end">
                <p class="text-sm text-muted-foreground">{{ paginationDisplayInfo }}</p>
              </div>

              <!-- Pagination Controls -->
              <PaginationControls v-model="currentPage" :total="teamBuilderStore.teams.length"
                :items-per-page="teamsPerPage" />
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
  import 'vue-sonner/style.css'
  import { toast } from 'vue-sonner'
  import { useSEO } from '@/utils/seo'
  import { ref, computed, onMounted } from 'vue'
  import BaseLayout from '@/layouts/BaseLayout.vue'
  import { useTeamBuilderStore, type Team } from '@/stores/teamBuilder'
  import { Plus, X, Shuffle, Trash2, Download, Upload, Edit2, BarChart3, Zap, Wrench, FileJson, Copy } from 'lucide-vue-next'

  // Components
  import { Card } from '@/components/ui/card'
  import { Button } from '@/components/ui/button'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import TeamSlot from '../components/pokemon/team/TeamSlot.vue'
  import TeamAnalysis from '../components/pokemon/team/TeamAnalysis.vue'
  import SortFilter from '@/components/pokemon/SortFilter.vue'
  import PaginationControls from '@/components/pokemon/PaginationControls.vue'
  import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

  // Configure SEO
  useSEO({
    title: 'Team Builder - PokéNux',
    description: 'Create and manage your Pokémon teams. Build strategic teams with type coverage analysis and team statistics.',
    ogTitle: 'Team Builder - PokéNux',
    ogDescription: 'Create and manage your Pokémon teams. Build strategic teams with type coverage analysis and team statistics.'
  })

  const teamBuilderStore = useTeamBuilderStore()

  // File input ref
  const fileInput = ref<HTMLInputElement | null>(null)

  // Dialog states
  const teamBuilderDialogOpen = ref(false)
  const analysisDialogOpen = ref(false)
  const importDialogOpen = ref(false)
  const downloadDialogOpen = ref(false)

  // Pagination state
  const currentPage = ref(1)
  const teamsPerPage = 6

  // Drag and drop state
  const isDraggingOver = ref(false)

  // Team card drag and drop state
  interface DraggedCard {
    teamName: string
    memberIdx: number
  }
  const draggedTeamCard = ref<DraggedCard | null>(null)
  const dragOverTeamCard = ref<DraggedCard | null>(null)

  // Team editing state
  const editingTeam = ref<Team | null>(null)
  const editingTeamName = ref('')
  const analyzeTeam = ref<Team | null>(null)
  const importJson = ref('')
  const downloadTeamJson = ref('')
  const downloadTeamForExport = ref<Team | null>(null)
  const teamSlotRefs = ref<any[]>([])

  // Sort state
  const teamSort = ref<string | null>(null)

  // Computed paginated teams with sorting
  const sortedTeams = computed(() => {
    let sorted = [...teamBuilderStore.teams]

    if (teamSort.value === 'asc-id') {
      sorted.sort((a, b) => {
        const aNum = parseInt(a.name.match(/\d+/)?.[0] ?? '0')
        const bNum = parseInt(b.name.match(/\d+/)?.[0] ?? '0')
        return aNum - bNum
      })
    } else if (teamSort.value === 'desc-id') {
      sorted.sort((a, b) => {
        const aNum = parseInt(a.name.match(/\d+/)?.[0] ?? '0')
        const bNum = parseInt(b.name.match(/\d+/)?.[0] ?? '0')
        return bNum - aNum
      })
    } else if (teamSort.value === 'az') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (teamSort.value === 'za') {
      sorted.sort((a, b) => b.name.localeCompare(a.name))
    }

    return sorted
  })

  const paginatedTeams = computed(() => {
    const start = (currentPage.value - 1) * teamsPerPage
    const end = start + teamsPerPage
    return sortedTeams.value.slice(start, end)
  })

  // Computed total pages
  const totalPages = computed(() => {
    return Math.ceil(sortedTeams.value.length / teamsPerPage)
  })

  // Computed pagination display info (e.g., "Showing 1 to 6 of 12 Entries")
  const paginationDisplayInfo = computed(() => {
    const totalTeams = sortedTeams.value.length
    if (totalTeams === 0) {
      return 'Showing 0 Entries'
    }
    const start = (currentPage.value - 1) * teamsPerPage + 1
    const end = Math.min(currentPage.value * teamsPerPage, totalTeams)
    return `Showing ${start} to ${end} of ${totalTeams} Entries`
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
    toast.success('Team created')
  }

  const handleCreateTeamFromFile = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonContent = e.target?.result as string
          const success = teamBuilderStore.importTeamFromJson(jsonContent)
          if (success) {
            // Reset to last page to show the new imported team
            const newTotalPages = Math.ceil(teamBuilderStore.teams.length / teamsPerPage)
            currentPage.value = newTotalPages
            toast.success('Team imported successfully')
          } else {
            toast.error('Invalid team file format')
          }
        } catch (error) {
          console.error('Failed to import team from file:', error)
          toast.error('Failed to import team')
        }
      }
      reader.readAsText(file)
      // Reset file input
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDraggingOver.value = true
  }

  const handleDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDraggingOver.value = false
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    isDraggingOver.value = false

    const files = event.dataTransfer?.files
    if (!files || files.length === 0) return

    const file = files[0]
    if (!file) return

    // Check if it's a JSON file
    if (!file.name.endsWith('.json')) {
      toast.error('Please drop a JSON file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string
        const success = teamBuilderStore.importTeamFromJson(jsonContent)
        if (success) {
          // Reset to last page to show the new imported team
          const newTotalPages = Math.ceil(teamBuilderStore.teams.length / teamsPerPage)
          currentPage.value = newTotalPages
          toast.success('Team imported successfully')
        } else {
          toast.error('Invalid team file format')
        }
      } catch (error) {
        console.error('Failed to import team from file:', error)
        toast.error('Failed to import team')
      }
    }
    reader.readAsText(file)
  }

  const deleteTeam = (teamName: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      teamBuilderStore.deleteTeam(teamName)
      // Reset page if we're beyond the total pages
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value
      }
      toast.success('Team deleted')
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
    toast.success('Team randomized')
  }

  const duplicateTeam = (teamName: string) => {
    const success = teamBuilderStore.duplicateTeam(teamName)
    if (success) {
      // Reset to last page to show the new duplicated team
      const newTotalPages = Math.ceil(teamBuilderStore.teams.length / teamsPerPage)
      currentPage.value = newTotalPages
      toast.success('Team duplicated')
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
      toast.info('Team cleared')
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
      toast.success('Team downloaded')
    }
  }

  const copyDownloadJson = async () => {
    try {
      await navigator.clipboard.writeText(downloadTeamJson.value)
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy')
    }
  }

  const importTeam = () => {
    importJson.value = ''
    importDialogOpen.value = true
  }

  const confirmImport = () => {
    if (importJson.value.trim()) {
      try {
        // Determine target team for import
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

          toast.success('Team imported')
        } else {
          toast.error('Import failed')
        }
      } catch (error) {
        console.error('Import error:', error)
        if (error instanceof Error && error.message.includes('QuotaExceeded')) {
          toast.error('Storage full')
        } else {
          toast.error('Import failed')
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

  // Team card drag and drop handlers
  const handleTeamCardDragStart = (event: DragEvent, teamName: string, memberIdx: number) => {
    const member = teamBuilderStore.teams.find(t => t.name === teamName)?.members[memberIdx]
    if (!member?.pokemonId) return

    draggedTeamCard.value = { teamName, memberIdx }
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('application/json', JSON.stringify({ teamName, memberIdx }))
    }
  }

  const handleTeamCardDragEnd = () => {
    draggedTeamCard.value = null
    dragOverTeamCard.value = null
  }

  const handleTeamCardDragOver = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  const handleTeamCardDragLeave = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dragOverTeamCard.value = null
  }

  const handleTeamCardDrop = (event: DragEvent, teamName: string, memberIdx: number) => {
    event.preventDefault()
    event.stopPropagation()

    const data = event.dataTransfer?.getData('application/json')
    if (!data) return

    try {
      const { teamName: fromTeamName, memberIdx: fromMemberIdx } = JSON.parse(data)

      // Only allow reordering within the same team
      if (fromTeamName === teamName && fromMemberIdx !== memberIdx) {
        teamBuilderStore.reorderTeamMembers(teamName, fromMemberIdx, memberIdx)
      }
    } catch (error) {
      console.error('Failed to parse drag data:', error)
    }

    draggedTeamCard.value = null
    dragOverTeamCard.value = null
  }
</script>
