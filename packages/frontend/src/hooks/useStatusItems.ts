/**
 * useStatusItems hook - Manages PWA status items
 * Following 2025 TypeScript best practices
 */

import { useMemo } from 'react'
import {
  Wifi,
  WifiOff,
  Zap,
  Smartphone,
  Bell,
  Share2,
  Download,
  CheckCircle2,
} from 'lucide-react'
import { shareApp } from '../utils/share'
import type { StatusItem, SyncAction, SyncType } from '../components/status'
import type { BeforeInstallPromptEvent } from '../types'

interface UseStatusItemsProps {
  readonly isOnline: boolean
  readonly swRegistration: ServiceWorkerRegistration | null
  readonly updateAvailable: boolean
  readonly onUpdate: () => void
  readonly isInstalled: boolean
  readonly installPrompt: BeforeInstallPromptEvent | null
  readonly onInstall: () => void
  readonly notificationsEnabled: boolean
  readonly onRequestNotifications: () => void
}

interface UseStatusItemsReturn {
  readonly coreStatusItems: readonly StatusItem[]
  readonly featureStatusItems: readonly StatusItem[]
  readonly updateStatusItem: StatusItem
}

export const useStatusItems = (
  props: UseStatusItemsProps
): UseStatusItemsReturn => {
  const {
    isOnline,
    swRegistration,
    updateAvailable,
    onUpdate,
    isInstalled,
    installPrompt,
    onInstall,
    notificationsEnabled,
    onRequestNotifications,
  } = props

  const coreStatusItems = useMemo(
    (): readonly StatusItem[] => [
      {
        id: 'network',
        icon: isOnline ? Wifi : WifiOff,
        label: 'Network',
        status: isOnline ? 'success' : 'error',
        tooltip: isOnline
          ? 'Online - App works offline thanks to service worker caching!'
          : 'Offline - Try refreshing, the app should still work!',
      },
      {
        id: 'service-worker',
        icon: Zap,
        label: 'Service Worker',
        status: swRegistration ? 'success' : 'warning',
        tooltip: swRegistration
          ? 'Active - Caching enabled, offline ready'
          : 'Loading - Setting up offline capabilities',
      },
    ],
    [isOnline, swRegistration]
  )

  const featureStatusItems = useMemo((): readonly StatusItem[] => {
    const items: StatusItem[] = []

    // Installation Status
    if (!isInstalled && installPrompt) {
      // Available to install - clickable warning state
      items.push({
        id: 'installation',
        icon: Smartphone,
        label: 'Installation',
        status: 'warning',
        tooltip:
          'This app can be installed on your device for a better experience. Click to install.',
        onClick: onInstall,
        disabled: false,
      })
    } else if (isInstalled) {
      // Already installed - success state
      items.push({
        id: 'installation',
        icon: Smartphone,
        label: 'Installation',
        status: 'success',
        tooltip: 'App is installed as PWA with app-like experience active',
      })
    } else {
      // Not available/supported - disabled state
      items.push({
        id: 'installation',
        icon: Smartphone,
        label: 'Installation',
        status: 'info',
        tooltip: 'Install prompt not available on this device/browser',
        onClick: () => {}, // Dummy onClick to make it clickable type
        disabled: true,
      })
    }

    // Notifications Status
    if (!notificationsEnabled) {
      items.push({
        id: 'notifications',
        icon: Bell,
        label: 'Notifications',
        status: 'info',
        tooltip:
          'Enable notifications to engage users even when the app is closed. Click to enable.',
        onClick: onRequestNotifications,
        disabled: false,
      })
    } else {
      items.push({
        id: 'notifications',
        icon: Bell,
        label: 'Notifications',
        status: 'success',
        tooltip:
          'Notifications are enabled - App can engage users even when closed',
      })
    }

    // Share Status - no indicator, just clickable action
    items.push({
      id: 'share',
      icon: Share2,
      label: 'Share App',
      status: 'info' as const,
      tooltip:
        'share' in navigator
          ? 'Share this app using native share API. Click to share.'
          : 'Share this app (will copy link to clipboard). Click to share.',
      onClick: shareApp,
      hideIndicator: true, // Special flag to hide the status indicator
    })

    return items
  }, [
    isInstalled,
    installPrompt,
    onInstall,
    notificationsEnabled,
    onRequestNotifications,
  ])

  const updateStatusItem = useMemo((): StatusItem => {
    if (updateAvailable) {
      return {
        id: 'update',
        icon: Download,
        label: 'Click to update...',
        status: 'warning',
        tooltip: 'Click to update to the latest version',
        onClick: onUpdate,
      }
    }

    // Always show update status - green checkmark when up to date
    return {
      id: 'update',
      icon: CheckCircle2,
      label: 'Up to date!',
      status: 'success',
      tooltip: 'App is up to date',
    }
  }, [updateAvailable, onUpdate])

  return {
    coreStatusItems,
    featureStatusItems,
    updateStatusItem,
  }
}

// Helper function to parse sync actions from raw strings
export const parseSyncActions = (
  rawActions: readonly string[]
): readonly SyncAction[] => {
  return rawActions.map((action, index) => {
    const parts = action.split(': ')
    // Parse timestamp properly - parts[0] is already a time string like "14:30:25"
    const timeString = parts[0]
    const today = new Date()
    let timestamp: Date
    try {
      if (timeString && timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        // Valid HH:MM:SS format
        const [hours, minutes, seconds] = timeString.split(':').map(Number)
        timestamp = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          hours,
          minutes,
          seconds
        )
      } else {
        // Fallback to current time if format is unexpected
        timestamp = new Date()
      }
    } catch {
      // Fallback to current time if parsing fails
      timestamp = new Date()
    }
    const content = parts.slice(1).join(': ')

    let type: SyncType = 'background'
    let message = content

    if (content.includes('Manual:')) {
      if (content.includes('Nothing to sync')) {
        type = 'nothing'
      } else if (content.includes('failed')) {
        type = 'forced' // Use forced type for failed syncs (red)
      } else {
        type = 'manual' // Use manual type for successful manual syncs (green)
      }
      message = content // Keep the full message including prefix
    } else if (content.includes('Background:')) {
      if (content.includes('Nothing to sync')) {
        type = 'nothing'
      } else if (content.includes('failed')) {
        type = 'forced' // Use forced type for failed syncs (red)
      } else {
        type = 'background' // Use background type for successful background syncs (green)
      }
      message = content // Keep the full message including prefix
    } else if (content.includes('Initial:')) {
      type = 'initial'
      message = content // Keep the full message including prefix
    } else if (content.includes('SW Sync:')) {
      type = 'service-worker'
      message = content.replace('SW Sync:', '').trim()
    } else if (content.includes('Synced:')) {
      type = 'synced'
      message = content.replace('Synced:', '').trim()
    }

    return {
      id: `sync-${index}-${timestamp.getTime()}`,
      type,
      message,
      timestamp,
    }
  })
}
