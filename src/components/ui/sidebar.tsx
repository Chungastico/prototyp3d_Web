"use client"

import * as React from "react"
import { PanelLeft, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
// import { UserButton } from "@clerk/nextjs" // Will import dynamically or usually standard import works

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
  isMobile: boolean
}>({
  open: true,
  setOpen: () => {},
  toggle: () => {},
  isMobile: false,
})

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  className,
  ...props
}: SidebarProviderProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setOpen(false)
      } else {
        setOpen(true)
      }
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggle = () => setOpen((prev) => !prev)

  return (
    <SidebarContext.Provider value={{ open, setOpen, toggle, isMobile }}>
      <div
        className={cn(
          "flex h-screen w-full overflow-hidden bg-background text-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const { open, isMobile, setOpen } = useSidebar()

  if (isMobile) {
    return (
      <>
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity",
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 border-r shadow-lg transition-transform duration-300 ease-in-out bg-azul-oscuro text-white",
            open ? "translate-x-0" : "-translate-x-full",
            className
          )}
        >
          <div className="flex justify-end p-4">
             <button onClick={() => setOpen(false)} className="text-white hover:text-naranja">
                <X className="h-6 w-6" />
             </button>
          </div>
          {children}
        </div>
      </>
    )
  }

  return (
    <div
      className={cn(
        "relative hidden md:flex flex-col border-r transition-all duration-300 ease-in-out bg-azul-oscuro text-white",
        open ? "w-64" : "w-16",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarHeader({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useSidebar()
  return (
    <div className={cn("flex items-center h-16 px-4 border-b border-azul-black transition-all duration-300 ease-in-out", 
      open ? "justify-between" : "justify-center",
      className)}>
       {open && <div className="flex-1 min-w-0">{children}</div>}
       <SidebarTrigger className={cn("shrink-0", open ? "ml-2" : "")}/>
    </div>
  )
}

export function SidebarContent({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto py-4 scrollbar-thin scrollbar-thumb-naranja", className)}>{children}</div>
}

export function SidebarFooter({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    const { open } = useSidebar()
  return (
    <div className={cn("p-4 border-t border-azul-black flex items-center justify-center", className)}>
        {children}
    </div>
  )
}

export function SidebarTrigger({ className, ...props }: React.HTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useSidebar()
  return (
    <button
      onClick={toggle}
      className={cn("p-2 rounded-md hover:bg-azul-black hover:text-naranja transition-colors text-azul-oscuro", className)}
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
}

export function SidebarGroup({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn("px-2 py-2", className)}>{children}</div>
}

export function SidebarGroupLabel({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
    const { open } = useSidebar()
    if (!open) return null
    return <div className={cn("px-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider", className)}>{children}</div>
}

interface SidebarItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    icon?: LucideIcon
    active?: boolean
}

export function SidebarItem({ icon: Icon, active, className, children, ...props }: SidebarItemProps) {
     const { open } = useSidebar()
     
     return (
         <a
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                active ? "bg-naranja text-white" : "text-gray-300 hover:bg-azul-black hover:text-naranja",
                className
            )}
            {...props}
         >
             {Icon ? <Icon className="h-5 w-5 shrink-0" /> : null}
             {open && <span>{children}</span>}
         </a>
     )
}
