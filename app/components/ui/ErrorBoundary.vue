<template>
  <div>
    <!-- Error state -->
    <div v-if="hasError" class="w-full p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div class="flex items-start gap-4">
        <div class="shrink-0">
          <AlertCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold text-red-900 dark:text-red-200 mb-2">
            {{ errorTitle }}
          </h3>
          <p class="text-sm text-red-700 dark:text-red-300 mb-4">
            {{ errorMessage }}
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              @click="resetError"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white rounded-md text-sm font-medium transition-colors"
            >
              Try Again
            </button>
            <button
              v-if="showDetails"
              @click="toggleDetails"
              class="px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 rounded-md text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
            >
              {{ showFullError ? 'Hide' : 'Show' }} Details
            </button>
          </div>

          <!-- Error details (optional) -->
          <div v-if="showFullError && error" class="mt-4 p-3 bg-red-900/10 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
            <pre class="text-xs text-red-800 dark:text-red-200 overflow-auto max-h-48 whitespace-pre-wrap wrap-break-word">{{ formatError(error) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Normal state - render slot -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { AlertCircle } from 'lucide-vue-next'

  interface Props {
    /**
     * Title shown in the error UI
     */
    errorTitle?: string
    /**
     * Whether to show error details (stack trace, etc.)
     */
    showDetails?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    errorTitle: 'Something went wrong',
    showDetails: false
  })

  const emit = defineEmits<{
    /** Emitted when error is caught */
    error: [error: Error]
    /** Emitted when user clicks "Try Again" */
    reset: []
  }>()

  const hasError = ref(false)
  const error = ref<Error | null>(null)
  const showFullError = ref(false)

  const errorMessage = ref<string>('')

  /**
   * Called by Vue when an error is caught
   * This is set up via onErrorCaptured
   */
  const captureError = (err: Error) => {
    hasError.value = true
    error.value = err
    errorMessage.value = err.message || 'An unexpected error occurred. Please try again.'
    emit('error', err)
    return false // Prevent error from propagating
  }

  const resetError = () => {
    hasError.value = false
    error.value = null
    errorMessage.value = ''
    showFullError.value = false
    emit('reset')
  }

  const toggleDetails = () => {
    showFullError.value = !showFullError.value
  }

  const formatError = (err: Error): string => {
    return `${err.name}: ${err.message}\n${err.stack || 'No stack trace available'}`
  }

  // Expose for programmatic error handling
  defineExpose({
    captureError,
    resetError,
    hasError,
    error
  })
</script>
