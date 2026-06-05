# Expo Notifications Setup

## Qué es Expo Notifications

Sistema para recibir notificaciones push en aplicaciones Expo (mobile). Integrado con Expo Push Service (EAS).

## Paso 1: Instalar Dependencias

```bash
cd apps/mobile
npx expo install expo-notifications expo-device expo-constants
```

## Paso 2: Configurar app.json

Agrega esto a tu `app.json`:

```json
{
  "expo": {
    "plugins": [
      "expo-notifications"
    ],
    "notification": {
      "icon": "./assets/icon.png",
      "color": "#C4A35A",
      "sounds": ["assets/notification-sound.wav"]
    },
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

## Paso 3: Configurar EAS (Expo Application Services)

```bash
npx eas build:configure
```

Sigue las instrucciones para:
- Crear cuenta EAS
- Link tu proyecto
- Configurar builds

## Paso 4: Agregar Hook a tu App

En `apps/mobile/App.tsx`:

```tsx
import { useExpoNotifications } from './src/hooks/useExpoNotifications'

export default function App() {
  const { expoPushToken } = useExpoNotifications()

  return (
    // Tu app
  )
}
```

## Paso 5: Guardar Push Tokens en Supabase

El hook automáticamente:
1. Solicita permiso al usuario
2. Obtiene el token de push
3. Lo guarda en tu dispositivo

Para guardar en Supabase:

```ts
// En useExpoNotifications.ts (descomentar la línea)
await pushTokenService.savePushToken(userId, token, 'mobile')
```

## Paso 6: Enviar Notificaciones

Opción A: Desde tu Backend

```bash
# POST a Expo Push Service
curl -X POST https://exp.host/--/api/v2/push/send \
  -H 'Content-Type: application/json' \
  -d '{
    "to": "'$PUSH_TOKEN'",
    "sound": "default",
    "title": "Tu pedido está listo",
    "body": "Haz clic para ver detalles",
    "data": {
      "orderId": "order-123"
    }
  }'
```

Opción B: Desde Supabase Functions

```sql
-- Supabase Function para enviar notificación
CREATE OR REPLACE FUNCTION send_push_notification(
  order_id UUID,
  title TEXT,
  body TEXT
) RETURNS void AS $$
BEGIN
  -- Obtener token de push del usuario
  -- Enviar a Expo Push Service
  -- Registrar en audit log
END;
$$ LANGUAGE plpgsql;

-- Trigger cuando cambia estado de orden
CREATE TRIGGER on_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION send_push_notification(
  NEW.id,
  'Tu pedido fue ' || NEW.status,
  'Haz clic para ver detalles'
);
```

## Paso 7: Testing

### En Simulador

```bash
# En app.tsx
import { Notifications } from 'expo-notifications'

const testNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test Notification',
      body: 'Este es un test',
    },
    trigger: { seconds: 2 },
  })
}
```

### En Dispositivo Real

1. Instala la app con `eas build`
2. Abre la app
3. Autoriza notificaciones
4. Ve a Expo Dashboard → Notifications
5. Envía notificación de prueba

## Manejo de Notificaciones

### Cuando llega notificación (app en foreground)

```ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})
```

### Cuando usuario hace clic

```ts
Notifications.addNotificationResponseReceivedListener((response) => {
  const data = response.notification.request.content.data
  // Deep link a /pedido/[id]
  navigation.navigate('OrderDetail', { orderId: data.orderId })
})
```

## Troubleshooting

### "Permission denied"

- Verifica que el usuario autorizó notificaciones en settings del dispositivo
- En iOS, Settings → App → Notifications → Allow

### "Invalid token"

- Token expirado después de 30 días sin usar
- Solicita nuevo token cada vez que la app abre

### "Notification no se envía"

1. Verifica que el token es válido (no vacío)
2. Verifica que Expo Push Service está disponible
3. Revisa logs en Expo Dashboard

## Próximos Pasos

1. ✅ Hook useExpoNotifications (completado)
2. 🔄 Supabase Function para enviar notificaciones
3. 🔄 Deep linking en mobile app
4. 🔄 Historial de notificaciones
5. 🔄 Preferencias de notificaciones por usuario
