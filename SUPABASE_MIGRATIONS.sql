-- Migraciones adicionales para Massano Pedidos

-- Tabla de push tokens (para notificaciones)
CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  platform VARCHAR(50), -- 'web', 'mobile'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform)
);

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_push_tokens_user_id ON push_tokens(user_id);

-- Actualizar tabla reviews con más campos
ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Índices para búsquedas de reviews
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- RLS Policy para push_tokens
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own push tokens"
  ON push_tokens FOR ALL
  USING (auth.uid() = user_id);

-- RLS Policy para reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Vista para promedios de rating por orden
CREATE OR REPLACE VIEW order_ratings AS
SELECT
  order_id,
  COUNT(*) as review_count,
  AVG(CAST(rating AS DECIMAL)) as average_rating,
  MAX(created_at) as last_review_date
FROM reviews
WHERE deleted_at IS NULL
GROUP BY order_id;
