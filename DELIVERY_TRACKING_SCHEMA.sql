-- Schema para seguimiento en vivo del delivery

-- Tabla de deliveries (repartidores)
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  vehicle_type VARCHAR(50), -- 'bike', 'motorcycle', 'car'
  is_available BOOLEAN DEFAULT true,
  current_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating DECIMAL(3,2) DEFAULT 4.5,
  rating_count INTEGER DEFAULT 0,
  completed_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tracking de ubicación
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  accuracy_meters INTEGER,
  speed_kmh DECIMAL(5, 2),
  heading_degrees INTEGER,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_delivery_id ON delivery_tracking(delivery_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_timestamp ON delivery_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deliveries_current_order ON deliveries(current_order_id);

-- Actualizar órdenes para agregar delivery_id y ETA
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_orders_delivery_id ON orders(delivery_id);

-- Vista para ubicación actual del delivery
CREATE OR REPLACE VIEW current_delivery_location AS
SELECT
  dt.order_id,
  dt.delivery_id,
  dt.latitude,
  dt.longitude,
  dt.accuracy_meters,
  dt.speed_kmh,
  dt.heading_degrees,
  dt.timestamp,
  d.name as delivery_person_name,
  d.phone as delivery_person_phone,
  d.vehicle_type
FROM delivery_tracking dt
JOIN deliveries d ON dt.delivery_id = d.id
WHERE dt.timestamp = (
  SELECT MAX(timestamp)
  FROM delivery_tracking
  WHERE delivery_id = dt.delivery_id
)
ORDER BY dt.timestamp DESC;

-- RLS Policies
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deliveries can view their own data"
  ON deliveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Orders visible to delivery person"
  ON orders FOR SELECT
  USING (
    delivery_id IN (
      SELECT id FROM deliveries WHERE user_id = auth.uid()
    )
  );

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for their orders"
  ON delivery_tracking FOR SELECT
  USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Delivery can update their location"
  ON delivery_tracking FOR INSERT
  WITH CHECK (
    delivery_id IN (
      SELECT id FROM deliveries WHERE user_id = auth.uid()
    )
  );
