import { useState, useCallback } from 'react'

/**
 * Generic localStorage hook with TypeScript support
 * Provides type-safe localStorage operations with automatic JSON serialization
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      localStorage.removeItem(key)
      setStoredValue(defaultValue)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, defaultValue])

  return [storedValue, setValue, removeValue]
}

/**
 * Hook for managing counter values in localStorage
 * Useful for visit counts, usage statistics, etc.
 */
export function useLocalStorageCounter(
  key: string,
  initialValue = 0
): [number, () => void, () => void] {
  const [count, setCount, resetCount] = useLocalStorage(key, initialValue)

  const increment = useCallback(() => {
    setCount((prev) => prev + 1)
  }, [setCount])

  const reset = useCallback(() => {
    resetCount()
  }, [resetCount])

  return [count, increment, reset]
}

/**
 * Hook for managing timestamp values in localStorage
 * Automatically handles ISO string conversion
 */
export function useLocalStorageTimestamp(
  key: string
): [Date | null, () => void, () => void] {
  const [timestamp, setTimestamp, removeTimestamp] = useLocalStorage<
    string | null
  >(key, null)

  const updateTimestamp = useCallback(() => {
    setTimestamp(new Date().toISOString())
  }, [setTimestamp])

  const parsedTimestamp = timestamp ? new Date(timestamp) : null

  return [parsedTimestamp, updateTimestamp, removeTimestamp]
}
