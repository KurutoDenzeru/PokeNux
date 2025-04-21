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
              href="#"
              @click.prevent="$emit('prev-page')"
              :class="[
                'pagination-link flex items-center justify-center px-4 h-10 ms-0 leading-tight border border-e-0 border-gray-300 rounded-s-lg',
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]"
              :aria-disabled="currentPage === 1"
              aria-label="Previous page"
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
          <li v-for="(page, index) in displayedPages" :key="index">
            <a
              v-if="page !== '...'"
              href="#"
              @click.prevent="$emit('update:currentPage', page)"
              :class="[
                'pagination-link flex items-center justify-center px-4 h-10 leading-tight border border-gray-300',
                currentPage === page
                  ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700',
              ]"
              :aria-current="currentPage === page ? 'page' : undefined"
              :aria-label="`Page ${page}`"
            >
              {{ page }}
            </a>
            <span
              v-else
              class="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300"
            >
              {{ page }}
            </span>
          </li>

          <!-- Next button -->
          <li>
            <a
              href="#"
              @click.prevent="$emit('next-page')"
              :class="[
                'pagination-link flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 rounded-e-lg',
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700 cursor-pointer',
              ]"
              :aria-disabled="currentPage === totalPages"
              aria-label="Next page"
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