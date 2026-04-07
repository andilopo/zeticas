import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('production_orders')
    .select('*')
    .is('completed_at', null);

  if (error) {
    console.error("Error:", error.message);
    return;
  }

  console.log(`Found ${data.length} active production orders:`);
  data.forEach(row => {
    console.log(`ID: ${row.id}, SKU: ${row.sku}, Number: ${row.odp_number}, Status: ${row.status}, Created: ${row.created_at}`);
  });
}
run();
