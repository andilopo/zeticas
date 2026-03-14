-- Script para configurar las tablas del sistema de compras e inventario en Supabase

-- 1. Tabla de Ordenes de Compra
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    provider_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    order_date DATE NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Enviada',
    related_orders TEXT[]
);

-- 2. Tabla de Detalle de Ordenes de Compra
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    purchase_order_id TEXT REFERENCES purchase_orders(id) ON DELETE CASCADE,
    material_id INT NOT NULL,
    material_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_price NUMERIC NOT NULL
);

-- (Las tablas 'orders' e 'inventory' asumo que ya se encontraban creadas)
