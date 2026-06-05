# Push Notifications para Massano Pedidos

## Arquitectura Implementada

**Web (Next.js)**:
- Web Notifications API (notificaciones nativas del navegador)
- Service Worker para manejo en background
- Integración con Supabase Realtime

**Mobile (Expo)**:
- Expo Notifications (implementar en siguiente fase)
- Firebase Cloud Messaging / Expo Push Service

## Cómo Funciona en Web

### 1. Notificaciones en Primer Plano (Cliente Visible)
Cuando el usuario está viendo `/pedido/[id]` y el estado cambia:
```
Restaurante actualiza orden en BD
  ↓
Supabase Realtime notifica al cliente
  ↓
Hook useOrderSubscription recibe cambio
  ↓
Hook useOrderNotifications ve cambio de status
  ↓
Muestra notificación nativa del navegador
```

### 2. Notificaciones en Background (Tab Cerrada)
Si el usuario tiene habilitado el Service Worker:
```
Restaurante actualiza orden
  ↓
Service Worker recibe evento
  ↓
Muestra notificación en el sistema (OS level)
  ↓
Usuario hace clic → abre pestaña en /pedido/[id]
```

## Paso 1: Habilitar Notificaciones en el Navegador

El usuario verá un prompt la primera vez que:
- Entra a `/pedido/[id]` (cliente)
- Entra a `/restaurante` (restaurante)

Puede:
- ✅ Habilitar: recibe todas las notificaciones
- ❌ Bloquear: no recibe notificaciones
- Cambiar después en Settings del navegador

## Paso 2: Testing en Local

### Test 1: Notificación al cambiar estado

```
1. Abre dos pestañas:
   - Pestaña A (Cliente): http://localhost:3001/pedido/[order-id]
   - Pestaña B (Restaurante): http://localhost:3001/restaurante

2. En Pestaña A, haz clic "Habilitar notificaciones"
   - Acepta el prompt del navegador

3. En Pestaña B, busca el pedido y haz clic "Confirmar"

4. En Pestaña A, deberías ver:
   - Notificación del navegador: "✅ Tu pedido fue confirmado"
   - Timeline se actualiza a "Confirmado"
```

### Test 2: Service Worker en Background

```
1. Abre /restaurante
2. Habilita notificaciones
3. Cierra la pestaña
4. Abre otra pestaña, coloca un nuevo pedido desde /checkout
5. Pestaña de restaurante (cerrada) recibe notificación del sistema
```

## Paso 3: Tipos de Notificaciones

### Para Cliente:

```ts
// Cuando cambia estado del pedido
notifyOrderStatus('confirmed', orderId)  // ✅ Tu pedido fue confirmado
notifyOrderStatus('preparing', orderId)  // 👨‍🍳 Tu pedido se está preparando
notifyOrderStatus('ready', orderId)      // ✅ Tu pedido está listo para buscar
notifyOrderStatus('on_the_way', orderId) // 🚗 Tu pedido está en camino
notifyOrderStatus('delivered', orderId)  // 🎉 Tu pedido fue entregado
```

### Para Restaurante:

```ts
// Cuando llega nuevo pedido
notifyNewOrder(orderId)  // 📥 Nuevo pedido
// + banner de notificación en /restaurante
```

## Paso 4: Configuración del Service Worker

El archivo `/public/sw.js` maneja:
- **Eventos push**: recibe notificaciones
- **Clicks en notificación**: abre URL correcta
- **Messages desde componentes**: muestra notificación

No necesita configuración adicional en desarrollo.

## Paso 5: Troubleshooting

### "No veo notificaciones"

1. **Verifica permisos del navegador**:
   - DevTools → Application → Manifest → Notifications
   - Debe mostrar "granted"

2. **Verifica que Realtime está habilitado**:
   - Cuando cambias estado en restaurante, ¿ve el cambio el cliente?
   - Si no ve Realtime, no verá notificaciones

3. **Service Worker no registrado**:
   - DevTools → Application → Service Workers
   - Debe mostrar `sw.js` con estado "activated"
   - Si no aparece:
     - Recarga la página (Ctrl+F5)
     - Limpia cache: DevTools → Application → Clear storage

### "Notificación no desaparece"

Las notificaciones con `requireInteraction: true` requieren click del usuario para cerrarse.
Esto es intencional para nuevos pedidos (restaurante) y cambios críticos.

### "Notificación abre URL equivocada"

El Service Worker abre URL basada en el `tag` de la notificación:
- Tag: `order-123` → abre `/pedido/123`
- Si tag no tiene formato correcto, abre homepage

## Móvil (Expo) - Próximo Paso

Para implementar en mobile:

```ts
// apps/mobile/src/hooks/use-expo-notifications.ts
import * as Notifications from 'expo-notifications'
import { useEffect } from 'react'

export function useExpoNotifications() {
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    })
  }, [])
}
```

## Integración con Expo Push Service

Para notificaciones reales en producción:

```ts
import * as Notifications from 'expo-notifications'

// Obtener token de push
const token = await Notifications.getExpoPushTokenAsync()

// Guardar en BD para enviar notificaciones después
// POST /api/notifications/register
{
  user_id: auth.uid(),
  push_token: token,
  platform: 'expo'
}
```

## API de Notificaciones (Futuro)

Cuando implemente backend:

```ts
// POST /api/notifications/send
{
  user_id: "uuid",
  type: "order_status",
  title: "Tu pedido está listo",
  body: "Haz clic para ver detalles",
  data: {
    order_id: "order-uuid"
  }
}

// Envía a:
// - Web: via Service Worker (si está conectado)
// - Mobile: via Expo Push Service
// - Email: fallback si no hay push token
```

## Próximos Pasos

1. ✅ Web Notifications (completado)
2. 🔄 Expo Notifications (implementar)
3. 🔄 Backend notification API (Supabase Functions)
4. 🔄 Email notifications (fallback)
5. 🔄 SMS notifications (opcional, Twilio)

## References

- [Web Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
