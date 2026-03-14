const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually load .env variables
const envPath = path.resolve(__dirname, '../.env');
const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const localItems = [
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f60', name: 'Frasco 240g Vidrio', type: 'material', initial_stock: 1000, purchases: 350, sales: 150, safety_stock: 400, unit: 'und', inventory_group: 'Empaque', avg_cost: 1200 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f61', name: 'Tapa Dorada', type: 'material', initial_stock: 1200, purchases: 400, sales: 100, safety_stock: 400, unit: 'und', inventory_group: 'Empaque', avg_cost: 450 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f62', name: 'Berenjenas (Materia Prima)', type: 'material', initial_stock: 80, purchases: 20, sales: 55, safety_stock: 45, unit: 'kg', inventory_group: 'Vegetales', avg_cost: 3500 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f63', name: 'Aceite de Oliva Premium', type: 'material', initial_stock: 12, purchases: 5, sales: 10, safety_stock: 15, unit: 'lt', inventory_group: 'Aceites', avg_cost: 32000 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f64', name: 'Berenjena Toscana', type: 'product', initial_stock: 25, purchases: 0, sales: 13, safety_stock: 20, unit: 'und', inventory_group: 'Sal', avg_cost: 0, units_per_box: 12, barcode: 'ZT003001.gif', price: 30000 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f65', name: 'Dulce Silvia', type: 'product', initial_stock: 15, purchases: 0, sales: 7, safety_stock: 15, unit: 'und', inventory_group: 'Dulce', avg_cost: 0, units_per_box: 6, barcode: 'ZT001502.gif', price: 28000 },
    { id: '8d7f7e9a-1b2c-4d5e-8f0a-1b5c3d4e5f66', name: 'Ruibarbo & Fresa', type: 'product', initial_stock: 60, purchases: 0, sales: 15, safety_stock: 30, unit: 'und', inventory_group: 'Dulce', avg_cost: 0, units_per_box: 6, barcode: 'ZT002006.gif', price: 32000 }
];

async function migrate() {
    console.log("Starting migration to Supabase...");

    // 1. Migrate Inventory
    const { error: invError } = await supabase.from('inventory').upsert(localItems);
    if (invError) {
        console.error("Error migrating inventory:", invError.message);
        console.log("Tip: Make sure you ran the schema.sql in Supabase first.");
    } else {
        console.log("Inventory migrated successfully!");
    }

    console.log("Migration finished.");
}

migrate();
