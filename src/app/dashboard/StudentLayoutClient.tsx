'use client'

import { usePathname } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem, SidebarGroup, SidebarGroupLabel, SidebarTrigger } from "@/components/ui/sidebar"
import { Package, LayoutDashboard, ShoppingCart, User as UserIcon } from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"
import ProtectedPage from "@/components/ProtectedPage"

export default function StudentLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => {
      if (path === '/dashboard') {
          return pathname === '/dashboard';
      }
      return pathname?.startsWith(path);
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="py-4">
           <Image 
             src="/images/logo/Letras.png" 
             alt="Prototyp3D Logo" 
             width={180} 
             height={60} 
             className="w-auto h-12 ml-4"
           />
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Principal</SidebarGroupLabel>
                <SidebarItem href="/dashboard" icon={LayoutDashboard} active={isActive('/dashboard')}>Mis Proyectos</SidebarItem>
                <SidebarItem href="/dashboard/catalogo" icon={ShoppingCart} active={isActive('/dashboard/catalogo')}>Catálogo General</SidebarItem>
            </SidebarGroup>
            
        </SidebarContent>
        <SidebarFooter className="p-4 flex flex-row items-center gap-2">
             <UserButton 
                afterSignOutUrl="/" 
                userProfileMode="navigation"
                userProfileUrl="/dashboard/perfil"
             >
                <UserButton.MenuItems>
                </UserButton.MenuItems>
             </UserButton>
             <span className="text-sm font-medium text-white/90">Mi Cuenta</span>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 overflow-auto bg-[#F8F9FA] transition-all duration-300">
          <div className="md:hidden p-4 border-b bg-white flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-2">
                  <SidebarTrigger />
                  <span className="font-semibold text-gray-700">Prototyp3D</span>
              </div>
              <UserButton 
                 afterSignOutUrl="/" 
                 userProfileMode="navigation"
                 userProfileUrl="/dashboard/perfil"
              >
                  <UserButton.MenuItems>
                  </UserButton.MenuItems>
              </UserButton>
          </div>
          <div className="p-4 md:p-8">
              {/* Only requirement here is to be signed in, you can still add ProtectedPage if needed but Clerk middleware handles it */}
              {children}
          </div>
      </main>
    </SidebarProvider>
  )
}
