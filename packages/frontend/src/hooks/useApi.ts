import { useState, useCallback, useEffect } from 'react'

export interface ApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface ApiOptions {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Generic API hook with loading states, error handling, and retry logic
 */
export function useApi<T = unknown>(
  defaultData: T | null = null,
  options: ApiOptions = {}
): [
  ApiState<T>,
  (url: string, init?: RequestInit) => Promise<T | null>,
  () => void,
] {
  const { timeout = 5000, retries = 0, retryDelay = 1000 } = options

  const [state, setState] = useState<ApiState<T>>({
    data: defaultData,
    loading: false,
    error: null,
  })

  const fetchData = useCallback(
    async (url: string, init?: RequestInit): Promise<T | null> => {
      setState((prev) => ({ ...prev, loading: true, error: null }))

      let lastError: Error | null = null

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), timeout)

          const response = await fetch(url, {
            ...init,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }

          const data: T = await response.json()
          setState({ data, loading: false, error: null })
          return data
        } catch (error) {
          lastError =
            error instanceof Error ? error : new Error('Unknown error')

          if (attempt < retries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay))
          }
        }
      }

      const errorMessage = lastError?.message || 'Request failed'
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      return null
    },
    [timeout, retries, retryDelay]
  )

  const reset = useCallback(() => {
    setState({ data: defaultData, loading: false, error: null })
  }, [defaultData])

  return [state, fetchData, reset]
}

/**
 * Hook for checking server connectivity
 */
export function useServerHealth(
  endpoint: string,
  checkInterval = 30000
): [boolean | null, Date | null, () => Promise<boolean>] {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      })

      const connected = response.ok
      setIsConnected(connected)
      setLastChecked(new Date())
      return connected
    } catch {
      setIsConnected(false)
      setLastChecked(new Date())
      return false
    }
  }, [endpoint])

  // Set up periodic health checks
  useEffect(() => {
    checkConnection()
    const interval = setInterval(checkConnection, checkInterval)
    return () => clearInterval(interval)
  }, [checkConnection, checkInterval])

  return [isConnected, lastChecked, checkConnection]
}
