<template>
  <div class="flex items-center justify-center w-full h-24">
    <svg class="animate-spin-slow h-12 w-12 text-red-500" viewBox="0 0 24 24" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.2" />
      <path d="M2 12a10 10 0 0116-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  </div>
</template>

<style scoped>
  .animate-spin-slow {
    animation: spin 1.4s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg)
    }

    to {
      transform: rotate(360deg)
    }
  }
</style>
