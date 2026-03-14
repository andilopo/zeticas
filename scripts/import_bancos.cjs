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
    const workbook = xlsx.readFile('Bancos.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    // Row 1: [ 'Banco ', 'Nombre', 'No. Cuenta Ahorros', 'Quien paga ahí' ]
    // Following rows: [ 'BBVA', 'ZETICAS SAS BIC ', 184002865, 'WEB _ BOLD y distribuidores ' ]

    const banksToInsert = [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue;

        // Convert to supabase table format from banks
        // CREATE TABLE IF NOT EXISTS banks (
        // id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        // name VARCHAR(255) NOT NULL,
        // account_number VARCHAR(100),
        // type VARCHAR(50), 
        // balance DECIMAL(15, 2) DEFAULT 0.00,

        const bankName = row[0].trim();
        const typeStr = row[1] ? row[1].trim() : ''; // "Nombre"
        const accNumber = row[2] ? row[2].toString().trim() : '';
        // Let's use name to hold Bank + Type (or put Type to type column)

        // We can put 'Ahorros' for type as title says 'No. Cuenta Ahorros'
        // Let's assume balance is 0 initially or 1000000 just as seed. We will put 0.

        banksToInsert.push({
            name: `${bankName} - ${typeStr}`,
            account_number: accNumber,
            type: 'Ahorros',
            balance: 0 // Will initialize to 0
        });
    }

    // Clear existing or just insert
    // Get existing
    const { data: existingBanks } = await supabase.from('banks').select('name');
    const existingNames = new Set((existingBanks || []).map(b => b.name));

    const news = banksToInsert.filter(b => !existingNames.has(b.name));

    if (news.length > 0) {
        const { error } = await supabase.from('banks').insert(news);
        if (error) {
            console.error("Error inserting banks:", error.message);
        } else {
            console.log(`Successfully inserted ${news.length} banks.`);
        }
    } else {
        console.log('No new banks to insert.');
    }
}

run();
