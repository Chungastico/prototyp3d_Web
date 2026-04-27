'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { UserButton, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from '@/context/AuthContext';
import { createPortal } from 'react-dom';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import React from 'react';

type NavbarProps = {
    visible: boolean;
};

export default function Navbar({ visible }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { user, role } = useAuth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
             document.body.style.overflow = menuOpen ? 'hidden' : '';
        }
    }, [menuOpen, mounted]);

    const dashboardLink = role === 'admin' ? '/admin' : '/dashboard';

    return (
        <nav
            className={`fixed top-0 left-0 right-0 bg-azul-oscuro text-naranja font-garet font-extrabold px-6 py-4 flex items-center justify-between z-50 transition-transform duration-300 ${
                visible ? 'translate-y-0' : '-translate-y-full'
            }`}
        >
            {/* Logo y letras */}
            <Link href="/" className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center">
                    <Image
                        src="/images/logo/Logo_Naranja.png"
                        alt="Logo"
                        width={56}
                        height={56}
                        className="object-contain"
                    />
                </div>
                <div className="hidden md:flex w-[160px] sm:w-[200px] h-[48px] items-center">
                    <Image
                        src="/images/logo/Letras.png"
                        alt="Texto PROT0TYP3D"
                        width={200}
                        height={48}
                    />
                </div>
            </Link>

            {/* Botón hamburguesa móvil */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-naranja focus:outline-none z-50"
            >
                {menuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>

            {/* Menú desktop con Navigation Menu */}
            <div className="hidden md:flex items-center space-x-1">
                {/* Soluciones Dropdown */}
                <NavigationMenu className="text-naranja">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold">Soluciones</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div className="grid grid-cols-2 w-[500px] lg:w-[600px] bg-white p-4 gap-4">
                                    <div>
                                        <h4 className="px-3 mb-2 text-xs font-bold text-naranja uppercase tracking-widest opacity-70">Manufactura</h4>
                                        <ul className="space-y-1">
                                            <ListItem href="/servicios" title="Todos los Servicios">Ver soluciones.</ListItem>
                                            <ListItem href="/impresion-3d-el-salvador" title="Impresión 3D">Estudio profesional.</ListItem>
                                            <ListItem href="/impresion-3d-estudiantes" title="Estudiantes">Maquetas y tesis.</ListItem>
                                            <ListItem href="/impresion-3d-emprendedores" title="Emprendedores">Prototipado rápido.</ListItem>
                                            <ListItem href="/impresion-3d-empresas" title="Empresas">Lotes y funcional.</ListItem>
                                        </ul>
                                    </div>
                                    <div className="border-l border-gray-100 pl-4">
                                        <h4 className="px-3 mb-2 text-xs font-bold text-naranja uppercase tracking-widest opacity-70">Productos</h4>
                                        <ul className="space-y-1">
                                            <ListItem href="/catalogo" title="Ir al Catálogo">Nuestra tienda.</ListItem>
                                            <ListItem href="/llaveros-personalizados-el-salvador" title="Llaveros">Diseños únicos.</ListItem>
                                            <ListItem href="/piezas-automotrices-3d" title="Automotriz">Repuestos raros.</ListItem>
                                            <ListItem href="/regalos-personalizados-3d" title="Regalos">Detalles 3D.</ListItem>
                                        </ul>
                                    </div>
                                </div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Tienda Link */}
                <Link href="/catalogo" className="px-4 py-2 text-naranja hover:bg-naranja/10 rounded-md transition-colors text-base font-extrabold">
                    Tienda
                </Link>

                {/* Recursos Dropdown */}
                <NavigationMenu className="text-naranja">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold">Recursos</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-2 p-3 md:w-[500px] md:grid-cols-2 bg-white">
                                    <ListItem href="/proyectos" title="Proyectos">Galería de éxito.</ListItem>
                                    <ListItem href="/materiales-impresion-3d" title="Materiales">Guía técnica.</ListItem>
                                    <ListItem href="/como-funciona-impresion-3d" title="Cómo funciona">Paso a paso.</ListItem>
                                    <ListItem href="/blog" title="Blog">Tips y noticias.</ListItem>
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Compañía Dropdown */}
                <NavigationMenu className="text-naranja">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger className="bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold">Compañía</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="flex flex-col w-[160px] p-2 bg-white">
                                    <ListItem href="/nosotros" title="Nosotros" className="p-2" />
                                    <ListItem href="/contacto" title="Contacto" className="p-2" />
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                {/* Acciones de Usuario */}
                <div className="ml-4 flex items-center gap-4">
                     {user ? (
                        <>
                            <Link href={dashboardLink}>
                                <button className="bg-naranja text-azul-oscuro font-extrabold py-2 px-5 rounded-full hover:bg-opacity-80 transition">
                                    Dashboard
                                </button>
                            </Link>
                            <div className="scale-125">
                                <UserButton afterSignOutUrl="/" />
                            </div>
                        </>
                    ) : (
                        <>
                            <SignInButton mode="modal">
                                <button className="bg-naranja text-azul-oscuro font-extrabold py-2 px-5 rounded-full hover:bg-opacity-80 transition whitespace-nowrap">
                                    Iniciar sesión
                                </button>
                            </SignInButton>
                        </>
                    )}
                </div>
            </div>

            {/* Portal for Mobile Menu */}
            {mounted && createPortal(
                <AnimatePresence>
                    {menuOpen && (
                        <>
                             {/* Overlay con blur */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] md:hidden"
                                onClick={() => setMenuOpen(false)}
                            />

                            {/* Drawer lateral derecho (Móvil) */}
                            <motion.div
                                key="drawer"
                                initial={{ clipPath: 'circle(0% at 100% 10%)' }}
                                animate={{ clipPath: 'circle(150% at 100% 10%)' }}
                                exit={{ clipPath: 'circle(0% at 100% 10%)' }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className="fixed top-0 right-0 h-full w-[85vw] max-w-sm z-[9999] md:hidden shadow-lg border-l border-naranja/20"
                            >
                                <div className="w-full h-full bg-[#262C4D] relative">
                                    <div className="flex flex-col items-start p-6 space-y-6 text-lg h-full overflow-y-auto font-garet font-extrabold">
                                        <button
                                            onClick={() => setMenuOpen(false)}
                                            className="self-end text-naranja"
                                        >
                                            <X size={28} />
                                        </button>
                                        <div className="w-full border-b border-white/10 pb-2">
                                            <span className="block mb-2 text-naranja">Soluciones</span>
                                            <div className="pl-4 flex flex-col gap-2 text-base text-white/90 font-medium pb-2">
                                                <span className="text-xs text-gray-400 uppercase">Manufactura</span>
                                                <Link href="/impresion-3d-el-salvador" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Impresión 3D
                                                </Link>
                                                <Link href="/impresion-3d-estudiantes" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Para Estudiantes
                                                </Link>
                                                <Link href="/impresion-3d-emprendedores" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Para Emprendedores
                                                </Link>
                                                <Link href="/impresion-3d-empresas" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Para Empresas
                                                </Link>
                                                <span className="text-xs text-gray-400 uppercase mt-2">Productos</span>
                                                <Link href="/llaveros-personalizados-el-salvador" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Llaveros 3D
                                                </Link>
                                                <Link href="/piezas-automotrices-3d" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Piezas Auto
                                                </Link>
                                                <Link href="/regalos-personalizados-3d" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors underline decoration-white/10 underline-offset-4">
                                                    • Regalos Únicos
                                                </Link>
                                            </div>
                                        </div>
                                        
                                        <Link
                                            href="/catalogo"
                                            onClick={() => setMenuOpen(false)}
                                            className="text-naranja hover:text-white transition w-full border-b border-white/10 pb-2"
                                        >
                                            Tienda / Catálogo
                                        </Link>

                                        <div className="w-full border-b border-white/10 pb-4">
                                            <span className="block mb-4 text-naranja text-xs uppercase tracking-widest opacity-80">Compañía y Recursos</span>
                                            <div className="pl-4 grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-white/90 font-medium">
                                                <Link href="/nosotros" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">• Nosotros</Link>
                                                <Link href="/contacto" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">• Contacto</Link>
                                                <Link href="/proyectos" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">• Proyectos</Link>
                                                <Link href="/materiales-impresion-3d" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">• Materiales</Link>
                                            </div>
                                        </div>

                                        <div className="pt-4 w-full">
                                            {user ? (
                                                <>
                                                    <Link
                                                        href={dashboardLink}
                                                        onClick={() => setMenuOpen(false)}
                                                        className="w-full"
                                                    >
                                                        <button className="w-full bg-naranja text-azul-oscuro font-extrabold py-3 px-5 rounded-full hover:bg-opacity-80 transition mb-4">
                                                            Dashboard
                                                        </button>
                                                    </Link>
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <span className="text-sm text-gray-400">Tu cuenta:</span>
                                                        <UserButton afterSignOutUrl="/" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    <SignInButton mode="modal">
                                                        <button className="bg-naranja text-azul-oscuro font-extrabold py-3 px-5 rounded-full hover:bg-opacity-80 transition w-full">
                                                            Iniciar sesión
                                                        </button>
                                                    </SignInButton>
                                                    <SignUpButton mode="modal">
                                                        <button className="border border-naranja text-naranja font-extrabold py-3 px-5 rounded-full hover:bg-naranja hover:text-azul-oscuro transition w-full">
                                                            Registrarse
                                                        </button>
                                                    </SignUpButton>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </nav>
    );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none text-azul-oscuro">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-slate-500">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
