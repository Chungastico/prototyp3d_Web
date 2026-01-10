'use client'

import { usePathname } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem, SidebarTrigger, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Package, LayoutDashboard, Settings, FileText, ShoppingCart, Users, FolderKanban, DollarSign } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import Image from "next/image"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
      if (path === '/admin') {
          return pathname === '/admin';
      }
      return pathname?.startsWith(path);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <Image 
             src="/images/logo/Letras.png" 
             alt="Prototyp3D Logo" 
             width={180} 
             height={60} 
             className="w-auto h-12"
           />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarItem href="/admin" icon={LayoutDashboard} active={isActive('/admin')}>Dashboard</SidebarItem>
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel>Gestión</SidebarGroupLabel>
                <SidebarItem href="/admin/projects" icon={FolderKanban} active={isActive('/admin/projects')}>Proyectos Internos</SidebarItem>
                <SidebarItem href="/admin/jobs" icon={FileText} active={isActive('/admin/jobs')}>Trabajos</SidebarItem>
                <SidebarItem href="/admin/inventory" icon={Package} active={isActive('/admin/inventory')}>Inventario</SidebarItem>
                 <SidebarItem href="/admin/catalog" icon={ShoppingCart} active={isActive('/admin/catalog')}>Catálogo 3D</SidebarItem>
                 <SidebarItem href="/admin/finances" icon={DollarSign} active={isActive('/admin/finances')}>Finanzas</SidebarItem>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Personas</SidebarGroupLabel>
                <SidebarItem href="/admin/clients" icon={Users} active={isActive('/admin/clients')}>Clientes</SidebarItem>
                <SidebarItem href="/admin/suppliers" icon={Users} active={isActive('/admin/suppliers')}>Proveedores</SidebarItem>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
             <UserButton afterSignOutUrl="/" />
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-gray-100 transition-all duration-300">
          <div className="p-6">
              {children}
          </div>
      </main>
    </SidebarProvider>
  )
}
