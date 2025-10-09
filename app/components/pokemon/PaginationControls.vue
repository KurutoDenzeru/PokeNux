<template>
  <client-only>
    <div class="w-full flex justify-end mt-2">
      <Pagination :total="total" :items-per-page="itemsPerPage" v-model:page="internalPage">
        <template #default>
          <PaginationContent>
            <PaginationFirst :disabled="internalPage === 1" @click="go(1)" />
            <PaginationPrevious :disabled="internalPage === 1" @click="go(internalPage - 1)" />

            <PaginationItem v-if="startPage > 1" :value="1" :isActive="internalPage === 1" @click="go(1)">1
            </PaginationItem>

            <template v-for="p in pagesArray" :key="p">
              <PaginationItem :value="p" :isActive="p === internalPage" @click="go(p)">{{ p }}</PaginationItem>
            </template>

            <PaginationItem v-if="endPage < totalPages" :value="totalPages" :isActive="internalPage === totalPages"
              @click="go(totalPages)">{{ totalPages }}</PaginationItem>

            <PaginationNext :disabled="internalPage === pagesArray[pagesArray.length - 1]"
              @click="go(internalPage + 1)" />
            <PaginationLast :disabled="internalPage === pagesArray[pagesArray.length - 1]" @click="go(totalPages)" />
          </PaginationContent>
        </template>
      </Pagination>
    </div>
  </client-only>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
  import Pagination from '@/components/ui/pagination/Pagination.vue'
  import { PaginationContent, PaginationItem, PaginationFirst, PaginationPrevious, PaginationNext, PaginationLast } from '@/components/ui/pagination'

  const props = defineProps({
    total: { type: Number, required: true },
    itemsPerPage: { type: Number, default: 24 },
    modelValue: { type: Number, default: 1 }
  })
  const emit = defineEmits(['update:modelValue'])

  const internalPage = ref(props.modelValue)
  watch(() => props.modelValue, (v) => { if (v !== internalPage.value) internalPage.value = v })
  watch(internalPage, (v) => emit('update:modelValue', v))

  const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.itemsPerPage)))

  // responsive max buttons: 3 for mobile (<=640px), 5 otherwise
  const isMobile = ref(false)
  let mq: MediaQueryList | null = null
  const mediaChangeHandler = (e: MediaQueryListEvent | MediaQueryList) => { /* @ts-ignore */ isMobile.value = !!(e.matches) }
  onMounted(() => {
    if (typeof window !== 'undefined') {
      mq = window.matchMedia('(max-width: 640px)')
      mediaChangeHandler(mq)
      mq.addEventListener?.('change', mediaChangeHandler)
      mq.addListener?.(mediaChangeHandler as unknown as (e: MediaQueryListEvent) => void)
    }
  })
  onBeforeUnmount(() => {
    if (mq) {
      mq.removeEventListener?.('change', mediaChangeHandler)
      mq.removeListener?.(mediaChangeHandler as unknown as (e: MediaQueryListEvent) => void)
    }
  })

  const maxButtons = computed(() => (isMobile.value ? 3 : 5))
  const pagesArray = computed(() => {
    const total = totalPages.value
    const current = internalPage.value
    const maxB = maxButtons.value
    if (total <= maxB) return Array.from({ length: total }, (_, i) => i + 1)
    const half = Math.floor(maxB / 2)
    let start = current - half
    let end = current + half
    if (start < 1) { start = 1; end = maxB }
    if (end > total) { end = total; start = total - maxB + 1 }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
  })

  const startPage = computed(() => pagesArray.value[0] ?? 1)
  const endPage = computed(() => pagesArray.value[pagesArray.value.length - 1] ?? 1)

  const go = (p: number) => {
    const clamped = Math.max(1, Math.min(totalPages.value, p))
    internalPage.value = clamped
  }
</script>

<style scoped>

  /* small spacing tweak so the pagination sits nicely */
  .w-full.flex.justify-end {
    padding-right: 0.25rem
  }
</style>
