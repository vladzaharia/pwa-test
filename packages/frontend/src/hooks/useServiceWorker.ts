import { useState, useEffect } from 'react'

export function useServiceWorker() {
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        setSwRegistration(registration)

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (swRegistration) {
      swRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    swRegistration,
    updateAvailable,
    handleUpdate,
  }
}
