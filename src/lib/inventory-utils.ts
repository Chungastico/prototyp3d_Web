import { supabase } from './supabase';

/**
 * Adjusts inventory stock for all pieces in a given job.
 * @param jobId The ID of the job/project.
 * @param deduct If true, stock is decreased. If false, stock is increased (returned).
 */
export const adjustInventoryForJob = async (jobId: string, deduct: boolean) => {
    // Fetch all pieces to get current requirements
    const { data: jobPieces } = await supabase
        .from('piezas_trabajo')
        .select('*')
        .eq('trabajo_id', jobId);
    
    if (!jobPieces || jobPieces.length === 0) return;

    for (const p of jobPieces) {
        // 1. Filament Adjustment
        if (p.filamento_id && p.gramos_usados > 0) {
            const totalGrams = p.gramos_usados * p.cantidad;
            const { data: filament } = await supabase
                .from('inventario_filamento')
                .select('stock_gramos_disponibles')
                .eq('id', p.filamento_id)
                .single();
            
            if (filament) {
                const currentStock = filament.stock_gramos_disponibles || 0;
                const newStock = deduct ? currentStock - totalGrams : currentStock + totalGrams;
                
                await supabase
                    .from('inventario_filamento')
                    .update({ stock_gramos_disponibles: newStock })
                    .eq('id', p.filamento_id);
            }
        }

        // 2. Object Adjustment
        if (p.objeto_id && p.cantidad_objeto_por_pieza && p.cantidad_objeto_por_pieza > 0) {
            const totalObjects = p.cantidad_objeto_por_pieza * p.cantidad;
            const { data: obj } = await supabase
                .from('inventario_objetos')
                .select('stock_disponible')
                .eq('id', p.objeto_id)
                .single();
            
            if (obj) {
                const currentStock = obj.stock_disponible || 0;
                const newStock = deduct ? currentStock - totalObjects : currentStock + totalObjects;
                
                await supabase
                    .from('inventario_objetos')
                    .update({ stock_disponible: newStock })
                    .eq('id', p.objeto_id);
            }
        }
    }
};
