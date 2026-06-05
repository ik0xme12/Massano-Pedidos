# Configuración de Supabase Realtime para Massano Pedidos

## Qué es Realtime

Supabase Realtime permite que los cambios en la base de datos se reflejen automáticamente en el frontend en tiempo real, sin necesidad de recargar la página.

## Paso 1: Habilitar Realtime en Supabase

1. Ve al dashboard de tu proyecto Supabase
2. Ve a **Realtime** en el sidebar izquierdo
3. Habilita Realtime para estas tablas:
   - ✅ `orders` — (cliente ve cambios de estado)
   - ✅ `products` — (cambios de disponibilidad)
   - ❌ `users` — (no necesario aún)

## Paso 2: Entender las Nuevas Páginas

### Para Clientes:

**`/mis-pedidos`** — Historial de órdenes con actualizaciones en vivo
- Carga lista de órdenes del usuario
- Se suscribe a cambios: si el estado cambia (pending → preparing), se actualiza automáticamente
- Clic en pedido → ve `/pedido/[id]`

**`/pedido/[id]`** — Detalle de un pedido con estado en tiempo real
- Muestra timeline visual (Confirmado → Preparando → Listo → En Camino → Entregado)
- Se suscribe a cambios específicos del pedido
- Se actualiza automáticamente cuando el restaurante cambia el estado
- Funciona incluso si cierra y abre el navegador (por sesión persistente)

### Para Restaurante:

**`/restaurante`** — Dashboard para recibir y actualizar órdenes
- Sección "Órdenes Nuevas" (órdenes con status='pending')
- Sección "En Proceso" (órdenes en otros estados)
- Botones para avanzar el estado:
  - Nuevo → Confirmar
  - Confirmado → Preparando
  - Preparando → Listo
  - Listo → En Camino
  - En Camino → Entregado
- **Recibe cambios en tiempo real**: cuando un cliente ve su estado actualizado, el restaurante también lo ve cambiar en su lista

## Paso 3: Cómo Funciona el Sistema

### Cliente coloca un pedido:
1. Click "Confirmar" en checkout
2. Se guarda en tabla `orders` con status='pending'
3. Se redirige a `/pedido-confirmado?id=UUID`
4. Cliente puede ir a `/mis-pedidos` → ves su pedido

### Cliente ve estado actualizado:
1. Cliente en `/pedido/[id]` está suscrito a cambios de esa orden
2. Restaurante en `/restaurante` marca orden como "Preparando"
3. Supabase Realtime notifica al cliente
4. Hook `useOrderSubscription()` recibe cambio
5. Estado se actualiza visualmente sin recargar

### Ciclo completo:
- Nuevo pedido llega al restaurante
- Restaurante hace click "Confirmar" → estado: confirmed
- Cliente ve "Confirmado" en su timeline
- Restaurante hace click "Preparando" → estado: preparing
- Cliente ve "Preparando" en su timeline
- ... y así hasta "Entregado"

## Paso 4: RLS Policies (Importante!)

Para que Realtime funcione correctamente con autenticación:

### Para `orders` — Clientes ven solo sus órdenes:

```sql
-- SELECT: Ver solo tus propias órdenes
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- UPDATE: Solo restaurante puede cambiar status (implementar después con role check)
-- Por ahora, permitir para testing
CREATE POLICY "Anyone can update order status"
  ON orders FOR UPDATE
  USING (true);
```

### Para `products` — Todos pueden ver:

```sql
CREATE POLICY "Public read access"
  ON products FOR SELECT
  USING (true);
```

## Paso 5: Testing Realtime en Local

### Simulación manual:

1. Abre dos navegadores (o pestañas en incógnito):
   - **Pestaña 1 (Cliente)**: Inicia sesión, coloca pedido, ve `/pedido/[id]`
   - **Pestaña 2 (Restaurante)**: Accede a `/restaurante`

2. En Pestaña 2, hace click en "Confirmar" en una orden

3. En Pestaña 1, debería ver cambio de "Nuevo" a "Confirmado" **sin recargar**

4. Repite con otros estados (Preparando, Listo, etc.)

### Debug:

Si no ves cambios:
1. Abre DevTools → Console (ver si hay errores)
2. Verifica que Realtime está habilitado en Supabase Dashboard
3. Verifica que la tabla `orders` está seleccionada en Realtime
4. Verifica que RLS policies están creadas

## Paso 6: Estructura de Hooks

**`useOrderSubscription(orderId)`** — Para `/pedido/[id]`
- Carga orden actual
- Se suscribe a cambios en esa orden específica
- Retorna: `{ order, loading, error }`

**`useUserOrdersSubscription(userId)`** — Para `/mis-pedidos`
- Carga lista de órdenes del usuario
- Se suscribe a INSERT, UPDATE en órdenes del usuario
- Retorna: `{ orders, loading, error }`

**`useAllOrdersSubscription()`** — Para `/restaurante`
- Carga todas las órdenes
- Se suscribe a cambios en cualquier orden
- Retorna: `{ orders, loading, error }`

## Arquitectura de Canales

Supabase Realtime usa "canales" para suscripciones:
- `order:UUID` → cambios en un orden específico
- `user:UUID:orders` → cambios en órdenes de un usuario
- `all:orders` → cambios en cualquier orden

## Troubleshooting

### "WebSocket connection failed"
- Verifica que Realtime está habilitado en Supabase
- Revisa que la región de Supabase está correcta

### "Received 'message' but not subscribed"
- Las suscripciones se crean en `useEffect`
- Si componente desmonta, se desuscribe automáticamente

### "Updates not appearing in real-time"
- Verifica que RLS policies permitenVER y UPDATE
- Comprueba que el evento fue guardado en la BD (usa SQL Editor)

### Rendimiento lento con muchas órdenes
- En `/restaurante`, considera filtrar por status activos solamente
- En `/mis-pedidos`, limita a últimas 50 órdenes

## Próximos Pasos

Una vez Realtime funcione:
1. ✅ Cliente ve estado de pedido en tiempo real
2. ✅ Restaurante recibe órdenes en tiempo real
3. 🔄 Push Notifications (para alertas cuando llega orden nueva)
4. 🔄 Ratings/Reviews después de entrega
