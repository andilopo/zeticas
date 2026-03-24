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

async function initContent() {
  console.log('Initializing site content...');

  const initialData = [
    // Hero
    { section: 'hero', key: 'top_text', content: 'Sabana de Bogotá • Colombia' },
    { section: 'hero', key: 'title', content: 'Zeticas' },
    { section: 'hero', key: 'description', content: 'Conservas premium y consultoría con propósito. Redescubriendo el valor de nuestra tierra y sus productores.' },
    { section: 'hero', key: 'cta_text', content: 'Explorar Colección' },
    
    // Home Sections
    { section: 'philosophy', key: 'title', content: 'Filosofía & Enfoque' },
    { section: 'philosophy', key: 'subtitle', content: '{ SER para HACER }' },
    { section: 'support', key: 'title', content: 'Apoyo & soporte' },
    { section: 'support', key: 'subtitle', content: 'Sinergias de vida' },
    { section: 'support', key: 'description', content: 'Sistema megadiverso que aumentan la eficiencia en el ecosistema' },
    { section: 'knowledge', key: 'title', content: 'Conocimiento – Maestría' },
    { section: 'impact', key: 'title', content: 'Impacto' },
    { section: 'impact', key: 'subtitle', content: 'Trabajo comunitario en todas las regiones de Colombia' }
  ];

  for (const item of initialData) {
    const { error } = await supabase
      .from('site_content')
      .upsert(item, { onConflict: 'section,key' });
    
    if (error) {
        if (error.code === '42P01') {
            console.error('Table "site_content" does not exist. Please create it first in Supabase SQL Editor.');
            break;
        }
        console.error(`Error upserting ${item.section}.${item.key}:`, error.message);
    } else {
        console.log(`Updated: ${item.section}.${item.key}`);
    }
  }

  console.log('Done.');
}

initContent();
