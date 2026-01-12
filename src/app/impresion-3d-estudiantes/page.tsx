import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Lightbulb, Users } from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Impresión 3D para Estudiantes | Maquetas y Proyectos en El Salvador',
  description: 'Servicio de impresión 3D especial para estudiantes universitarios y escolares en El Salvador. Maquetas, prototipos de tesis y proyectos de ingeniería con descuentos.',
  keywords: ['maquetas 3D El Salvador', 'impresión 3D estudiantes', 'proyectos universitarios 3D', 'tesis arquitectura maquetas'],
};

export default function EstudiantesPage() {
  return (
    <ScrollLayout>
      <main className="font-garet text-white bg-azul-oscuro">
        {/* Full Screen Hero with Cards */}
        <section className="h-[calc(100vh-80px)] flex flex-col px-4 md:px-6 relative z-10 overflow-hidden">
             <div className="max-w-6xl mx-auto w-full h-full flex flex-col justify-between py-6 md:py-0 md:justify-center gap-0 md:gap-8">
                <header className="text-center relative z-10 pt-2 md:pt-0 shrink-0 flex-1 flex flex-col justify-center">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-white mb-2 md:mb-2 leading-none">
                        Impresión 3D para <span className="text-naranja">Estudiantes</span>
                    </h1>
                    <span className="text-naranja font-bold tracking-widest uppercase text-xs sm:text-sm mb-2 md:mb-4 block">Ideal para Tesis y Proyectos</span>
                    <p className="text-sm sm:text-xl text-gray-300 max-w-3xl mx-auto font-light leading-snug hidden sm:block">
                        Sabemos que el tiempo y el presupuesto son clave en la universidad. Te ayudamos a entregar tu proyecto a tiempo con acabados profesionales.
                    </p>
                    <p className="text-xs text-gray-300 max-w-3xl mx-auto font-light leading-snug sm:hidden px-4">
                        Te ayudamos a entregar tu proyecto a tiempo con acabados profesionales.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 relative z-10 w-full mb-4 md:mb-0">
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex md:block items-center md:items-start gap-4 md:gap-0">
                        <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-0 md:mb-4 group-hover:scale-110 transition-transform shrink-0">
                            <BookOpen className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 text-white">Maquetas de Arquitectura</h3>
                            <p className="text-gray-400 leading-tight text-xs md:text-sm">
                                Imprimimos topografías complejas, fachadas detalladas y mobiliario a escala.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex md:block items-center md:items-start gap-4 md:gap-0">
                        <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-0 md:mb-4 group-hover:scale-110 transition-transform shrink-0">
                            <Lightbulb className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 text-white">Prototipos de Ingeniería</h3>
                            <p className="text-gray-400 leading-tight text-xs md:text-sm">
                                Engranajes, carcasas y mecanismos. Materiales resistentes como PETG o ABS.
                            </p>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg hover:bg-white/10 transition duration-300 group flex md:block items-center md:items-start gap-4 md:gap-0">
                        <div className="bg-naranja/10 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-0 md:mb-4 group-hover:scale-110 transition-transform shrink-0">
                            <Users className="text-naranja w-5 h-5 md:w-7 md:h-7" />
                        </div>
                        <div>
                            <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2 text-white">Descuentos Grupales</h3>
                            <p className="text-gray-400 leading-tight text-xs md:text-sm">
                                ¿Toda la clase necesita imprimir? Precios especiales por volumen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Call to Action Section (Below Fold) */}
        <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-r from-naranja/10 to-naranja/5 border border-naranja/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden z-10 transition-all hover:border-naranja/40">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-white mb-4">¿Tienes una entrega urgente?</h2>
                        <p className="text-lg text-gray-300 mb-2 max-w-xl">
                            Entendemos las "noches de entrega". Envíanos tu archivo hoy mismo para evaluar tiempos.
                        </p>
                        <p className="text-sm text-naranja/80 font-semibold">
                            *Sujeto a disponibilidad de máquinas.
                        </p>
                    </div>
                    <Link href="/contacto" className="relative z-10">
                        <button className="bg-naranja text-azul-oscuro font-bold py-4 px-8 rounded-full hover:bg-white hover:text-naranja transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                            Enviar archivo ahora
                        </button>
                    </Link>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
