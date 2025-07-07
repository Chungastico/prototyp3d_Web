// src/components/admin/Sidebar.tsx
'use client';

import { LogOut, Home, Package, ShoppingCart, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

type SidebarProps = {
    collapsed: boolean;
};

const Sidebar = ({ collapsed }: SidebarProps) => {
    const { user, logoutUser } = useAuth();

    return (
        <aside
            className={`bg-azul-oscuro text-naranja flex flex-col justify-between py-6 px-4 transition-all duration-300 ${
                collapsed ? 'w-20' : 'w-64'
            }`}
        >
            {/* Logo */}
            <div className="mb-10 text-center">
                {!collapsed ? (
                    <Image
                        src="/images/logo/Letras.png"
                        alt="Logo Prototyp3D"
                        width={140}
                        height={40}
                        className="mx-auto"
                    />
                ) : (
                    <Image
                        src="/images/logo/Letras.png"
                        alt="Logo Mini"
                        width={40}
                        height={40}
                        className="mx-auto"
                    />
                )}
            </div>

            {/* Navegación */}
            <nav className="space-y-6">
                <SidebarLink icon={<Home size={28} />} label="Inicio" href="/admin" collapsed={collapsed} />
                <SidebarLink icon={<Package size={28} />} label="Productos" href="/admin/productos" collapsed={collapsed} />
                <SidebarLink icon={<ShoppingCart size={28} />} label="Órdenes" href="/admin/ordenes" collapsed={collapsed} />
                <SidebarLink icon={<BarChart2 size={28} />} label="Estadísticas" href="/admin/estadisticas" collapsed={collapsed} />
            </nav>

            {/* Perfil y logout */}
            <div className="text-center mt-10">
                {user?.photoURL ? (
                    <Image
                        src={user.photoURL}
                        alt="Foto de perfil"
                        width={collapsed ? 48 : 96}
                        height={collapsed ? 48 : 96}
                        className="rounded-full mx-auto transition-all duration-300"
                    />
                ) : (
                    <div
                        className={`bg-gray-200 rounded-full mx-auto transition-all duration-300 ${
                            collapsed ? 'w-12 h-12' : 'w-24 h-24'
                        }`}
                    />
                )}

                {!collapsed && (
                    <p className="font-bold mt-2">{user?.displayName || 'Usuario'}</p>
                )}

                <button
                    onClick={logoutUser}
                    className="mt-4 text-naranja hover:text-white transition mx-auto"
                >
                    <LogOut size={24} />
                </button>
            </div>
        </aside>
    );
};

type SidebarLinkProps = {
    icon: React.ReactNode;
    label: string;
    href: string;
    collapsed: boolean;
};

const SidebarLink = ({ icon, label, href, collapsed }: SidebarLinkProps) => (
    <Link href={href} className="flex items-center gap-3 hover:text-white transition text-lg">
        {icon}
        {!collapsed && <span>{label}</span>}
    </Link>
);

export default Sidebar;
