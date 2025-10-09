<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <Zap class="w-5 h-5" />
        Move Pool
      </CardTitle>
      <div class="flex gap-2 mt-4">
        <Select v-model="learnMethod">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Learn Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="level-up">Level Up</SelectItem>
            <SelectItem value="machine">TM/HM</SelectItem>
            <SelectItem value="egg">Breeding</SelectItem>
            <SelectItem value="tutor">Tutor</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="itemsPerPage">
          <SelectTrigger class="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 items</SelectItem>
            <SelectItem value="25">25 items</SelectItem>
            <SelectItem value="50">50 items</SelectItem>
            <SelectItem value="100">100 items</SelectItem>
            <SelectItem value="all">Show All</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
    <CardContent>
      <div v-if="isLoading" class="text-center py-8">
        <p class="text-muted-foreground">Loading moves...</p>
      </div>

      <div v-else-if="filteredMoves.length === 0" class="text-center text-muted-foreground py-8">
        <p>No moves found for this method</p>
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead v-if="learnMethod === 'level-up'" class="cursor-pointer hover:text-foreground" @click="toggleSort('learnLevel')">
                  Level {{ sortColumn === 'learnLevel' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead v-else-if="learnMethod === 'machine'" class="cursor-pointer hover:text-foreground" @click="toggleSort('machineNumber')">
                  TM/HM {{ sortColumn === 'machineNumber' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead v-else>—</TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('name')">
                  Name {{ sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('power')">
                  Power {{ sortColumn === 'power' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('pp')">
                  PP {{ sortColumn === 'pp' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('accuracy')">
                  Acc {{ sortColumn === 'accuracy' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('priority')">
                  Priority {{ sortColumn === 'priority' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
                <TableHead class="cursor-pointer hover:text-foreground" @click="toggleSort('generation')">
                  Gen {{ sortColumn === 'generation' ? (sortDirection === 'asc' ? '↑' : '↓') : '' }}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="move in paginatedMoves" :key="move.name">
                <TableCell>
                  <span v-if="learnMethod === 'level-up'">{{ move.learnLevel }}</span>
                  <span v-else-if="learnMethod === 'machine'" class="flex items-center gap-2">
                    {{ move.machineName }}
                  </span>
                  <span v-else>—</span>
                </TableCell>
                <TableCell class="font-medium capitalize">{{ move.name.replace(/-/g, ' ') }}</TableCell>
                <TableCell>
                  <Badge :class="getTypeClass(move.type)" class="text-white text-xs">
                    {{ getTypeEmoji(move.type) }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge :class="categoryColors[move.damageClass as keyof typeof categoryColors]?.badge" class="text-xs capitalize">
                    {{ move.damageClass }}
                  </Badge>
                </TableCell>
                <TableCell>{{ move.power || '—' }}</TableCell>
                <TableCell>{{ move.pp }}</TableCell>
                <TableCell>{{ move.accuracy ? `${move.accuracy}%` : '—' }}</TableCell>
                <TableCell>{{ move.priority }}</TableCell>
                <TableCell class="uppercase">{{ move.generation }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-4 flex items-center justify-between">
          <p class="text-sm text-muted-foreground">
            Showing {{ (currentPage - 1) * parseInt(itemsPerPage) + 1 }} to {{ Math.min(currentPage * parseInt(itemsPerPage), totalItems) }} of {{ totalItems }} moves
          </p>
          <div class="flex justify-end">
            <Pagination v-model:page="currentPage" :total="totalItems" :items-per-page="parseInt(itemsPerPage)" :sibling-count="1" show-edges>
              <PaginationContent>
                <PaginationFirst />
                <PaginationPrevious />
                <PaginationNext />
                <PaginationLast />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Pagination, 
  PaginationContent, 
  PaginationFirst, 
  PaginationItem, 
  PaginationLast, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination'
import { Zap } from 'lucide-vue-next'
import { TYPES } from '@/stores/types'
import { MOVE_CATEGORY_COLORS } from '@/stores/moveCategory'
import type { PokemonDetailData } from '@/composables/usePokemonDetail'

const props = defineProps<{
  pokemon: PokemonDetailData
  selectedVersion: string
}>()

const learnMethod = ref('level-up')
const moves = ref<any[]>([])
const moveDetails = ref<Record<string, any>>({})
const machineDetails = ref<Record<string, any>>({})
const isLoading = ref(true)
const sortColumn = ref<string>('learnLevel')
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref('15')

const categoryColors = MOVE_CATEGORY_COLORS

const getTypeEmoji = (typeName: string) => {
  return TYPES[typeName as keyof typeof TYPES]?.emoji || '❓'
}

const getTypeClass = (typeName: string) => {
  const TYPE_CLASSES: Record<string, string> = {
    normal: 'bg-gray-400', fire: 'bg-orange-500', water: 'bg-blue-400',
    electric: 'bg-yellow-500', grass: 'bg-lime-500', ice: 'bg-teal-500',
    fighting: 'bg-red-600', poison: 'bg-purple-600', ground: 'bg-yellow-400',
    flying: 'bg-violet-400', psychic: 'bg-pink-500', bug: 'bg-lime-600',
    rock: 'bg-yellow-600', dragon: 'bg-indigo-500', ghost: 'bg-purple-500',
    dark: 'bg-gray-800', steel: 'bg-gray-400', fairy: 'bg-pink-400',
  }
  return TYPE_CLASSES[typeName] || 'bg-gray-400'
}

const filteredMoves = computed(() => {
  return moves.value.filter(m => {
    if (learnMethod.value === 'level-up') {
      return m.version_group_details.some((vg: any) => vg.move_learn_method.name === 'level-up')
    } else if (learnMethod.value === 'egg') {
      return m.version_group_details.some((vg: any) => vg.move_learn_method.name === 'egg')
    } else if (learnMethod.value === 'tutor') {
      return m.version_group_details.some((vg: any) => vg.move_learn_method.name === 'tutor')
    } else if (learnMethod.value === 'machine') {
      return m.version_group_details.some((vg: any) => vg.move_learn_method.name === 'machine')
    }
    return false
  }).map(m => {
    const detail = moveDetails.value[m.move.name]
    const vgDetail = m.version_group_details.find((vg: any) => vg.move_learn_method.name === learnMethod.value)
    
    // Get machine details for TM/HM
    let machineName = '—'
    let machineNumber = 0
    if (vgDetail?.move_learn_method.name === 'machine' && detail) {
      const machine = detail.machines?.find((mac: any) => {
        return vgDetail.version_group && mac.version_group?.name === vgDetail.version_group.name
      })
      if (machine) {
        const machineData = machineDetails.value[machine.machine.url]
        if (machineData) {
          machineName = machineData.item.name.toUpperCase().replace('-', '')
          machineNumber = parseInt(machineData.item.name.match(/\d+/)?.[0] || '0')
        }
      }
    }
    
    return {
      name: m.move.name,
      learnLevel: vgDetail?.level_learned_at || 0,
      type: detail?.type?.name || 'normal',
      damageClass: detail?.damage_class?.name || 'status',
      power: detail?.power,
      pp: detail?.pp,
      accuracy: detail?.accuracy,
      priority: detail?.priority || 0,
      generation: detail?.generation?.name?.replace('generation-', '') || 'I',
      machineName,
      machineNumber,
    }
  })
})

const sortedMoves = computed(() => {
  const sorted = [...filteredMoves.value]
  
  sorted.sort((a, b) => {
    let aVal: any = a[sortColumn.value as keyof typeof a]
    let bVal: any = b[sortColumn.value as keyof typeof b]
    
    if (aVal === null || aVal === undefined) aVal = sortColumn.value === 'power' || sortColumn.value === 'accuracy' ? 0 : ''
    if (bVal === null || bVal === undefined) bVal = sortColumn.value === 'power' || sortColumn.value === 'accuracy' ? 0 : ''
    
    if (typeof aVal === 'string') {
      return sortDirection.value === 'asc' 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    
    return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
  })
  
  return sorted
})

const totalItems = computed(() => sortedMoves.value.length)
const totalPages = computed(() => {
  if (itemsPerPage.value === 'all') return 1
  return Math.ceil(totalItems.value / parseInt(itemsPerPage.value))
})

const paginatedMoves = computed(() => {
  if (itemsPerPage.value === 'all') return sortedMoves.value
  
  const perPage = parseInt(itemsPerPage.value)
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  
  return sortedMoves.value.slice(start, end)
})

const toggleSort = (column: string) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
}

const fetchMoveDetails = async () => {
  isLoading.value = true
  moves.value = props.pokemon.moves || []
  
  // Fetch move details
  const movePromises = moves.value.map(async (m) => {
    try {
      const res = await fetch(m.move.url)
      if (res.ok) {
        moveDetails.value[m.move.name] = await res.json()
      }
    } catch (e) {
      // ignore
    }
  })
  
  await Promise.all(movePromises)
  
  // Fetch machine details for TM/HM moves
  const machinePromises: Promise<void>[] = []
  Object.values(moveDetails.value).forEach((detail: any) => {
    if (detail.machines && detail.machines.length > 0) {
      detail.machines.forEach((machine: any) => {
        if (!machineDetails.value[machine.machine.url]) {
          machinePromises.push(
            fetch(machine.machine.url)
              .then(res => res.json())
              .then(data => {
                machineDetails.value[machine.machine.url] = data
              })
              .catch(() => {})
          )
        }
      })
    }
  })
  
  await Promise.all(machinePromises)
  isLoading.value = false
}

watch(learnMethod, () => {
  sortColumn.value = learnMethod.value === 'level-up' ? 'learnLevel' : learnMethod.value === 'machine' ? 'machineNumber' : 'name'
  sortDirection.value = 'asc'
  currentPage.value = 1
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

onMounted(() => {
  fetchMoveDetails()
})
</script>
