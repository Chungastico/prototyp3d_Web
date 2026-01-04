import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("❌ Missing Supabase Admin Keys: Check SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

// ⚠️ Este cliente tiene permisos de superusuario. Usar SOLO en el servidor (API Routes).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
