'use client'

import { useServiceWorker } from '@/hooks/use-service-worker'

export function ServiceWorkerInitializer() {
  useServiceWorker()
  return null
}
