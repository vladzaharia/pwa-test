import { useEffect, useRef, useState } from 'react'

/**
 * Generic event listener hook with proper TypeScript support
 * Automatically handles cleanup and prevents memory leaks
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null
): void
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element?: Document | null
): void
export function useEventListener<K extends keyof HTMLElementEventMap>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element?: HTMLElement | null
): void
export function useEventListener<K extends keyof MediaQueryListEventMap>(
  eventName: K,
  handler: (event: MediaQueryListEventMap[K]) => void,
  element?: MediaQueryList | null
): void
export function useEventListener(
  eventName: string,
  handler: (event: Event) => void,
  element?: EventTarget | null
): void {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement = element ?? window
    if (!targetElement?.addEventListener) return

    const eventListener = (event: Event) => savedHandler.current(event)
    targetElement.addEventListener(eventName, eventListener)

    return () => {
      targetElement.removeEventListener(eventName, eventListener)
    }
  }, [eventName, element])
}

/**
 * Hook for listening to online/offline events
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEventListener('online', () => setIsOnline(true))
  useEventListener('offline', () => setIsOnline(false))

  return isOnline
}

/**
 * Hook for listening to media query changes
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)

    mediaQuery.addEventListener('change', handler)
    setMatches(mediaQuery.matches)

    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}
