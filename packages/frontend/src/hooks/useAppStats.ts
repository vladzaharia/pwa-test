import { useState, useEffect } from 'react'
import {
  useLocalStorageCounter,
  useLocalStorageTimestamp,
} from './useLocalStorage'

export function useAppStats() {
  const [visitCount, incrementVisits] = useLocalStorageCounter('pwa-visits', 0)
  const [lastVisit, updateLastVisit] =
    useLocalStorageTimestamp('pwa-last-visit')
  const [loadTime, setLoadTime] = useState<number | null>(null)

  useEffect(() => {
    // Measure load time
    const startTime = performance.now()
    setLoadTime(startTime)

    // Track visits and PWA lifecycle
    incrementVisits()
    updateLastVisit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - this should run only once on mount

  return {
    visitCount,
    lastVisit: lastVisit?.toISOString() || null,
    loadTime,
  }
}
