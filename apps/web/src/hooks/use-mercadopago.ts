'use client'

import { useEffect, useState } from 'react'
import { mercadopagoService } from '@/lib/mercadopago-service'

export function useMercadoPago() {
  const [isReady, setIsReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      mercadopagoService.init()
      setIsReady(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to init MercadoPago'))
    }
  }, [])

  const createAndOpenCheckout = async (
    orderId: string,
    total: number,
    email: string
  ) => {
    try {
      setLoading(true)
      setError(null)

      const preferenceId = await mercadopagoService.createPreference(
        orderId,
        total,
        email
      )

      await mercadopagoService.openCheckout(preferenceId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Payment failed')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    isReady,
    loading,
    error,
    createAndOpenCheckout,
  }
}
