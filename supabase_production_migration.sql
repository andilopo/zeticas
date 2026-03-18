-- ================================================================
-- MIGRACIÓN: Soporte ODP Tracking en Zeticas OS
-- Fecha: 2026-03-17
-- Descripción: Agrega columnas para rastrear inicio/fin de producción,
--              sincronización de MP/PT, e ID de ODP desde la interfaz.
-- Ejecutar en: Supabase > SQL Editor
-- ================================================================

-- 1. Agregar columnas de tracking a production_orders
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS odp_number TEXT;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS custom_qty INTEGER;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS waste_qty NUMERIC DEFAULT 0;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS mp_synced BOOLEAN DEFAULT FALSE;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS inventory_synced BOOLEAN DEFAULT FALSE;
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Pendiente';
ALTER TABLE production_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now());

-- 2. Índice para búsqueda rápida por SKU
CREATE INDEX IF NOT EXISTS idx_production_orders_sku ON production_orders(sku);

-- 3. Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_production_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_production_updated_at ON production_orders;
CREATE TRIGGER trigger_production_updated_at
BEFORE UPDATE ON production_orders
FOR EACH ROW
EXECUTE FUNCTION update_production_updated_at();

-- 4. Habilitar Row Level Security (RLS) con acceso público para la app
ALTER TABLE production_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all for authenticated users" ON production_orders;
CREATE POLICY "Allow all for authenticated users" ON production_orders
    FOR ALL USING (true) WITH CHECK (true);
