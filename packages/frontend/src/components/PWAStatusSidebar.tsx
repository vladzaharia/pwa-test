/**
 * PWAStatusSidebar - Main PWA status display component
 * Refactored to use componentized approach following 2025 TypeScript best practices
 */

import { useState } from 'react'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Clock, Zap, Server } from 'lucide-react'
import { StatusIndicator, StatusSection, SyncHistory } from './status'
import { useStatusItems, parseSyncActions } from '../hooks/useStatusItems'
import { formatLoadTime, formatLoadTimeTooltip } from '../lib/format-utils'
import { PWAInstallDrawer } from './PWAInstallDrawer'
import type { BeforeInstallPromptEvent } from '../types'

interface PWAStatusSidebarProps {
  readonly visitCount: number
  readonly lastVisit: string | null
  readonly loadTime: number | null
  readonly isServerConnected: boolean | null
  readonly lastServerCheck: Date | null
  readonly isInstalled: boolean
  readonly installPrompt: BeforeInstallPromptEvent | null
  readonly handleInstall: () => void
  readonly forceInstall: (showManualInstructions: () => void) => Promise<void>
  readonly isOnline: boolean
  readonly swRegistration: ServiceWorkerRegistration | null
  readonly updateAvailable: boolean
  readonly handleUpdate: () => void
  readonly notificationsEnabled: boolean
  readonly requestNotifications: () => void
  readonly backgroundSyncDemo: readonly string[]
}

export function PWAStatusSidebar({
  visitCount,
  lastVisit,
  loadTime,
  isServerConnected,
  lastServerCheck,
  isInstalled,
  installPrompt,
  forceInstall,
  isOnline,
  swRegistration,
  updateAvailable,
  handleUpdate,
  notificationsEnabled,
  requestNotifications,
  backgroundSyncDemo,
}: PWAStatusSidebarProps) {
  // Drawer state for installation instructions
  const [showInstallDrawer, setShowInstallDrawer] = useState(false)

  // Use the status items hook to get organized status data
  const { coreStatusItems, featureStatusItems, updateStatusItem } =
    useStatusItems({
      isOnline,
      swRegistration,
      updateAvailable,
      onUpdate: handleUpdate,
      isInstalled,
      installPrompt,
      onInstall: () => forceInstall(() => setShowInstallDrawer(true)),
      onShowInstallInstructions: () => setShowInstallDrawer(true),
      notificationsEnabled,
      onRequestNotifications: requestNotifications,
    })

  // Parse sync actions from raw strings
  const syncActions = parseSyncActions(backgroundSyncDemo)

  // Create visit stats as a status item - only show tooltip if it provides additional info
  const visitStatsItem = {
    id: 'visit-stats',
    icon: Clock,
    label: 'Visits',
    status: 'info' as const,
    tooltip:
      visitCount === 1
        ? 'Welcome! This is your first visit.'
        : lastVisit && visitCount > 1
          ? `Last visit: ${new Date(lastVisit).toLocaleString()}`
          : `You've visited ${visitCount} times.`,
  }
  const showVisitTooltip = Boolean(
    visitCount === 1 || (lastVisit !== null && visitCount > 1)
  )

  // Create performance status item
  const performanceItem = {
    id: 'performance',
    icon: Zap,
    label: 'Load Time',
    status: 'success' as const,
    tooltip: formatLoadTimeTooltip(loadTime),
  }

  // Create server connection status item - only show tooltip with last check time if not currently connected
  const serverConnectionItem = {
    id: 'server-connection',
    icon: Server,
    label: 'Server Connection',
    status:
      isServerConnected === null
        ? ('info' as const)
        : isServerConnected
          ? ('success' as const)
          : ('error' as const),
    tooltip:
      isServerConnected === null
        ? 'Checking connection to local API server...'
        : isServerConnected
          ? 'Connected to local API server for todo data'
          : `Cannot connect to local API server - todos will work offline only${lastServerCheck ? ` - Last checked: ${lastServerCheck.toLocaleTimeString()}` : ''}`,
  }
  // Only show tooltip if not connected or if there's additional info (last check time when disconnected)
  const showServerTooltip = Boolean(isServerConnected !== true)

  return (
    <ScrollArea className="h-full">
      <div className="p-4 min-h-full flex flex-col">
        {/* Main content sections */}
        <div className="space-y-1 flex-1">
          {/* Visit Statistics */}
          <StatusIndicator
            item={visitStatsItem}
            displayValue={visitCount}
            showTooltip={showVisitTooltip}
          />

          {/* Performance */}
          <StatusIndicator
            item={performanceItem}
            displayValue={formatLoadTime(loadTime)}
            showTooltip={false}
          />

          {/* Core Status Items - Network first */}
          {coreStatusItems.map((item) => (
            <StatusIndicator key={item.id} item={item} showTooltip={false} />
          ))}

          {/* Server Connection - below Service Worker */}
          <StatusIndicator
            item={serverConnectionItem}
            showTooltip={showServerTooltip}
          />

          <Separator className="my-3" />

          {/* PWA Features */}
          <StatusSection title="PWA Features">
            {/* Update Status - first item in PWA Features */}
            <StatusIndicator item={updateStatusItem} showTooltip={false} />

            {featureStatusItems.map((item) => (
              <StatusIndicator key={item.id} item={item} showTooltip={false} />
            ))}
          </StatusSection>
        </div>

        {/* Spacer to push recent syncs to bottom */}
        <div className="flex-1" />

        {/* Recent Syncs - at the very bottom */}
        <div className="mt-auto">
          <StatusSection title="Recent Syncs">
            <SyncHistory actions={syncActions} maxEntries={4} />
          </StatusSection>
        </div>
      </div>

      {/* Installation Instructions Drawer */}
      <PWAInstallDrawer
        open={showInstallDrawer}
        onOpenChange={setShowInstallDrawer}
      />
    </ScrollArea>
  )
}
