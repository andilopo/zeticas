import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Extract keys from .env
const envSrc = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envSrc.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKeyMatch = envSrc.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
// If it has a comment, just get the part before the comment or use simple split.
const supabaseKey = supabaseAnonKeyMatch ? supabaseAnonKeyMatch[1].split(' ')[0].trim() : '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing insert...");
    const { data, error } = await supabase.from('leads').insert([{
        name: 'Test Name',
        city: 'Bogota',
        interest_type: 'Personal',
        estimated_volume: 1,
        urgency_date: null,
        email: 'test@test.com',
        phone: '123'
    }]);

    console.log("Error:", error);
    console.log("Data:", data);
}
test();
