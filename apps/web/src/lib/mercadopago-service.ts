const MERCADOPAGO_PUBLIC_KEY = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!

export const mercadopagoService = {
  async init() {
    // Cargar MercadoPago SDK dinámicamente
    if (typeof window !== 'undefined' && !(window as any).mp) {
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.async = true
      document.head.appendChild(script)

      return new Promise((resolve) => {
        script.onload = () => {
          ;(window as any).mp?.init?.({ publicKey: MERCADOPAGO_PUBLIC_KEY, locale: 'es-AR' })
          resolve(null)
        }
      })
    }
  },

  async createPreference(orderId: string, total: number, email: string) {
    try {
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          total,
          email,
          description: `Pedido #${orderId.slice(0, 8)}`,
        }),
      })

      if (!response.ok) throw new Error('Failed to create preference')

      const data = await response.json()
      return data.preferenceId
    } catch (error) {
      console.error('Error creating MP preference:', error)
      throw error
    }
  },

  async openCheckout(preferenceId: string) {
    try {
      // Usar la API de MercadoPago del navegador
      ;(window as any).mp?.bricks?.wallet?.create?.('wallet_container', {
        initialization: {
          preferenceId,
        },
        onError: (error: any) => {
          console.error('Error en checkout:', error)
          throw error
        },
      })
    } catch (error) {
      console.error('Error opening MP checkout:', error)
      throw error
    }
  },
}
