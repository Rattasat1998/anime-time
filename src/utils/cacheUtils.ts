interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private defaultExpiry = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Set an item in cache
   */
  set<T>(key: string, data: T, expiryMs?: number): void {
    const expiry = expiryMs || this.defaultExpiry;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  /**
   * Get an item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // Check if expired
    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete an item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired items
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}

// Create a singleton instance
const cacheManager = new CacheManager();

// Clean up expired items every 5 minutes
setInterval(() => cacheManager.cleanup(), 5 * 60 * 1000);

export default cacheManager;

/**
 * Cache decorator for API calls
 */
export function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expiryMs?: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      // Try to get from cache first
      const cached = cacheManager.get<T>(key);
      if (cached !== null) {
        resolve(cached);
        return;
      }

      // If not in cache, fetch data
      const data = await fetchFn();
      cacheManager.set(key, data, expiryMs);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate cache key based on parameters
 */
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${prefix}:${sortedParams}`;
}
