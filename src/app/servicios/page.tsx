import { Metadata } from 'next';
import Link from 'next/link';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Printer, Box, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Servicios de Impresión 3D y Diseño | Prototyp3D El Salvador',
  description: 'Ofrecemos impresión 3D FDM y diseño CAD en El Salvador Calidad profesional para estudiantes y empresas.',
};

export default function ServicesPage() {
  return (
    <ScrollLayout>
      <main className="min-h-screen bg-azul-oscuro font-garet relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-naranja/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-azul/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center mb-16 relative z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Servicios de <span className="text-naranja">Fabricación Digital</span>
            </h1>
            <span className="text-naranja font-bold tracking-widest uppercase text-sm mb-6 block">
              Soluciones Integrales
            </span>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light">
              Transformamos tus ideas en objetos tangibles. Nos especializamos en impresión 3D y modelado digital para llevar tus proyectos al siguiente nivel.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 relative z-10">
            {/* Impresión 3D */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-naranja/20 flex flex-col">
              <div className="bg-naranja w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:rotate-6 transition-transform">
                <Printer className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Impresión 3D</h2>
              <p className="text-gray-300 mb-8 text-lg flex-grow">
                Materializa tus diseños con nuestra granja de impresión 3D. Utilizamos tecnología FDM para crear piezas resistentes, funcionales y precisas. Ideal para prototipos, maquetas y lotes de producción.
              </p>
              <ul className="space-y-3 mb-10 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-naranja rounded-full" />
                  Materiales: PLA, PETG, TPU
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-naranja rounded-full" />
                  Gran volumen de impresión
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-naranja rounded-full" />
                  Precios especiales para estudiantes
                </li>
              </ul>
              <Link href="/impresion-3d-el-salvador">
                <button className="w-full flex items-center justify-center gap-2 bg-naranja text-azul-oscuro font-bold py-4 px-6 rounded-full hover:bg-white hover:text-naranja transition-colors">
                  Ver servicio de Impresión
                  <ArrowRight size={20} />
                </button>
              </Link>
            </div>

            {/* Diseño 3D */}
            <div className="group bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-3xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-azul/20 flex flex-col">
              <div className="bg-azul w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:-rotate-6 transition-transform">
                <Box className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Modelado 3D</h2>
              <p className="text-gray-300 mb-8 text-lg flex-grow">
                ¿No tienes el archivo? No hay problema. Nuestro equipo de diseño convierte tus bocetos o ideas en modelos 3D listos para fabricar. Ingeniería inversa y diseño de producto.
              </p>
              <ul className="space-y-3 mb-10 text-gray-400">
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-azul rounded-full" />
                  Diseño CAD Paramétrico
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-azul rounded-full" />
                  Optimización para impresión 3D
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-azul rounded-full" />
                  Asesoría técnica personalizada
                </li>
              </ul>
              <Link href="/contacto">
                <button className="w-full flex items-center justify-center gap-2 bg-naranja text-azul-oscuro font-bold py-4 px-6 rounded-full hover:bg-white hover:text-naranja transition-colors">
                  Solicitar Diseño
                  <ArrowRight size={20} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
