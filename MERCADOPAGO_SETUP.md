# MercadoPago Integration Setup

## Paso 1: Crear Cuenta en MercadoPago

1. Ve a [mercadopago.com.ar](https://www.mercadopago.com.ar)
2. Crea una cuenta de negocio
3. Verifica tu identidad
4. Ve a **Settings → Credentials** (o similar)

## Paso 2: Obtener Claves

En MercadoPago Dashboard, ve a **Credentials**:
- **Public Key** (Clave Pública) → `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY`
- **Access Token** (Token de Acceso) → `MERCADOPAGO_ACCESS_TOKEN`

Habrá dos sets: TESTING y PRODUCTION. Usa TESTING para desarrollo.

## Paso 3: Agregar Variables de Entorno

En `apps/web/.env.local`:

```env
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## Paso 4: Reiniciar Servidor

```bash
cd apps/web
npm run dev
```

## Paso 5: Testing en Local

### Realizar Pago de Prueba:

1. Ve a `/checkout` en tu app
2. Llena dirección
3. Selecciona "MercadoPago"
4. Click "Confirmar"
5. Se abre modal de MercadoPago

### Credenciales de Test:

**Pago Aprobado**:
- Email: `test_user_123456@testuser.com`
- Card: `4111 1111 1111 1111`
- Expiry: `11/25`
- CVV: `123`

**Pago Rechazado**:
- Card: `4000 0000 0000 0002`

## Paso 6: Webhooks (Opcional en Dev)

MercadoPago puede enviar notificaciones cuando:
- El pago fue aprobado
- El pago fue rechazado
- El pago está pendiente

El endpoint está en: `/api/mercadopago/webhook`

En producción:
1. Ve a Settings → Webhooks
2. Agrega URL: `https://tudominio.com/api/mercadopago/webhook`
3. Selecciona eventos: `payment.created`, `payment.updated`

## Cómo Funciona la Integración

```
Cliente en /checkout
  ↓
Selecciona "MercadoPago"
  ↓
Click "Confirmar"
  ↓
useMercadoPago.createAndOpenCheckout()
  ↓
POST /api/mercadopago/create-preference
  ↓
MercadoPago API crea preferencia
  ↓
Wallet.render() abre modal de pago
  ↓
Cliente paga (o cancela)
  ↓
Redirige a:
  - /pedido-confirmado (si éxito)
  - /checkout (si error)
  ↓
Webhook notifica a backend
  ↓
Orden se marca como pagada
```

## Métodos de Pago Disponibles

En el checkout de MercadoPago aparecen:
- Tarjeta de crédito/débito
- Transferencia bancaria
- Billetera MercadoPago
- Efectivo (Rapipago, Pago Fácil)
- QR (si está habilitado)

## Estados de Pago

Los órdenes pueden estar en:
- `pending` — En espera (si no es MercadoPago)
- `confirmed` — Pagado y listo para preparar
- `preparing` — Restaurante está preparando
- `ready` — Listo para buscar
- `on_the_way` — En camino
- `delivered` — Entregado

## Transiciones de Estado

**Con MercadoPago**:
```
pending (order created)
  ↓
(paga en MP)
  ↓
confirmed (webhook notifica)
  ↓
preparing (restaurante)
  ↓
ready
  ↓
on_the_way
  ↓
delivered
```

**Con Efectivo/Transferencia**:
```
pending (order created)
  ↓
confirmed (manual del restaurante)
  ↓
... (igual que arriba)
```

## Troubleshooting

### "Invalid public key"
- Verifica que `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` está correcta
- No debe tener espacios ni caracteres extra
- Recarga el servidor después de cambiar .env

### "Preference not created"
- Verifica que `MERCADOPAGO_ACCESS_TOKEN` está correcto
- En backend logs, chequea la respuesta de MercadoPago API

### "Modal no se abre"
- Asegúrate que MercadoPago SDK está inicializado
- Chequea console por errores
- Verifica que el navegador permite popups

### "Webhook no llega"
- En dev local, los webhooks no funcionan (localhost no es público)
- En producción, configura en Settings → Webhooks
- Usa herramientas como Ngrok para testear webhooks en dev

## Montos Mínimos

MercadoPago tiene montos mínimos según el país. En Argentina:
- Mínimo: $1 ARS
- Sin máximo

## Comisiones

MercadoPago cobra comisión por transacción. Por defecto:
- Tarjeta: ~3.49%
- Transferencia: ~2.99%
- Efectivo: variable

Se descuenta automáticamente de tu cuenta.

## Producción

Cuando paso a PRODUCTION:
1. Cambia Public Key y Access Token a las claves de producción
2. Verifica moneda (debe ser ARS para Argentina)
3. Configura webhooks en tu dominio
4. Prueba pagos reales (con tarjeta de test primero)
5. Habilita notificaciones por email a clientes

## Seguridad

✅ Nunca exponer `MERCADOPAGO_ACCESS_TOKEN` en frontend
✅ Las claves públicas pueden estar en frontend (es seguro)
✅ Las transacciones se procesan de forma segura en MercadoPago
✅ Los datos de tarjeta NUNCA tocan tu servidor

## Próximas Mejoras

1. 📊 Dashboard con histórico de pagos
2. 💰 Reporte de ganancias
3. 🔄 Devoluciones de dinero
4. 📧 Confirmación por email
5. 📱 QR para pago rápido
