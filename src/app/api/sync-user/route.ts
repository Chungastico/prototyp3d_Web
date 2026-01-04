import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { currentUser } from '@clerk/nextjs/server';

export async function POST() {
    try {
        const user = await currentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const email = user.emailAddresses[0]?.emailAddress;

        if (!email) {
            return NextResponse.json({ error: 'No email found' }, { status: 400 });
        }

        // Upsert user in Supabase public.profiles
        // Usamos upsert para crear si no existe, o no hacer nada si ya está (idempotente)
        const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: user.id,
                email: email,
                // No sobreescribimos 'role' si ya existe para no perder admins
            }, { onConflict: 'id', ignoreDuplicates: true });

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
