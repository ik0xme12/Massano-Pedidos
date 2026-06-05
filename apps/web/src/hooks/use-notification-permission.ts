'use client'

import { useEffect, useState } from 'react'
import { notificationService } from '@/lib/notifications'

export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    if (!notificationService.isSupported()) {
      setSupported(false)
      return
    }

    setSupported(true)
    setPermission(window.Notification.permission)
  }, [])

  const requestPermission = async () => {
    if (!supported) return

    const result = await notificationService.requestPermission()
    setPermission(result)
    return result
  }

  return {
    permission,
    supported,
    requestPermission,
    isGranted: permission === 'granted',
  }
}
