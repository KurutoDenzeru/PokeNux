/**
 * Generic cache manager with TTL, size limits, and eviction policies
 * Replaces duplicate cache implementations across the codebase
 */

export interface CacheOptions {
  /** Time-to-live in milliseconds (default: 10 minutes) */
  ttl?: number
  /** Maximum number of items to store (default: 500) */
  maxSize?: number
  /** Eviction policy: 'LRU' (least recently used) or 'FIFO' (first in, first out) */
  evictionPolicy?: 'LRU' | 'FIFO'
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  accessCount: number
  lastAccessTime: number
}

/**
 * Generic cache class with TTL and size management
 * 
 * @example
 * ```typescript
 * const cache = new Cache<Pokemon>({ ttl: 10 * 60 * 1000, maxSize: 100 })
 * 
 * // Set
 * cache.set('pokemon-1', pokemonData)
 * 
 * // Get (returns null if expired or not found)
 * const data = cache.get('pokemon-1')
 * 
 * // Clear
 * cache.clear()
 * ```
 */
export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private ttl: number
  private maxSize: number
  private evictionPolicy: 'LRU' | 'FIFO'

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? 10 * 60 * 1000 // 10 minutes default
    this.maxSize = options.maxSize ?? 500
    this.evictionPolicy = options.evictionPolicy ?? 'LRU'
  }

  /**
   * Get a value from the cache
   * Returns null if expired or not found
   */
  get(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) return null

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key)
      return null
    }

    // Update access info for LRU
    entry.accessCount++
    entry.lastAccessTime = Date.now()

    return entry.data
  }

  /**
   * Set a value in the cache
   */
  set(key: string, data: T): void {
    // Check if we need to evict
    if (this.store.size >= this.maxSize && !this.store.has(key)) {
      this.evict()
    }

    this.store.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0,
      lastAccessTime: Date.now()
    })
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key)
      return false
    }

    return true
  }

  /**
   * Delete a specific key
   */
  delete(key: string): boolean {
    return this.store.delete(key)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
      evictionPolicy: this.evictionPolicy
    }
  }

  /**
   * Remove expired entries
   */
  prune(): number {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.store.delete(key)
        removed++
      }
    }

    return removed
  }

  /**
   * Evict one entry based on policy
   */
  private evict(): void {
    if (this.store.size === 0) return

    let keyToDelete: string | null = null

    if (this.evictionPolicy === 'LRU') {
      // Find least recently used
      let minAccessTime = Infinity
      for (const [key, entry] of this.store.entries()) {
        if (entry.lastAccessTime < minAccessTime) {
          minAccessTime = entry.lastAccessTime
          keyToDelete = key
        }
      }
    } else {
      // FIFO: remove the oldest entry (first one in the map)
      const firstKey = this.store.keys().next().value
      keyToDelete = firstKey ?? null
    }

    if (keyToDelete) {
      this.store.delete(keyToDelete)
    }
  }
}

/**
 * Create a cache for a specific type with convenient defaults
 */
export function createCache<T>(options: CacheOptions = {}): Cache<T> {
  return new Cache<T>(options)
}
