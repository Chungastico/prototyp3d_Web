'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, ThumbsUp, User } from 'lucide-react';

const sections = [
    {
        key: 'mision',
        title: 'Misión',
        icon: <Lightbulb size={20} />,
        color: 'bg-azul-oscuro text-white',
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4 text-naranja">Nuestra Misión</h2>
                <p>
                    Facilitamos la materialización de ideas a través de impresión 3D confiable, creativa y accesible.
                    Acompañamos a estudiantes, emprendedores y empresas en cada paso del proceso para que prototipar
                    sea tan fácil como imaginar.
                </p>
            </>
        ),
    },
    {
        key: 'vision',
        title: 'Visión',
        icon: <Sparkles size={20} />,
        color: 'bg-beige-claro text-azul-oscuro',
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4 text-azul-oscuro">Nuestra Visión</h2>
                <p>
                    Ser el espacio de referencia en impresión 3D en nuestra región, reconocido por brindar soluciones
                    innovadoras, atención cercana y un entorno seguro donde cualquier idea puede tomar forma.
                </p>
            </>
        ),
    },
    {
        key: 'diferenciadores',
        title: '¿Por qué elegirnos?',
        icon: <ThumbsUp size={20} />,
        color: 'bg-naranja text-azul-oscuro',
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4">¿Por qué elegirnos?</h2>
                <ul className="list-disc pl-5 space-y-2 text-base">
                    <li>Acompañamos desde la idea hasta el resultado final</li>
                    <li>Branding moderno y comunicación cercana (Instagram)</li>
                    <li>Pedidos personalizados, incluso desde 1 unidad</li>
                    <li>Entregas rápidas y atención directa del creador</li>
                    <li>Colaboración con estudiantes, creativos y emprendedores</li>
                </ul>
            </>
        ),
    },
    {
        key: 'historia',
        title: 'Mi historia',
        icon: <User size={20} />,
        color: 'bg-azul-oscuro text-white',
        content: (
            <>
                <h2 className="text-3xl font-bold mb-4 text-naranja">Mi Historia</h2>
                <p>
                    Soy Gabriel, y este proyecto nació cuando necesitaba imprimir algo para un trabajo universitario.
                    Los precios eran tan altos que casi equivalían a comprar una impresora. Esa frustración me llevó
                    a crear Prototyp3D: un espacio para apoyar a quienes inician, cobrando lo justo y ofreciendo
                    acompañamiento real en el proceso creativo.
                </p>
            </>
        ),
    },
];

export default function NosotrosPage() {
    const [active, setActive] = useState('mision');
    const currentSection = sections.find((s) => s.key === active);

    return (
        <main className="min-h-screen flex flex-col md:flex-row relative">
            {/* Contenido */}
            <div className="flex-1 p-8 md:p-16 flex items-center justify-center bg-white">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection?.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-2xl"
                    >
                        {currentSection?.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Pestañas estilo cartapacio */}
            <div className="fixed right-0 top-1/2 transform -translate-y-1/2 z-30 hidden md:flex flex-col items-end gap-4 pr-2">
                {sections.map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setActive(s.key)}
                        className={`w-40 py-2 px-4 rounded-l-full shadow-md font-bold flex items-center gap-2 transition-all duration-300 
                            ${s.color} ${active === s.key ? 'scale-105' : 'opacity-80 hover:opacity-100'}`}
                    >
                        {s.icon}
                        <span className="text-sm">{s.title}</span>
                    </button>
                ))}
            </div>

            {/* Pestañas móviles (abajo tipo tabs) */}
            <div className="md:hidden flex justify-around fixed bottom-0 w-full bg-white border-t z-40">
                {sections.map((s) => (
                    <button
                        key={s.key}
                        onClick={() => setActive(s.key)}
                        className={`flex-1 text-xs py-2 font-bold ${active === s.key ? 'text-naranja' : 'text-gray-500'}`}
                    >
                        {s.title}
                    </button>
                ))}
            </div>
        </main>
    );
}
