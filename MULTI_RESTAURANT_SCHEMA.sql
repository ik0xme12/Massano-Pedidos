-- Schema para soporte multi-restaurante

-- Tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  address TEXT NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  is_open BOOLEAN DEFAULT true,
  delivery_time_min INTEGER DEFAULT 20, -- minutos
  delivery_time_max INTEGER DEFAULT 35,
  delivery_fee INTEGER DEFAULT 600, -- en centavos
  min_order INTEGER DEFAULT 0, -- monto mínimo
  rating DECIMAL(3,2) DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  slug VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actualizar tabla de productos para agregar restaurant_id
ALTER TABLE products
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_products_restaurant_id ON products(restaurant_id);

-- Actualizar tabla de órdenes para agregar restaurant_id
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);

-- Tabla de horarios del restaurante
CREATE TABLE IF NOT EXISTS restaurant_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER, -- 0=lunes, 6=domingo
  opening_time TIME,
  closing_time TIME,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de métodos de pago por restaurante
CREATE TABLE IF NOT EXISTS restaurant_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  payment_method VARCHAR(50), -- 'mercadopago', 'cash', 'transfer'
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(restaurant_id, payment_method)
);

-- RLS Policies para restaurants
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all restaurants"
  ON restaurants FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own restaurant"
  ON restaurants FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create restaurants"
  ON restaurants FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- RLS para products (usuarios ven solo productos de restaurantes públicos)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Restaurant owners can manage their products"
  ON products FOR ALL
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- RLS para órdenes (usuarios ven solo sus órdenes, restaurantes ven sus órdenes)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Restaurants can view their orders"
  ON orders FOR SELECT
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Restaurants can update their orders"
  ON orders FOR UPDATE
  USING (
    restaurant_id IN (
      SELECT id FROM restaurants WHERE owner_id = auth.uid()
    )
  );

-- Vista para estadísticas por restaurante
CREATE OR REPLACE VIEW restaurant_stats AS
SELECT
  r.id,
  r.name,
  r.owner_id,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT CASE WHEN o.status = 'delivered' THEN o.id END) as delivered_orders,
  SUM(o.total) as total_revenue,
  AVG(CAST(o.total AS DECIMAL)) as avg_order_value,
  COUNT(DISTINCT CASE WHEN o.status = 'pending' THEN o.id END) as pending_orders,
  AVG(rev.rating) as avg_rating
FROM restaurants r
LEFT JOIN orders o ON r.id = o.restaurant_id
LEFT JOIN reviews rev ON o.id = rev.order_id
GROUP BY r.id, r.name, r.owner_id;
