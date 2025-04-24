<template>
  <div class="my-6 flex justify-end">
    <div class="flex flex-col items-end gap-4">
      <!-- Showing entries text -->
      <span class="text-sm text-gray-700">
        Showing
        <span class="font-semibold text-gray-900">{{ startEntry }}</span>
        to
        <span class="font-semibold text-gray-900">{{ endEntry }}</span>
        of
        <span class="font-semibold text-gray-900">{{ totalItems }}</span>
        Entries
      </span>

      <!-- Pagination navigation -->
      <nav aria-label="Page navigation">
        <ul class="flex items-center -space-x-px h-10 text-base">
          <!-- Previous button -->
          <li>
            <a href="#" @click.prevent="$emit('prev-page')" :class="[
                'pagination-link flex items-center justify-center px-2 h-10 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg',
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]" :aria-disabled="currentPage === 1" aria-label="Previous page">
              <span class="sr-only">Previous</span>
              <ChevronLeft />
            </a>
          </li>

          <!-- Page numbers -->
          <li v-for="(page, index) in displayedPages" :key="index">
            <a v-if="page !== '...'" href="#" @click.prevent="$emit('update:currentPage', page)" :class="[
                'pagination-link flex items-center justify-center px-4 h-10 leading-tight border border-gray-300',
                currentPage === page
                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700',
              ]" :aria-current="currentPage === page ? 'page' : undefined" :aria-label="`Page ${page}`">
              {{ page }}
            </a>
            <span v-else
              class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300">
              {{ page }}
            </span>
          </li>

          <!-- Next button -->
          <li>
            <a href="#" @click.prevent="$emit('next-page')" :class="[
                'pagination-link flex items-center justify-center px-2 h-10 leading-tight border border-gray-300 rounded-e-lg',
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]" :aria-disabled="currentPage === totalPages" aria-label="Next page">
              <span class="sr-only">Next</span>
              <ChevronRight />
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:currentPage", "prev-page", "next-page"]);

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.perPage);
});

const startEntry = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1;
});

const endEntry = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.totalItems);
});

const displayedPages = computed(() => {
  const total = totalPages.value;
  const current = props.currentPage;
  const delta = 2;
  let pages = [];

  if (total <= 7) {
    pages = Array.from({ length: total }, (_, i) => i + 1);
  } else {
    pages.push(1);

    if (current - delta <= 2) {
      // Show 1, 2, 3, 4, 5, ..., total
      const showPages = Array.from({ length: 4 }, (_, i) => i + 2); // Start from 2
      pages.push(...showPages);
      pages.push("...", total);
    } else if (current + delta >= total - 1) {
      // Show 1, ..., total-4, total-3, total-2, total-1, total
      pages.push("...");
      const showPages = Array.from({ length: 4 }, (_, i) => total - 3 + i); // Start from total-3
      pages.push(...showPages);
    } else {
      // Show 1, ..., current-delta, ..., current+delta, ..., total
      pages.push("...");
      for (let i = current - delta; i <= current + delta; i++) {
        pages.push(i);
      }
      pages.push("...", total);
    }
  }

  // Ensure pages are unique and sorted, handling potential duplicates from logic
  return [...new Set(pages)].sort((a, b) => {
    if (a === '...') return -1; // Keep '...' in place relative to numbers
    if (b === '...') return 1;
    return a - b;
  });
});

</script>