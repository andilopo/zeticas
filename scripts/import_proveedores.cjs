const fs = require('fs');
const xlsx = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env
try {
    const env = fs.readFileSync('.env', 'utf8').split('\n');
    env.forEach(row => {
        const parts = row.split('=');
        if (parts.length >= 2) {
            const k = parts[0].trim();
            const v = parts.slice(1).join('=').trim();
            if (k && v) process.env[k] = v;
        }
    });
} catch (e) { }

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const workbook = xlsx.readFile('Proveedores.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Example Row 1 (header): [ 'Proveedor ', 'Productos ', 'Factura electronica' ]
    // Following rows: [ 'Discordoba SA', 'Frascos vidrio y tapas', 'si' ]

    const suppliersToInsert = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue;

        const name = row[0].trim();
        const productsStr = row[1] ? row[1].trim() : '';
        const factElec = row[2] ? row[2].trim().toLowerCase() : 'no';

        // Create random nit for demo
        const nit = Math.floor(100000000 + Math.random() * 900000000) + '-' + Math.floor(Math.random() * 10);
        // Categorize based on text
        let category = 'Materias Primas';
        let type = 'Jurídica'; // Assume B2B
        if (productsStr.toLowerCase().includes('vidrio') || productsStr.toLowerCase().includes('tapas') || productsStr.toLowerCase().includes('etiquetas') || productsStr.toLowerCase().includes('cajas')) {
            category = 'Insumos';
        } else if (productsStr.toLowerCase().includes('mantenimiento') || productsStr.toLowerCase().includes('mesones')) {
            category = 'Servicios';
        }

        suppliersToInsert.push({
            name: name,
            nit: nit,
            email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
            phone: '3000000000',
            contact_name: 'Representante',
            status: 'ACTIVE'
        });
    }

    // Clear existing mostly, or just insert
    // For safety let's just insert checking uniqueness isn't strict here since name doesn't have unique constraint, but we can do an upsert if we select first
    const { data: existingSuppliers } = await supabase.from('suppliers').select('name');
    const existingNames = new Set((existingSuppliers || []).map(s => s.name));

    const news = suppliersToInsert.filter(s => !existingNames.has(s.name));

    if (news.length > 0) {
        const { error } = await supabase.from('suppliers').insert(news);
        if (error) {
            console.error("Error inserting suppliers:", error.message);
        } else {
            console.log(`Successfully inserted ${news.length} suppliers.`);
        }
    } else {
        console.log('No new suppliers to insert.');
    }
}

run();
