# Configuración de Supabase Auth para Massano Pedidos

## Paso 1: Habilitar Email/Password Auth en Supabase

1. Ve al dashboard de tu proyecto Supabase
2. Ve a **Authentication → Providers**
3. Asegúrate que **Email** está habilitado (debería estarlo por defecto)
4. En **Email Provider**, verifica que está en "Email with password"

## Paso 2: Configurar Confirmación de Email (Opcional)

Si quieres que los usuarios confirmen su email:

1. Ve a **Authentication → Email Templates**
2. Personaliza el template de confirmación (opcional)
3. En **Authentication → Policies**, ve a **Email Confirmations**
4. Si quieres confirmar automáticamente (para MVP):
   - Desactiva "Require email confirmation" para desarrollo

Para producción:
- Activa confirmación de email
- Configura tu proveedor de email (SendGrid, Mailgun, etc.)

## Paso 3: Configurar Redirect URLs

El app usa `next/navigation` para redirigir automáticamente, pero Supabase necesita saber de dónde viene.

1. Ve a **Authentication → URL Configuration**
2. Agrega estas **Redirect URLs**:
   - `http://localhost:3001/**` (desarrollo)
   - `https://tudominio.com/**` (producción)
3. Agrega estos **Site URL**:
   - `http://localhost:3001` (desarrollo)
   - `https://tudominio.com` (producción)

## Paso 4: Crear Tabla de Usuarios Extendida (Opcional)

Para guardar más datos del usuario (dirección, teléfono), puedes crear un trigger que cree un perfil:

1. Ve a **SQL Editor** en el dashboard
2. Ejecuta este SQL:

```sql
-- Tabla de perfiles de usuarios
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Paso 5: Habilitar Realtime (para Paso 3)

1. Ve a **Realtime** en el sidebar
2. Habilita Realtime para las tablas que necesites:
   - `orders` → para que los clientes vean actualizaciones de estado
   - `products` → para cambios en inventario

## Paso 6: Configurar Permisos (RLS - Row Level Security)

**Para `user_profiles`:**

```sql
-- Ver tu propio perfil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Actualizar tu propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Para `orders`:**

```sql
-- Crear pedidos propios
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Ver pedidos propios
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
```

## Paso 7: Testing en Localhost

1. Reinicia el dev server: `npm run dev`
2. Visita `http://localhost:3001`
3. Haz clic en "Ingresar"
4. Completa el formulario de signup
5. Deberías estar logueado y poder:
   - Ver tu email en el header
   - Acceder al checkout
   - Guardar pedidos

## Variables de Entorno Necesarias

Ya están configuradas en `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Si estas credenciales no funcionan, verifica que sean las correctas en:
- Supabase Dashboard → Settings → API

## Troubleshooting

### "Error: Auth0 user mismatch" o similar
- Borra cookies: DevTools → Application → Cookies → Delete all
- Recarga la página

### "Error: Email already exists"
- El email ya está registrado
- Intenta con otro email o usa "Olvidé la contraseña"

### "Error: Invalid JWT"
- La sesión expiró
- Recarga la página o cierra sesión

### Login no persiste después de refresh
- Verifica que `AuthProvider` está en `layout.tsx`
- Verifica que `supabase.auth.onAuthStateChange` está correctamente configurado

## Próximo: Supabase Realtime

Una vez Auth funcione, haremos real-time updates de ordenes:
- Cliente ve estado en tiempo real
- Restaurante recibe notificaciones de pedidos nuevos
