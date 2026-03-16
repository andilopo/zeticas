-- ZETICAS OS - SUPABASE LEAN FLOW SCHEMA

-- Bancos
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(100),
    type VARCHAR(50), 
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Proveedores (Suppliers)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nit VARCHAR(50),
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    category VARCHAR(50), -- Added for JIT matching (Empaque, Materia Prima, etc.)
    lead_time_days INT DEFAULT 0, 
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Clientes (Clients)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    nit VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Regular', 
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Productos / SKU (Products & Raw Materials)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    category VARCHAR(50), 
    unit_measure VARCHAR(20) NOT NULL, 
    price DECIMAL(10, 2) DEFAULT 0.00, 
    cost DECIMAL(10, 2) DEFAULT 0.00, 
    stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    reorder_point INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Recetas / BOM (Bill of Materials)
CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finished_good_id UUID REFERENCES products(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity_required DECIMAL(10, 4) NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Pedidos (Ventas)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(100) UNIQUE NOT NULL, 
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    source VARCHAR(50), 
    status VARCHAR(50) DEFAULT 'PENDIENTE', 
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    expected_delivery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(15, 2) NOT NULL
);

-- Producción (Órdenes de Trabajo Kanban)
CREATE TABLE IF NOT EXISTS production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    linked_order_id UUID REFERENCES orders(id) ON DELETE SET NULL, 
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT, 
    quantity INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'TO_DO',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Compras (Explosión BOM)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number VARCHAR(100) UNIQUE NOT NULL, 
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    linked_production_id UUID REFERENCES production_orders(id) ON DELETE SET NULL, 
    associated_orders TEXT, -- Added to track Sales Order numbers (e.g. "WEB-251, DIS-555")
    status VARCHAR(50) DEFAULT 'BORRADOR', 
    total_cost DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    raw_material_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(15, 2) NOT NULL
);

-- Inventarios (Movimientos)
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id UUID, 
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Logística / Despachos
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    status VARCHAR(50) DEFAULT 'PROGRAMADO', 
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Cartera (Cuentas por Cobrar)
CREATE TABLE IF NOT EXISTS accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    amount_due DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) DEFAULT 0.00,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'PENDIENTE', 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- Gastos / PYG (Cuentas por Pagar operativas)
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(100) NOT NULL, 
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    bank_id UUID REFERENCES banks(id) ON DELETE SET NULL, 
    expense_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', now())
);

-- MOCK DATA BÁSICA DE FLUJO LEAN (Prueba)

-- 1. Bancos y Proveedores
INSERT INTO banks (id, name, type, balance) 
VALUES ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Bancolombia PyME', 'Ahorros', 15000000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO suppliers (id, name, nit, lead_time_days) 
VALUES ('51515151-5151-5151-5151-515151515151', 'Distribuidora Envases S.A.', '900.123.456-1', 4)
ON CONFLICT (id) DO NOTHING;

-- 2. Clientes
INSERT INTO clients (id, name, nit, type) 
VALUES ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Maria Camila Gomez', '52.345.678', 'Web')
ON CONFLICT (id) DO NOTHING;

-- 3. Productos (MP e Insumos)
INSERT INTO products (id, sku, name, type, unit_measure, cost, category) 
VALUES ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'MP-001', 'Berenjena Sabana', 'MP', 'kg', 2500.00, 'Verduras'),
       ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'EMP-001', 'Frasco Vidrio 250g', 'INSUMO', 'unidad', 800.00, 'Empaque'),
       ('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', 'EMP-002', 'Tapa Dorada', 'INSUMO', 'unidad', 300.00, 'Empaque'),
       ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 'INS-001', 'Aceite de Oliva Premium', 'INSUMO', 'lt', 32000.00, 'Aditivos'),
       ('d5d5d5d5-d5d5-d5d5-d5d5-d5d5d5d5d5d5', 'INS-002', 'Azúcar Blanca', 'INSUMO', 'kg', 3800.00, 'Aditivos'),
       ('d6d6d6d6-d6d6-d6d6-d6d6-d6d6d6d6d6d6', 'INS-003', 'Vinagre Blanco', 'INSUMO', 'lt', 4500.00, 'Aditivos')
ON CONFLICT (id) DO NOTHING;

-- 4. Producto Terminado (PT)
INSERT INTO products (id, sku, name, type, category, unit_measure, price) 
VALUES ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'PT-001', 'Berenjenas para untar', 'PT', 'Sal', 'unidad', 30000.00)
ON CONFLICT (id) DO NOTHING;

-- 5. BOM (Receta)
INSERT INTO recipes (finished_good_id, raw_material_id, quantity_required) 
VALUES ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'd1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 0.50), -- Berenjenas
       ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 1.00), -- Frasco
       ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'd3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', 1.00), -- Tapa
       ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'd4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', 0.10); -- Aceite

-- 6. El Pedido (El inicio del flujo Lean)
INSERT INTO orders (id, order_number, client_id, source, status, total_amount) 
VALUES ('01010101-0101-0101-0101-010101010101', 'WEB-251', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Pagina WEB', 'PENDIENTE', 60000.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
VALUES ('01010101-0101-0101-0101-010101010101', 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 2, 30000.00, 60000.00);

-- 7. Producción Just In Time
INSERT INTO production_orders (id, linked_order_id, product_id, quantity, status) 
VALUES ('f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', '01010101-0101-0101-0101-010101010101', 'e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 2, 'TO_DO')
ON CONFLICT (id) DO NOTHING;

-- 8. Explosion de Materiales
INSERT INTO purchases (id, po_number, supplier_id, linked_production_id, status, total_cost)
VALUES ('81818181-8181-8181-8181-818181818181', 'PO-001', '51515151-5151-5151-5151-515151515151', 'f1f1f1f1-f1f1-f1f1-f1f1-f1f1f1f1f1f1', 'ENVIADA', 1600.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO purchase_items (purchase_id, raw_material_id, quantity, unit_cost, total_cost)
VALUES ('81818181-8181-8181-8181-818181818181', 'd2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 2, 800.00, 1600.00);

-- 9. Post-venta o Modulo de Cartera
INSERT INTO accounts_receivable (order_id, client_id, amount_due, status)
VALUES ('01010101-0101-0101-0101-010101010101', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 60000.00, 'PENDIENTE');

-- 10. Despacho Logístico
INSERT INTO shipments (order_id, tracking_number, carrier)
VALUES ('01010101-0101-0101-0101-010101010101', 'SERV-899120', 'Servientrega');

-- ==========================================
-- MÓDULO CRM Y COMERCIAL (LEADS / PROSPECTOS)
-- ==========================================

-- Tabla de Representantes Comerciales (Opcional, puede ligarse a auth.users)
CREATE TABLE IF NOT EXISTS sales_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Prospectos (Leads)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(150),
    interest_type VARCHAR(50) CHECK (interest_type IN ('Personal', 'Corporativo', 'Mayorista')),
    estimated_volume INT DEFAULT 1,
    urgency_date DATE,
    stage VARCHAR(50) DEFAULT 'Nuevo Lead' CHECK (stage IN ('Nuevo Lead', 'Cotización Enviada', 'Clientes Ingresados', 'Negociación/Seguimiento', 'Venta Cerrada', 'Perdido')),
    assigned_to UUID REFERENCES sales_agents(id),
    value_projection DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tareas de Seguimiento Comercial
CREATE TABLE IF NOT EXISTS lead_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES sales_agents(id),
    task_type VARCHAR(50) DEFAULT 'Llamada' CHECK (task_type IN ('Llamada', 'Mensaje', 'Email', 'Reunión')),
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for CRM
CREATE OR REPLACE FUNCTION update_lead_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead ON leads;
CREATE TRIGGER trigger_update_lead
BEFORE UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION update_lead_updated_at();

-- Mock Data CRM
INSERT INTO sales_agents (id, name, email) VALUES ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 'Comercial 1', 'comercial1@zeticas.com') ON CONFLICT (id) DO NOTHING;
INSERT INTO leads (id, name, city, phone, interest_type, estimated_volume, assigned_to, value_projection) 
VALUES ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', 'Empresa Ejemplo S.A', 'Bogotá', '3101234567', 'Corporativo', 50, 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', 1500000.00)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- ACTUALIZACIÓN Y MIGRACIÓN DE ETAPAS CRM
-- ==========================================

-- 1. Quitar la vieja restricción (para que Supabase no dé error al modificar etapas)
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_stage_check;

-- 2. Actualizar las tarjetas antiguas en la Base de Datos a sus nuevos nombres
UPDATE leads SET stage = 'Clientes Ingresados' WHERE stage = 'Cotización Enviada';
UPDATE leads SET stage = 'Cotización Enviada' WHERE stage = 'Contacto Inicial';

-- 3. Aplicar la nueva regla estricta sobre las etapas
ALTER TABLE leads ADD CONSTRAINT leads_stage_check CHECK (stage IN ('Nuevo Lead', 'Cotización Enviada', 'Clientes Ingresados', 'Negociación/Seguimiento', 'Venta Cerrada', 'Perdido'));

-- 4. Agregar columnas faltantes para Tareas / Seguimiento
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_note TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS completed_tasks_count INT DEFAULT 0;
