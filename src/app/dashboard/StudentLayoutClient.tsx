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
        <SidebarHeader className="py-3">
           <div className="ml-4 h-10 overflow-hidden flex items-center">
             <Image 
               src="/images/logo/Letras.png" 
               alt="Prototyp3D Logo" 
               width={200} 
               height={200} 
               className="w-44 flex-shrink-0"
             />
           </div>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel>Principal</SidebarGroupLabel>
                <SidebarItem href="/dashboard" icon={LayoutDashboard} active={isActive('/dashboard')}>Mis Proyectos</SidebarItem>
                <SidebarItem href="/dashboard/catalogo" icon={ShoppingCart} active={isActive('/dashboard/catalogo')}>Catálogo General</SidebarItem>
            </SidebarGroup>
            
        </SidebarContent>
        <SidebarFooter
            className="p-4 flex flex-row items-center gap-2 cursor-pointer hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => {
                const btn = document.getElementById('clerk-user-btn')?.querySelector('button');
                btn?.click();
            }}
        >
             <div id="clerk-user-btn" onClick={(e) => e.stopPropagation()}>
                <UserButton 
                   afterSignOutUrl="/" 
                   userProfileMode="navigation"
                   userProfileUrl="/dashboard/perfil"
                >
                   <UserButton.MenuItems>
                   </UserButton.MenuItems>
                </UserButton>
             </div>
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
