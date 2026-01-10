'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type Props = {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'cliente'; 
    allowedRoles?: string[];
};

export default function ProtectedPage({ children, requiredRole, allowedRoles }: Props) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.replace('/auth');
            } else if (requiredRole && role !== requiredRole) {
                router.replace('/'); // redirige si no tiene el rol requerido
            } else if (allowedRoles && role && !allowedRoles.includes(role)) {
                router.replace('/');
            }
        }
    }, [user, role, loading, requiredRole, allowedRoles, router]);

    if (loading || !user) {
        return null;
    }

    if (requiredRole && role !== requiredRole) return null;
    if (allowedRoles && role && !allowedRoles.includes(role)) return null;

    return <>{children}</>;
}
