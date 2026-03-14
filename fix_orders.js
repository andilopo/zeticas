import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://obsvdzlsbbqmhpsxksnd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ic3ZkemxzYmJxbWhwc3hrc25kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMTIzMTMsImV4cCI6MjA4NTg4ODMxM30.AWOz6pf-yiOm_-ZlCvhMDfyA2pp9QOOrpQEiIdl_2SI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    const { data, error } = await supabase
        .from('orders')
        .update({ status: 'Pendiente' })
        .in('status', ['Pagado']);
    console.log("Updated", data, error);
}

run();
