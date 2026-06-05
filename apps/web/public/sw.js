// Service Worker para manejo de notificaciones

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body,
    icon: '/massano.png',
    badge: '/massano.png',
    tag: data.tag,
    requireInteraction: data.requireInteraction || false,
  }

  event.waitUntil(self.registration.showNotification(data.title || 'Massano', options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  // Abre la ventana/pestaña cuando el usuario hace clic en la notificación
  const tag = event.notification.tag
  const url = tag?.includes('order') ? `/pedido/${tag.split('-')[1]}` : '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Busca si ya hay una ventana abierta
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i]
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Si no hay ventana, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data
    self.registration.showNotification(title, options)
  }
})
