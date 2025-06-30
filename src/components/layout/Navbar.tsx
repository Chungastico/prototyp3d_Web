'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  visible: boolean;
};

export default function Navbar({ visible }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  }, [menuOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 bg-azul-oscuro text-naranja font-garet font-extrabold px-6 py-4 flex items-center justify-between z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      {/* Logo y letras */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden text-naranja focus:outline-none z-50"
      >
        {menuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>

      {/* Menú desktop */}
      <div className="hidden md:flex items-center space-x-6">
        <Link href="#inicio" className="hover:text-beige-claro transition">
          Inicio
        </Link>
        <Link href="#nosotros" className="hover:text-beige-claro transition">
          Nosotros
        </Link>
        <Link href="#servicios" className="hover:text-beige-claro transition">
          Servicios
        </Link>
        <Link href="#catalogo" className="hover:text-beige-claro transition">
          Catálogo
        </Link>
        <Link href="#contacto">
          <button className="bg-naranja text-azul-oscuro font-extrabold py-2 px-5 rounded-full hover:bg-opacity-80 transition">
            Contacto
          </button>
        </Link>
      </div>

      {/* Overlay con blur */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Drawer lateral derecho */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="drawer"
            initial={{ clipPath: 'circle(0% at 100% 10%)' }}
            animate={{ clipPath: 'circle(150% at 100% 10%)' }}
            exit={{ clipPath: 'circle(0% at 100% 10%)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed top-0 right-0 h-full w-64 bg-azul-oscuro z-50 md:hidden shadow-lg"
          >
            <div className="flex flex-col items-start p-6 space-y-4 text-lg">
              <button
                onClick={() => setMenuOpen(false)}
                className="self-end text-naranja"
              >
                <X size={28} />
              </button>
              <Link
                href="#inicio"
                onClick={() => setMenuOpen(false)}
                className="hover:text-beige-claro transition"
              >
                Inicio
              </Link>
              <Link
                href="#nosotros"
                onClick={() => setMenuOpen(false)}
                className="hover:text-beige-claro transition"
              >
                Nosotros
              </Link>
              <Link
                href="#servicios"
                onClick={() => setMenuOpen(false)}
                className="hover:text-beige-claro transition"
              >
                Servicios
              </Link>
              <Link
                href="#catalogo"
                onClick={() => setMenuOpen(false)}
                className="hover:text-beige-claro transition"
              >
                Catálogo
              </Link>
              <Link href="#contacto" onClick={() => setMenuOpen(false)}>
                <button className="bg-naranja text-azul-oscuro font-extrabold py-2 px-5 rounded-full hover:bg-opacity-80 transition">
                  Contacto
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
