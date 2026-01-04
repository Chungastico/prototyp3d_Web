// src/components/admin/Sidebar.tsx
'use client';

import { Home, Package, ShoppingCart, BarChart2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { UserButton } from '@clerk/nextjs';

type SidebarProps = {
    collapsed: boolean;
};

const Sidebar = ({ collapsed }: SidebarProps) => {

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
            <div className={`text-center mt-10 flex flex-col items-center ${collapsed ? 'px-0' : 'px-4'}`}>
                <div className="scale-125 mb-4">
                    <UserButton 
                        showName={!collapsed}
                        appearance={{
                            elements: {
                                userButtonBox: "flex flex-col gap-2",
                                userButtonOuterIdentifier: "text-naranja font-bold",
                                avatarBox: collapsed ? "w-10 h-10" : "w-16 h-16"
                            }
                        }}
                    />
                </div>
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
