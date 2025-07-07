'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || role !== 'admin')) {
            router.push('/');
        }
    }, [user, role, loading, router]);

    if (loading || !user || role !== 'admin') return null;

    return <>{children}</>;
}
