'use client'

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem, SidebarTrigger, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import { Package, LayoutDashboard, Settings, FileText, ShoppingCart, Users, FolderKanban } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
           <span className="font-bold text-xl tracking-tighter">PROTOTYP3D</span>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>General</SidebarGroupLabel>
                <SidebarItem href="/admin" icon={LayoutDashboard}>Dashboard</SidebarItem>
            </SidebarGroup>
            
            <SidebarGroup>
                <SidebarGroupLabel>Gestión</SidebarGroupLabel>
                <SidebarItem href="/admin/projects" icon={FolderKanban} active>Proyectos Internos</SidebarItem>
                <SidebarItem href="/admin/jobs" icon={FileText}>Trabajos</SidebarItem>
                <SidebarItem href="/admin/inventory" icon={Package}>Inventario</SidebarItem>
                 <SidebarItem href="/admin/catalog" icon={ShoppingCart}>Catálogo 3D</SidebarItem>
            </SidebarGroup>

            <SidebarGroup>
                <SidebarGroupLabel>Personas</SidebarGroupLabel>
                <SidebarItem href="/admin/clients" icon={Users}>Clientes</SidebarItem>
                <SidebarItem href="/admin/suppliers" icon={Users}>Proveedores</SidebarItem>
            </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
             <UserButton afterSignOutUrl="/" />
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-gray-100 transition-all duration-300">
          <header className="h-16 flex items-center px-6 border-b bg-white">
              <SidebarTrigger />
              <h1 className="ml-4 text-lg font-semibold text-gray-800">Admin Panel</h1>
          </header>
          <div className="p-6">
              {children}
          </div>
      </main>
    </SidebarProvider>
  )
}
