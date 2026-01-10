import { Metadata } from 'next';
import Image from 'next/image';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Sobre Nosotros | Prototyp3D - Expertos en Impresión 3D',
  description: 'Conoce a Prototyp3D, tu aliado en manufactura aditiva y diseño digital en El Salvador. Apoyamos a estudiantes, emprendedores e industrias.',
};

export default function AboutPage() {
  return (
    <ScrollLayout>
      <main className="pt-24 pb-16 px-6 md:px-12 max-w-6xl mx-auto font-garet">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro mb-6">
              Sobre Prototyp3D
            </h1>
            <p className="text-lg text-gray-700 mb-4">
              Somos un estudio de fabricación digital ubicado en <span className="font-bold text-naranja">Santa Tecla, El Salvador</span>, dedicado a democratizar el acceso a la tecnología de impresión 3D.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              Nacimos con la misión de ayudar a estudiantes y emprendedores a materializar sus ideas sin las barreras de los altos costos de manufactura tradicional. Hoy, servimos a empresas de diversos sectores, desde la medicina hasta la arquitectura.
            </p>
            <p className="text-lg text-gray-700">
              En Prototyp3D, no solo imprimimos piezas; ofrecemos soluciones integrales que incluyen asesoría en diseño, selección de materiales y optimización de producción.
            </p>
          </div>
          <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-xl">
             {/* Placeholder image until a real team/workshop photo is available */}
             <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
               <span className="text-xl">Foto del Taller / Equipo</span>
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 bg-gray-50 p-8 rounded-3xl">
          <div>
            <h2 className="text-2xl font-bold text-azul-oscuro mb-4">Nuestra Misión</h2>
            <p className="text-gray-600">
              Impulsar la innovación en El Salvador proporcionando servicios de fabricación digital accesibles, rápidos y de alta calidad, permitiendo que cualquier idea pueda convertirse en realidad física.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-azul-oscuro mb-4">¿Por qué elegirnos?</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-naranja font-bold">✓</span> Asesoría técnica personalizada
              </li>
              <li className="flex items-center gap-2">
                <span className="text-naranja font-bold">✓</span> Equipos de última generación (Bambu Lab, Elegoo Saturn)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-naranja font-bold">✓</span> Rapidez en entregas urgentes
              </li>
              <li className="flex items-center gap-2">
                <span className="text-naranja font-bold">✓</span> Ubicación céntrica en Santa Tecla
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
