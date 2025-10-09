<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger as-child>
      <Button variant="outline" size="sm" class="flex items-center gap-2">
        <Funnel class="h-4 w-4" />
        Filter
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
      <DialogHeader class="space-y-3">
        <DialogTitle class="flex items-center gap-2 text-xl">
          <Funnel class="h-5 w-5" />
          Display Options
        </DialogTitle>
        <DialogDescription class="text-sm text-muted-foreground">
          Choose how many Pokémon to display and browsing style
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6 py-6">
        <div class="space-y-3">
          <Label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Items per page
          </Label>
          <Select v-model="localItemsPerPage" @update:model-value="onSelectionChange">
            <SelectTrigger class="w-full">
              <SelectValue>
                <div class="flex items-center gap-2">
                  <template v-if="localItemsPerPage === 'infinite'">
                    <Badge variant="default" class="bg-blue-100 text-blue-800">
                      <Infinity class="h-3 w-3 text-blue-500" />
                    </Badge>
                    <span>Infinite scroll</span>
                  </template>
                  <template v-else>
                    <Badge :class="getBadgeClass(localItemsPerPage)">
                      {{ localItemsPerPage }}
                    </Badge>
                    <span>{{ getDisplayText(localItemsPerPage) }}</span>
                  </template>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="12">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-blue-100 text-blue-800">12</Badge>
                    <span>Small pages</span>
                  </div>
                </SelectItem>
                <SelectItem value="24">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-green-100 text-green-800">24</Badge>
                    <span>Default pages</span>
                  </div>
                </SelectItem>
                <SelectItem value="36">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-yellow-100 text-yellow-800">36</Badge>
                    <span>Medium pages</span>
                  </div>
                </SelectItem>
                <SelectItem value="48">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-orange-100 text-orange-800">48</Badge>
                    <span>Large pages</span>
                  </div>
                </SelectItem>
                <SelectItem value="60">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-purple-100 text-purple-800">60</Badge>
                    <span>Extra large</span>
                  </div>
                </SelectItem>
                <SelectItem value="72">
                  <div class="flex items-center gap-2">
                    <Badge class="bg-red-100 text-red-800">72</Badge>
                    <span>Maximum pages</span>
                  </div>
                </SelectItem>
                <SelectItem value="infinite">
                  <div class="flex items-center gap-2">
                    <Badge variant="default" class="bg-blue-100 text-blue-800">
                      <Infinity class="h-3 w-3 text-blue-500" />
                    </Badge>
                    <span>Infinite scroll</span>
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            {{ localItemsPerPage === 'infinite' ? 'Scroll continuously with no pagination' : `Show ${localItemsPerPage}
            Pokémon per page` }}
          </p>
        </div>
      </div>

      <DialogFooter class="w-full">
        <Button variant="outline" @click="isOpen = false" class="w-full">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
  } from '@/components/ui/dialog'
  import { Button } from '@/components/ui/button'
  import { Label } from '@/components/ui/label'
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from '@/components/ui/select'
  import { Badge } from '@/components/ui/badge'
  import { Funnel, Infinity } from 'lucide-vue-next'
  import { useUserPreferencesStore } from '@/stores/userPreferences'

  const userPreferences = useUserPreferencesStore()

  const props = defineProps({
    itemsPerPage: {
      type: [String, Number],
      default: 24
    }
  })

  const emit = defineEmits(['update:itemsPerPage'])

  const isOpen = ref(false)
  const localItemsPerPage = ref(String(userPreferences.itemsPerPage))

  // Watch props changes
  watch(() => props.itemsPerPage, (newValue) => {
    localItemsPerPage.value = String(newValue)
  })

  // Watch store changes
  watch(() => userPreferences.itemsPerPage, (newValue) => {
    localItemsPerPage.value = String(newValue)
  })

  // Emit changes immediately when selection changes and save to store
  const onSelectionChange = (value: any) => {
    if (value) {
      userPreferences.updateItemsPerPage(String(value))
      emit('update:itemsPerPage', String(value))
    }
  }

  // Helper function to get badge class based on value
  const getBadgeClass = (value: string | number) => {
    const numValue = String(value)
    const colorMap: Record<string, string> = {
      '12': 'bg-blue-100 text-blue-800',
      '24': 'bg-green-100 text-green-800',
      '36': 'bg-yellow-100 text-yellow-800',
      '48': 'bg-orange-100 text-orange-800',
      '60': 'bg-purple-100 text-purple-800',
      '72': 'bg-red-100 text-red-800',
    }
    return colorMap[numValue] || 'bg-gray-100 text-gray-800'
  }

  // Helper function to get display text based on value
  const getDisplayText = (value: string | number) => {
    const textMap: Record<string, string> = {
      '12': 'Small pages',
      '24': 'Default pages',
      '36': 'Medium pages',
      '48': 'Large pages',
      '60': 'Extra large',
      '72': 'Maximum pages',
    }
    return textMap[String(value)] || `${value} items`
  }
</script>