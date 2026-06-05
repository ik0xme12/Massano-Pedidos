# Sistema de Ratings y Reseñas

## Cómo Funciona

Después de que un cliente recibe su pedido, puede:
1. Dejar una puntuación (1-5 estrellas)
2. Escribir un comentario (opcional)
3. Ver reseñas de otros clientes

## Paso 1: Crear Tabla en Supabase

Ejecuta el SQL en `SUPABASE_MIGRATIONS.sql`:

```bash
# En Supabase Dashboard → SQL Editor
# Ejecuta: SUPABASE_MIGRATIONS.sql
```

Esto crea:
- Tabla `reviews` (con rating, comment, timestamps)
- Tabla `push_tokens` (para notificaciones)
- Vista `order_ratings` (promedios)
- RLS Policies (seguridad)

## Paso 2: Verificar Datos en BD

```sql
-- Consulta reseñas
SELECT * FROM reviews WHERE order_id = 'order-uuid';

-- Ver promedio de rating
SELECT * FROM order_ratings;
```

## Paso 3: Testing en Aplicación

### Desde Cliente

1. Coloca un pedido y complétalo hasta "Entregado"
2. Ve a `/pedido/[id]`
3. En sección "Reseñas", haz clic en estrellas (1-5)
4. Escribe comentario (opcional)
5. Haz clic "Enviar Reseña"

Deberías ver:
- Confirmación "✓ Gracias por tu reseña"
- Tu reseña aparece en la lista
- Promedio de rating se actualiza

### Desde Múltiples Clientes

1. Crea varios clientes (signup con emails diferentes)
2. Cada uno deja una reseña
3. Ve cómo cambia el promedio de estrellas

## Paso 4: Mostrar Ratings en Productos

Futura implementación: mostrar rating promedio en `/` (listado de productos)

```tsx
// Futuro: HomePage.tsx
const productRatings = await getProductRatings(productId)
// <ProductCard rating={productRatings.average} reviews={productRatings.count} />
```

## Arquitectura

### Componentes

**`RatingForm.tsx`** — Formulario para dejar reseña
- Selector de estrellas (1-5)
- Textarea para comentario
- Botón "Enviar Reseña"
- Estado de carga y éxito

**`ReviewsList.tsx`** — Mostrar reseñas
- Promedio de rating con estrellas
- Contador de reseñas
- Lista de reseñas individuales
- Fecha de cada reseña

### Hooks

**`useLeaveReview()`**
- `submitReview(orderId, userId, rating, comment)` → Promise<Review>
- `loading` — estado de envío
- `error` — errores de validación

**`useOrderReviews(orderId)`**
- Carga reseñas del pedido automáticamente
- Se suscribe a cambios (Realtime)
- `reviews`, `loading`, `error`, `refetch()`

## Flujo de Datos

```
Cliente entrega feedback
  ↓
RatingForm.handleSubmit()
  ↓
useLeaveReview.submitReview()
  ↓
supabase.from('reviews').insert(...)
  ↓
Supabase guarda en BD
  ↓
Trigger actualiza order_ratings vista
  ↓
ReviewsList se suscribe y re-renderiza
  ↓
Usuario ve su reseña aparecer
```

## RLS Security

**Tabla `reviews`**:

```sql
-- Todos pueden ver reseñas
CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  USING (true);

-- Solo autor puede crear
CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Solo autor puede editar/borrar
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);
```

Esto significa:
- ✅ Cualquiera puede ver reseñas
- ✅ Solo el autor puede crear una reseña suya
- ✅ El autor puede editar/borrar su propia reseña
- ❌ No puede crear reseña con otro user_id

## Mejoras Futuras

### 1. Moderar Reseñas
```sql
-- Agregar campo de estado
ALTER TABLE reviews ADD COLUMN status VARCHAR(50) DEFAULT 'pending';
-- approved, rejected, pending

-- Admin puede aprobar/rechazar
CREATE POLICY "Admins can moderate reviews"
  ON reviews FOR UPDATE
  USING (is_admin(auth.uid()));
```

### 2. Reseñas por Producto (no solo pedido)
```sql
-- Agregar referencia a producto
ALTER TABLE reviews ADD COLUMN product_id UUID REFERENCES products(id);

-- Ver reseñas de un producto
SELECT * FROM reviews WHERE product_id = 'product-uuid' AND status = 'approved';
```

### 3. Reacciones en Reseñas
```sql
-- ¿Te fue útil?
CREATE TABLE review_reactions (
  id UUID PRIMARY KEY,
  review_id UUID REFERENCES reviews(id),
  user_id UUID REFERENCES auth.users(id),
  reaction VARCHAR(50), -- 'helpful', 'unhelpful'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Gamificación
```sql
-- Usuario más activo en reseñas
SELECT user_id, COUNT(*) as review_count
FROM reviews
GROUP BY user_id
ORDER BY review_count DESC
LIMIT 10;

-- Dar badges: "Top Reviewer", etc
```

### 5. Email Notification
```
Cuando cliente deja reseña
  ↓
Enviar email a restaurante: "Nuevo comentario en tu pedido"
  ↓
Link directo a `/restaurante/reviews`
```

## Estadísticas para Restaurante

Futuro dashboard en `/restaurante/reviews`:

```
- Promedio de rating del mes
- Tendencia (subiendo/bajando)
- Reseñas positivas vs negativas
- Palabras clave frecuentes
- Clientes más críticos
```

## Testing Completo

```
1. Cliente A coloca pedido y lo completa
2. Cliente A deja 5 estrellas + "¡Excelente servicio!"
3. Cliente B coloca pedido y lo completa
4. Cliente B deja 4 estrellas + "Llegó un poco frío"
5. Cliente C deja 3 estrellas (sin comentario)

Resultado:
- Promedio: (5+4+3)/3 = 4.0 estrellas
- 3 reseñas
- Todas visibles en /pedido/[id]
```

## Próximos Pasos

1. ✅ Sistema de ratings (completado)
2. 🔄 Mostrar rating en productos
3. 🔄 Email notifications
4. 🔄 Moderación de reseñas
5. 🔄 Analytics dashboard
