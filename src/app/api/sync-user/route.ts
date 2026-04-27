import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Obtener datos del usuario de forma robusta con el SDK de servidor
        const client = await clerkClient();
        const user = await client.users.getUser(userId);

        const email = user.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Check Student Discount Eligibility (any .edu.sv domain)
        const domain = email.split('@')[1]?.toLowerCase() || '';
        
        let studentStatusObj = {};
        
        if (domain.endsWith('.edu.sv')) {
            const now = new Date();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 365); // 365 days from now
            
            studentStatusObj = {
                student_status: 'active',
                student_domain: domain,
                student_verified_at: now.toISOString(),
                student_expires_at: expiresAt.toISOString()
            };
        }

        // Upsert user in Supabase public.profiles
        // Usamos upsert para crear si no existe, o no hacer nada si ya está (idempotente)
        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                ...studentStatusObj
                // No sobreescribimos 'role' si ya existe para no perder admins
            }, { onConflict: 'id', ignoreDuplicates: false }); 
            // ignoreDupiicates debe ser false para que actualice la fecha/estado si vuelve a loguearse

        if (error) {
            console.error('Supabase Sync Error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Sync API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
