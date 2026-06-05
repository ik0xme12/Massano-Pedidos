import { useEffect, useState } from 'react'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'

export function useExpoNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>()
  const [notification, setNotification] = useState<Notifications.Notification | undefined>()

  useEffect(() => {
    registerForPushNotifications()
  }, [])

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      // Handle notification click
      const data = response.notification.request.content.data
      if (data.orderId) {
        // Navigate to order details
        // TODO: implement deep linking
      }
    })

    return () => subscription.remove()
  }, [])

  async function registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications')
      return
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!')
        return
      }

      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId
      if (!projectId) {
        throw new Error('Project ID not found')
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      })

      setExpoPushToken(token.data)

      // TODO: Save token to Supabase
      // await saveUserPushToken(token.data)
    } catch (e) {
      console.error('Error getting push token:', e)
    }
  }

  return {
    expoPushToken,
    notification,
  }
}
