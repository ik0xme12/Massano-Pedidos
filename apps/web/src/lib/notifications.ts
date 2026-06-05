// Web Notifications Service

export const notificationService = {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones')
      return 'denied'
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission
    }

    return Notification.permission
  },

  isSupported(): boolean {
    return 'Notification' in window
  },

  isEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted'
  },

  async show(title: string, options?: NotificationOptions) {
    if (!this.isEnabled()) return

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Si hay service worker, usarlo
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      })
    } else {
      // Fallback a notificación estándar
      new Notification(title, options)
    }
  },

  // Notificaciones específicas para pedidos
  notifyOrderStatus(status: string, orderId: string): void {
    const messages: Record<string, string> = {
      confirmed: '✅ Tu pedido fue confirmado',
      preparing: '👨‍🍳 Tu pedido se está preparando',
      ready: '✅ Tu pedido está listo para buscar',
      on_the_way: '🚗 Tu pedido está en camino',
      delivered: '🎉 Tu pedido fue entregado',
      pending: '📝 Nuevo pedido recibido',
    }

    const title = messages[status] || 'Actualización en tu pedido'

    this.show(title, {
      icon: '/massano.png',
      badge: '/massano.png',
      tag: `order-${orderId}`,
      requireInteraction: status === 'pending', // Mantener alerta si es nuevo
    })
  },

  notifyNewOrder(orderId: string): void {
    this.show('📥 Nuevo pedido', {
      icon: '/massano.png',
      badge: '/massano.png',
      tag: `new-order-${orderId}`,
      requireInteraction: true,
      body: `Haz clic para ver detalles`,
    })
  },
}
