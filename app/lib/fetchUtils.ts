// Fetch utility with retry and timeout support
export interface FetchOptions {
  /** Maximum number of retry attempts (default: 3) */
  retries?: number
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number
  /** Initial delay for exponential backoff in ms (default: 1000) */
  initialDelay?: number
  /** Maximum delay for exponential backoff in ms (default: 10000) */
  maxDelay?: number
}

export interface FetchResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
}

// Internal fetch with timeout helper
function fetchWithTimeoutInternal(url: string, fetchInit: RequestInit = {}, timeoutMs: number = 10000): Promise<Response> {
  return Promise.race([
    fetch(url, fetchInit),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ])
}

// Calculate exponential backoff delay with jitter
function calculateBackoffDelay(attempt: number, initialDelay: number = 1000, maxDelay: number = 10000): number {
  const exponentialDelay = initialDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 1000 // Add up to 1s of jitter
  return Math.min(exponentialDelay + jitter, maxDelay)
}

/**
 * Fetch with retry logic and timeout protection
 *
 * @example
 * ```typescript
 * const result = await fetchWithRetry<Pokemon>(
 *   'https://pokeapi.co/api/v2/pokemon/1',
 *   { retries: 3, timeout: 5000 }
 * )
 *
 * if (result.success) {
 *   console.log(result.data)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export async function fetchWithRetry<T = any>(
  url: string,
  options: FetchOptions = {},
  fetchInit: RequestInit = {}
): Promise<FetchResult<T>> {
  const {
    retries = 3,
    timeout = 10000,
    initialDelay = 1000,
    maxDelay = 10000
  } = options

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeoutInternal(url, fetchInit, timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json() as T

      return {
        success: true,
        data,
        attempts: attempt + 1
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1
        }
      }

      // If this is the last attempt, return error
      if (attempt === retries) {
        return {
          success: false,
          error: lastError,
          attempts: attempt + 1
        }
      }

      // Wait before retrying with exponential backoff
      const delayMs = calculateBackoffDelay(attempt, initialDelay, maxDelay)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: retries + 1
  }
}

// Simple fetch with timeout utility
export async function fetchSimpleWithTimeout<T = any>(
  url: string,
  timeoutMs: number = 10000,
  fetchInit: RequestInit = {}
): Promise<T> {
  const response = await Promise.race([
    fetch(url, fetchInit),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error(`Fetch timeout after ${timeoutMs}ms`)), timeoutMs)
    )
  ])

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
