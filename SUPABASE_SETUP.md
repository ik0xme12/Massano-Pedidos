# Configuración de Supabase para Massano Pedidos

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta (gratis)
2. Crea un nuevo proyecto:
   - Nombre: `massano-pedidos`
   - Contraseña de BD: elige una segura
   - Región: `sa-east-1` (Argentina)
3. Espera a que se cree (toma 2-3 minutos)

## Paso 2: Obtener Credenciales

En el dashboard del proyecto, ve a **Settings → API**:
- Copia **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copia **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Paso 3: Crear Tablas

1. Ve a **SQL Editor** en el dashboard
2. Crea una nueva query copiando el contenido de `SUPABASE_SCHEMA.sql`
3. Ejecuta el query (Ctrl+Enter)
4. Verifica que las tablas se crearon en **Table Editor**

## Paso 4: Agregar Variables de Entorno

Actualiza `/apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 5: Agregar Datos de Prueba (Opcional)

En **SQL Editor**, ejecuta:

```sql
INSERT INTO products (name, description, price, image_url, category, badge) VALUES
  ('Tostado de jamón y brie', 'Pan tostado con jamón serrano y queso brie derretido', 3200, 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop', 'Desayunos', 'Más pedido'),
  ('Croissant de manteca', 'Croissant casero de manteca', 1800, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop', 'Desayunos', NULL),
  ('Café con leche especial', 'Café espresso con leche vaporizada', 1400, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', 'Cafetería', 'Clásico'),
  ('Ensalada Massano', 'Lechuga, rúcula, tomate, cebolla morada con vinagreta casera', 2900, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop', 'Almuerzos', NULL),
  ('Torta de chocolate belga', 'Torta de chocolate belga con ganache', 2400, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop', 'Postres', 'Nuevo');
```

## Paso 6: Permisos de BD (Importante!)

Ve a **Authentication → Policies** y habilita acceso público (solo lectura en products, lectura/escritura en orders):

Para **products** (solo lectura):
```sql
CREATE POLICY "Enable read access for all users" ON "public"."products"
  AS PERMISSIVE FOR SELECT USING (true);
```

Para **orders** (crear pedidos sin autenticación):
```sql
CREATE POLICY "Enable insert for all users" ON "public"."orders"
  AS PERMISSIVE FOR INSERT WITH CHECK (true);
```

Para **order_items** (crear items sin autenticación):
```sql
CREATE POLICY "Enable insert for all users" ON "public"."order_items"
  AS PERMISSIVE FOR INSERT WITH CHECK (true);
```

## Paso 7: Reinicia el Servidor

```bash
cd /Users/israelsanchezu/Massano-Pedidos/apps/web
npm run dev
```

Visita `http://localhost:3001` y deberías ver los productos cargados de la BD.

---

## Troubleshooting

### "Error: No rows returned"
- Verifica que la tabla `products` tenga datos
- Ejecuta: `SELECT * FROM products;` en SQL Editor

### "Error: CORS"
- Ve a **Settings → API** → **CORS**
- Agrega `http://localhost:3001` a la lista

### "Error: Anon key not valid"
- Verifica que copiaste bien la `ANON_KEY` (sin espacios)
- Reinicia el servidor después de cambiar `.env.local`

---

## Próximos Pasos

1. ✅ Integración con Supabase (productos, pedidos)
2. 🔄 Autenticación con Supabase Auth
3. ⏳ Seguimiento en tiempo real con Supabase Realtime
4. ⏳ Panel del restaurante
5. ⏳ Push notifications
