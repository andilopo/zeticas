import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

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

async function check() {
    const { data: pts } = await supabase.from('products').select('*').eq('type', 'PT');
    console.log('PT count:', pts ? pts.length : 0);
    if (pts) {
        console.log('PTs:', pts.map(p => p.name).join(', '));
    }

    const { data: mps } = await supabase.from('products').select('*').eq('type', 'MP');
    console.log('MP count:', mps ? mps.length : 0);

    const { data: recipes } = await supabase.from('recipes').select('*');
    console.log('Recipe links count:', recipes ? recipes.length : 0);
}
check();
