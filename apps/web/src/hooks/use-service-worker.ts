'use client'

import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers no soportados')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration)
      })
      .catch((error) => {
        console.error('Error registrando Service Worker:', error)
      })
  }, [])
}
