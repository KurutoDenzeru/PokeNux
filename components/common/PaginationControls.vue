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
            <a
              @click="$emit('prev-page')"
              :class="[
                'flex items-center justify-center px-4 h-10 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg',
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]"
            >
              <span class="sr-only">Previous</span>
              <svg
                class="w-3 h-3 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 1 1 5l4 4"
                />
              </svg>
            </a>
          </li>

          <!-- Page numbers -->
          <template v-for="pageNum in displayedPages" :key="pageNum">
            <!-- Ellipsis -->
            <li
              v-if="pageNum === '...'"
              class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300"
            >
              ...
            </li>
            <!-- Page number -->
            <li v-else>
              <a
                @click="$emit('update:currentPage', pageNum)"
                class="flex items-center justify-center px-4 h-10 leading-tight cursor-pointer border border-gray-300"
                :class="[
                  pageNum === currentPage
                    ? 'z-10 text-emerald-600 border-emerald-300 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700'
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700',
                ]"
              >
                {{ pageNum }}
              </a>
            </li>
          </template>

          <!-- Next button -->
          <li>
            <a
              @click="$emit('next-page')"
              :class="[
                'flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 rounded-e-lg',
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]"
            >
              <span class="sr-only">Next</span>
              <svg
                class="w-3 h-3 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
	name: "PaginationControls",
	props: {
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
	},
	computed: {
		totalPages() {
			return Math.ceil(this.totalItems / this.perPage);
		},
		startEntry() {
			return (this.currentPage - 1) * this.perPage + 1;
		},
		endEntry() {
			return Math.min(this.currentPage * this.perPage, this.totalItems);
		},
		displayedPages() {
			const total = this.totalPages;
			const current = this.currentPage;
			const delta = 2;
			let pages = [];

			if (total <= 7) {
				pages = Array.from({ length: total }, (_, i) => i + 1);
			} else {
				pages.push(1);

				if (current - delta <= 2) {
					const showPages = Array.from({ length: 4 }, (_, i) => i + 1);
					pages.push(...showPages);
					pages.push("...", total);
				} else if (current + delta >= total - 1) {
					pages.push("...");
					const showPages = Array.from({ length: 4 }, (_, i) => total - 4 + i);
					pages.push(...showPages);
				} else {
					pages.push("...");
					for (let i = current - delta; i <= current + delta; i++) {
						pages.push(i);
					}
					pages.push("...", total);
				}
			}

			return [...new Set(pages)];
		},
	},
	emits: ["update:currentPage", "prev-page", "next-page"],
};
</script>