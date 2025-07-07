'use client';

import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => {
        setCollapsed((prev) => !prev);
    };

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
