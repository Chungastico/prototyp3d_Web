import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
    // We can't query information_schema from client easily, but we can query one row of extras_aplicados
    const { data, error } = await supabase.from('extras_aplicados').select('*').limit(1);
    console.log(data);
}

test();
