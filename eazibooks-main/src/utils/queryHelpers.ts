/**
 * Query helper utilities for optimizing database operations
 */

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param timeoutMs Timeout in milliseconds (default: 10000ms)
 * @param errorMessage Custom error message
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Retry a promise-based function with exponential backoff
 * @param fn Function that returns a promise
 * @param maxRetries Maximum number of retries (default: 3)
 * @param delayMs Initial delay in milliseconds (default: 1000ms)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (
        lastError.message?.includes('relation') ||
        lastError.message?.includes('does not exist') ||
        lastError.message?.includes('PGRST116')
      ) {
        throw lastError;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Debounce a function
 * @param fn Function to debounce
 * @param delayMs Delay in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Cache manager for database queries
 */
class QueryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.defaultTTL)
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return false;
    }

    // Check if expired
    if (Date.now() > cached.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

export const queryCache = new QueryCache();
