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
    const debugInstallCriteria = async () => {
      console.log('=== PWA Installation Debug ===')
      console.log('- URL:', location.href)
      console.log('- Protocol:', location.protocol)
      console.log('- Hostname:', location.hostname)
      console.log(
        '- HTTPS/Localhost:',
        location.protocol === 'https:' || location.hostname === 'localhost'
      )
      console.log('- Service Worker Support:', 'serviceWorker' in navigator)

      // Check service worker registration
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration()
          console.log('- Service Worker Registered:', !!registration)
          console.log('- Service Worker Active:', !!registration?.active)
          console.log('- Service Worker Controlling:', !!navigator.serviceWorker.controller)
        } catch (e) {
          console.log('- Service Worker Error:', e)
        }
      }

      // Check manifest
      const manifestLink = document.querySelector('link[rel="manifest"]')
      console.log('- Manifest Link:', !!manifestLink)
      if (manifestLink) {
        console.log('- Manifest URL:', manifestLink.getAttribute('href'))
        try {
          const response = await fetch(manifestLink.getAttribute('href')!)
          const manifest = await response.json()
          console.log('- Manifest Content:', manifest)
          console.log('- Manifest Display:', manifest.display)
          console.log('- Manifest Start URL:', manifest.start_url)
          console.log('- Manifest Icons:', manifest.icons?.length || 0, 'icons')
        } catch (e) {
          console.log('- Manifest Fetch Error:', e)
        }
      }

      console.log(
        '- Display mode:',
        window.matchMedia('(display-mode: standalone)').matches
      )
      console.log('- User agent:', navigator.userAgent)
      console.log('- Browser:', {
        isChrome: navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg'),
        isEdge: navigator.userAgent.includes('Edg'),
        isSafari: navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome'),
        isFirefox: navigator.userAgent.includes('Firefox')
      })
      console.log('=== End PWA Debug ===')
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
              // Force a check for installation capability
              setCanInstall(true)
            }
          }
        }, 5000)
      })
    }

    // Additional check for installation capability
    const checkInstallCapability = () => {
      const isChrome = navigator.userAgent.includes('Chrome') && !navigator.userAgent.includes('Edg')
      const isEdge = navigator.userAgent.includes('Edg')
      const isSecure = location.protocol === 'https:' || location.hostname === 'localhost'

      console.log('Install capability check:', { isChrome, isEdge, isSecure, isInstalled })

      if ((isChrome || isEdge) && isSecure && !isInstalled) {
        // These browsers support PWA installation
        setTimeout(() => {
          if (!installPrompt) {
            console.log('beforeinstallprompt not fired, but browser supports PWA installation')
            console.log('This could be due to:')
            console.log('1. App was previously installed and uninstalled')
            console.log('2. User previously dismissed the prompt')
            console.log('3. Browser policy preventing automatic prompts')
            console.log('4. Missing PWA requirements')
            setCanInstall(true)
          }
        }, 3000)
      }
    }

    checkInstallCapability()

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
