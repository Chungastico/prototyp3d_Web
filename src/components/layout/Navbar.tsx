'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { UserButton } from "@clerk/nextjs";
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
            <div className="hidden md:flex items-center space-x-2">
                <NavigationMenu className="text-naranja">
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <Link href="/" legacyBehavior passHref>
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold`}>
                          Inicio
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    
                    {/* Servicios Dropdown */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold">Servicios</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] bg-white">
                                <li className="row-span-4">
                                    <NavigationMenuLink asChild>
                                        <a
                                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-naranja/50 to-naranja p-6 no-underline outline-none focus:shadow-md"
                                          href="/servicios"
                                        >
                                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                                                Servicios 3D
                                            </div>
                                            <p className="text-sm leading-tight text-white/90">
                                                Explora todas nuestras soluciones de fabricación digital.
                                            </p>
                                        </a>
                                    </NavigationMenuLink>
                                </li>
                                <ListItem href="/impresion-3d-el-salvador" title="Impresión 3D El Salvador">
                                    Servicio de manufactura aditiva y diseño.
                                </ListItem>
                                <ListItem href="/impresion-3d-estudiantes" title="Para Estudiantes">
                                    Maquetas, tesis y descuentos académicos.
                                </ListItem>
                                <ListItem href="/impresion-3d-emprendedores" title="Para Emprendedores">
                                    Validación de ideas, MVPs y prototipos.
                                </ListItem>
                                <ListItem href="/impresion-3d-empresas" title="Para Empresas">
                                    Protos funcionales y lotes cortos.
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    {/* Recursos Dropdown (New) */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold">Recursos</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white">
                                <ListItem href="/proyectos" title="Proyectos y Casos">
                                    Mira lo que hemos fabricado. Galería de éxito.
                                </ListItem>
                                <ListItem href="/materiales-impresion-3d" title="Guía de Materiales">
                                    ¿PLA, PETG o ABS? Aprende cuál elegir.
                                </ListItem>
                                <ListItem href="/como-funciona-impresion-3d" title="¿Cómo funciona?">
                                    Del archivo digital a la pieza física.
                                </ListItem>
                                <ListItem href="/blog" title="Blog (Pronto)">
                                    Artículos y noticias del mundo 3D.
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>


                    <NavigationMenuItem>
                      <Link href="/nosotros" legacyBehavior passHref>
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold`}>
                          Nosotros
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Link href="/contacto" legacyBehavior passHref>
                        <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-naranja hover:bg-naranja/10 hover:text-naranja focus:bg-naranja/10 focus:text-naranja !text-base !font-extrabold`}>
                          Contacto
                        </NavigationMenuLink>
                      </Link>
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
                            <Link href="/auth">
                                <button className="bg-naranja text-azul-oscuro font-extrabold py-2 px-5 rounded-full hover:bg-opacity-80 transition whitespace-nowrap">
                                    Iniciar sesión
                                </button>
                            </Link>
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
                                        <Link
                                            href="/"
                                            onClick={() => setMenuOpen(false)}
                                            className="text-naranja hover:text-white transition w-full border-b border-white/10 pb-2"
                                        >
                                            Inicio
                                        </Link>
                                        <div className="w-full border-b border-white/10 pb-2">
                                            <Link
                                                href="/servicios"
                                                onClick={() => setMenuOpen(false)}
                                                className="text-naranja hover:text-white transition w-full block mb-2"
                                            >
                                                Servicios
                                            </Link>
                                            <div className="pl-4 flex flex-col gap-2 text-base text-white/90 font-medium">
                                                <Link href="/impresion-3d-el-salvador" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Impresión 3D El Salvador
                                                </Link>
                                                <Link href="/impresion-3d-estudiantes" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Para Estudiantes
                                                </Link>
                                                <Link href="/impresion-3d-emprendedores" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Para Emprendedores
                                                </Link>
                                                <Link href="/impresion-3d-empresas" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Para Empresas
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="w-full border-b border-white/10 pb-2">
                                            <span className="block mb-2 text-naranja">Recursos</span>
                                            <div className="pl-4 flex flex-col gap-2 text-base text-white/90 font-medium">
                                                <Link href="/proyectos" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Proyectos
                                                </Link>
                                                <Link href="/materiales-impresion-3d" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Materiales
                                                </Link>
                                                <Link href="/como-funciona-impresion-3d" onClick={() => setMenuOpen(false)} className="hover:text-naranja transition-colors">
                                                    • Cómo Funciona
                                                </Link>
                                            </div>
                                        </div>
                                        <Link
                                            href="/nosotros"
                                            onClick={() => setMenuOpen(false)}
                                            className="text-naranja hover:text-white transition w-full border-b border-white/10 pb-2"
                                        >
                                            Nosotros
                                        </Link>
                                        <Link
                                            href="/contacto"
                                            onClick={() => setMenuOpen(false)}
                                            className="text-naranja hover:text-white transition w-full border-b border-white/10 pb-2"
                                        >
                                            Contacto
                                        </Link>

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
                                                    <Link href="/auth" onClick={() => setMenuOpen(false)} className="w-full">
                                                        <button className="bg-naranja text-azul-oscuro font-extrabold py-3 px-5 rounded-full hover:bg-opacity-80 transition w-full">
                                                            Iniciar sesión
                                                        </button>
                                                    </Link>
                                                    <Link href="/auth" onClick={() => setMenuOpen(false)} className="w-full">
                                                        <button className="border border-naranja text-naranja font-extrabold py-3 px-5 rounded-full hover:bg-naranja hover:text-azul-oscuro transition w-full">
                                                            Registrarse
                                                        </button>
                                                    </Link>
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
