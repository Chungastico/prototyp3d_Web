'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'cliente'; // puedes agregar más roles si usas más
};

export default function ProtectedPage({ children, requiredRole }: Props) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/auth');
            } else if (requiredRole && role !== requiredRole) {
                router.replace('/'); // redirige si no tiene el rol requerido
            }
        }
    }, [user, role, loading, requiredRole, router]);

    if (loading || !user || (requiredRole && role !== requiredRole)) {
        return null; // o loader si prefieres
    }

    return <>{children}</>;
}
