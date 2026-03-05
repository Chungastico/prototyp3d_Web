import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      if (!isLoaded) return;
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        // Asume que existe una tabla 'profiles' con la columna 'id' coincidiendo con Clerk User ID
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        // Siempre sincronizamos al usuario en segundo plano para asegurar que
        // su estatus de estudiante y su email estén actualizados en Supabase
        fetch('/api/sync-user', { method: 'POST' }).catch(e => console.error("Background sync error:", e));

        if (error && error.code !== 'PGRST116') {
           console.error('Error fetching role:', error);
           setRole(null); 
        } else if (data) {
           setRole(data.role);
        } else {
            // Usuario no existe en Supabase -> reintentar fetch después de sync manual
            await fetch('/api/sync-user', { method: 'POST' });
            
            // Reintentar fetch después de sync
            const { data: retryData } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
                
            if (retryData) {
                setRole(retryData.role);
            } else {
                // Si falla, asumir cliente por defecto para no bloquear la UI
                setRole('cliente'); 
            }
        }
      } catch (e) {
        console.error('Exception fetching role:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, isLoaded]);

  return { role, loading };
}
