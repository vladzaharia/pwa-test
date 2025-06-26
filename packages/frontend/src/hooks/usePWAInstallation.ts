import { useState, useEffect } from 'react'
import { BeforeInstallPromptEvent } from '../types'

export function usePWAInstallation() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    // Check if app is already installed using multiple methods
    const checkInstallStatus = () => {
      // Method 1: Check display mode
      const isStandalone = window.matchMedia(
        '(display-mode: standalone)'
      ).matches

      // Method 2: Check if launched from home screen (iOS)
      const isIOSStandalone = (window.navigator as any).standalone === true

      // Method 3: Check if running in TWA (Android)
      const isTWA = document.referrer.includes('android-app://')

      const installed = isStandalone || isIOSStandalone || isTWA
      setIsInstalled(installed)

      if (installed) {
        console.log('PWA is already installed')
      }
    }

    checkInstallStatus()

    // Debug: Log PWA installation criteria
    const debugInstallCriteria = () => {
      console.log('PWA Installation Debug:')
      console.log(
        '- HTTPS:',
        location.protocol === 'https:' || location.hostname === 'localhost'
      )
      console.log('- Service Worker:', 'serviceWorker' in navigator)
      console.log(
        '- Manifest:',
        document.querySelector('link[rel="manifest"]') !== null
      )
      console.log(
        '- Display mode:',
        window.matchMedia('(display-mode: standalone)').matches
      )
      console.log('- User agent:', navigator.userAgent)
    }

    debugInstallCriteria()

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired')
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      setCanInstall(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
      setCanInstall(false)
      console.log('PWA was installed successfully')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Fallback: Check if installation is possible after service worker is ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('Service worker is ready')
        // Some browsers may delay the beforeinstallprompt event
        setTimeout(() => {
          if (!installPrompt && !isInstalled) {
            console.log('beforeinstallprompt event not fired after 3 seconds')
            // Check if we can still detect installation capability
            const hasManifest =
              document.querySelector('link[rel="manifest"]') !== null
            const hasServiceWorker = navigator.serviceWorker.controller !== null
            const isSecure =
              location.protocol === 'https:' ||
              location.hostname === 'localhost'

            if (hasManifest && hasServiceWorker && isSecure) {
              console.log('PWA criteria met, but beforeinstallprompt not fired')
              // This might happen if the app was previously installed and uninstalled
            }
          }
        }, 3000)
      })
    }

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        console.log('Prompting user to install PWA')
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        console.log('User choice:', outcome)

        if (outcome === 'accepted') {
          setInstallPrompt(null)
          setCanInstall(false)
          // Don't set isInstalled here - wait for appinstalled event
          console.log('User accepted installation')
        } else {
          console.log('User dismissed installation')
        }
      } catch (error) {
        console.error('Error during installation:', error)
      }
    } else {
      console.log('No install prompt available')
    }
  }

  return {
    installPrompt,
    isInstalled,
    canInstall,
    handleInstall,
  }
}
