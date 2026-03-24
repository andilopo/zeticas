import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Key are required in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkContent() {
  console.log('Checking site content...');
  const { data, error } = await supabase.from('site_content').select('*').limit(5);
  
  if (error) {
    console.error('Error fetching site_content:', error.message);
  } else {
    console.log('Successfully found', data.length, 'entries in site_content.');
    data.forEach(d => console.log(`${d.section}.${d.key}: ${d.content.substring(0, 30)}...`));
  }
}

checkContent();
