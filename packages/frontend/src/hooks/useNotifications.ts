import { useState, useEffect } from 'react'

export function useNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsEnabled(permission === 'granted')

      if (permission === 'granted') {
        new Notification('PWA Demo', {
          body: 'Notifications are now enabled! This is how PWAs can engage users.',
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        })
      }
    }
  }

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (notificationsEnabled) {
      new Notification(title, {
        icon: '/pwa-192x192.png',
        ...options,
      })
    }
  }

  return {
    notificationsEnabled,
    requestNotifications,
    showNotification,
  }
}
