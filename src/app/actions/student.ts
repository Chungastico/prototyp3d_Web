'use server';

import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function syncStudentClient() {
    try {
        const user = await currentUser();

        if (!user) {
            return { error: 'No autorizado', clientId: null };
        }

        const email = user.emailAddresses[0]?.emailAddress;
        
        // We'll use the user's name from Clerk, or default to their email name part
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || email?.split('@')[0] || 'Estudiante Sin Nombre';

        if (!email) {
            return { error: 'No se encontró correo', clientId: null };
        }

        // Check if client already exists with this email
        const { data: existingClients, error: searchError } = await supabaseAdmin
            .from('clientes')
            .select('id')
            .eq('email', email)
            .limit(1);

        if (searchError) {
            console.error('Error searching for client:', searchError);
            return { error: 'Error al buscar cliente', clientId: null };
        }

        if (existingClients && existingClients.length > 0) {
            return { success: true, clientId: existingClients[0].id };
        }

        // If not, create a new client
        const { data: newClient, error: createError } = await supabaseAdmin
            .from('clientes')
            .insert([{
                nombre_cliente: fullName,
                email: email,
                observaciones: 'Estudiante (Auto-registrado desde el Dashboard)'
            }])
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating new client:', createError);
            return { error: 'Error al crear el perfil de cliente', clientId: null };
        }

        return { success: true, clientId: newClient.id };

    } catch (error) {
        console.error('syncStudentClient error:', error);
        return { error: 'Error del servidor', clientId: null };
    }
}

export async function updateStudentProjectFiles(jobId: string, filesData: any[]) {
    const { clientId, error } = await syncStudentClient();
    
    if (error || !clientId) {
        return { error: 'No autorizado' };
    }

    // Verify ownership and state
    const { data: job, error: fetchError } = await supabaseAdmin
        .from('gestion_trabajos')
        .select('cliente_id, estado')
        .eq('id', jobId)
        .single();

    if (fetchError || !job) {
        return { error: 'Proyecto no encontrado' };
    }

    if (job.cliente_id !== clientId) {
        return { error: 'No tienes permiso para editar este proyecto' };
    }

    if (job.estado !== 'cotizado') {
        return { error: 'El proyecto ya no puede ser editado porque se encuentra en evaluación o producción.' };
    }

    const { error: updateError } = await supabaseAdmin
        .from('gestion_trabajos')
        .update({ files: filesData })
        .eq('id', jobId);

    if (updateError) {
        console.error('Error updating files:', updateError);
        return { error: 'Error al actualizar los archivos' };
    }

    return { success: true };
}

export async function updateCreditoFiscal(jobId: string, value: boolean) {
    const { clientId, error } = await syncStudentClient();
    
    if (error || !clientId) {
        return { error: 'No autorizado' };
    }

    // Verify ownership
    const { data: job, error: fetchError } = await supabaseAdmin
        .from('gestion_trabajos')
        .select('cliente_id')
        .eq('id', jobId)
        .single();

    if (fetchError || !job) {
        return { error: 'Proyecto no encontrado' };
    }

    if (job.cliente_id !== clientId) {
        return { error: 'No tienes permiso para editar este proyecto' };
    }

    const { error: updateError } = await supabaseAdmin
        .from('gestion_trabajos')
        .update({ credito_fiscal: value })
        .eq('id', jobId);

    if (updateError) {
        console.error('Error updating credito_fiscal:', updateError);
        return { error: 'Error al actualizar' };
    }

    return { success: true };
}
