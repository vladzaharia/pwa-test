import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Generic async state management utilities
 */

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  lastUpdated: Date | null
}

export interface AsyncActions<T> {
  execute: (...args: unknown[]) => Promise<T | null>
  reset: () => void
  setData: (data: T) => void
  setError: (error: string) => void
}

/**
 * Generic async operation hook
 */
export function useAsync<T>(
  asyncFunction?: (...args: unknown[]) => Promise<T>,
  immediate = false
): [AsyncState<T>, AsyncActions<T>] {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  })

  const executionRef = useRef<number>(0)

  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
      if (!asyncFunction) return null

      const currentExecution = ++executionRef.current

      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const result = await asyncFunction(...args)

        // Only update if this is still the latest execution
        if (currentExecution === executionRef.current) {
          setState({
            data: result,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          })
        }

        return result
      } catch (error) {
        // Only update if this is still the latest execution
        if (currentExecution === executionRef.current) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          }))
        }
        return null
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    })
  }, [])

  const setData = useCallback((data: T) => {
    setState((prev) => ({
      ...prev,
      data,
      error: null,
      lastUpdated: new Date(),
    }))
  }, [])

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      error,
      loading: false,
    }))
  }, [])

  // Execute immediately if requested
  useEffect(() => {
    if (immediate && asyncFunction) {
      execute()
    }
  }, [immediate, execute, asyncFunction])

  return [
    state,
    {
      execute,
      reset,
      setData,
      setError,
    },
  ]
}

/**
 * Debounced async operation hook
 */
export function useDebouncedAsync<T>(
  asyncFunction: (...args: unknown[]) => Promise<T>,
  delay = 300
): [AsyncState<T>, (...args: unknown[]) => void] {
  const [state, actions] = useAsync<T>(asyncFunction, false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const debouncedExecute = useCallback(
    (...args: unknown[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        actions.execute(...args)
      }, delay)
    },
    [actions, delay]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return [state, debouncedExecute]
}

/**
 * Retry logic utility
 */
export interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  backoffMultiplier?: number
  shouldRetry?: (error: Error) => boolean
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    backoffMultiplier = 2,
    shouldRetry = () => true,
  } = options

  let lastError: Error | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      if (attempt === maxRetries || !shouldRetry(lastError)) {
        throw lastError
      }

      const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Unknown error')
}

/**
 * Timeout utility for promises
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ])
}

/**
 * Cache utility for async operations
 */
export class AsyncCache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>()
  private ttl: number

  constructor(ttlMs = 5 * 60 * 1000) {
    // 5 minutes default
    this.ttl = ttlMs
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }
}
