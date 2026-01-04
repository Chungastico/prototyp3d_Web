'use client';

import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { useState, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const { role, loading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (!loading && role !== 'admin') {
            router.push('/'); // Redirigir a landing si no es admin
        }
    }, [role, loading, router]);

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-azul-black text-white">Cargando...</div>;
    }

    if (role !== 'admin') return null; // Evitar flash de contenido protected

    return (
        <div className="flex h-screen bg-azul-black text-white">
            <Sidebar collapsed={collapsed} />
            <div className="flex-1 flex flex-col">
                <Topbar onToggleSidebar={toggleSidebar} />
                <main className="flex-1 p-6 overflow-hidden">{children}</main>
            </div>
        </div>
    );
}
