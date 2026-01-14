import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, MapPin } from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    metadataBase: new URL("https://www.prototyp3dsv.com"),
    alternates: {
        canonical: "/impresion-3d-el-salvador"
    },
    robots: {
        index: true,
        follow: true
    },
    title: "Impresión 3D en El Salvador - Prototyp3D | Servicio Profesional",
    description: "Prototyp3D es tu estudio de impresión 3D en El Salvador. Ofrecemos manufactura aditiva FDM, diseño 3D y prototipado rápido en El Salvador.",
    keywords: [
        "impresión 3D El Salvador",
        "impresoras 3D El Salvador",
        "servicio impresión 3D",
        "maquetas 3D El Salvador",
        "prototipado rápido"
    ]
};


export default function Impresion3DElSalvador() {
  return (
    <ScrollLayout>
      <main className="font-garet text-negro">
        {/* Hero Section Específico */}
        <section className="bg-azul-oscuro text-white h-[calc(100vh-80px)] px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 h-full">
            <div className="flex-1 space-y-8 flex flex-col justify-center">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Impresión 3D en <span className="text-naranja">El Salvador</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
                Tu aliado local para fabricar lo imposible. Servicio para todo el país, convertimos archivos digitales en objetos físicos de alta calidad.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/contacto">
                  <button className="bg-naranja text-azul-oscuro font-bold py-4 px-8 rounded-full hover:bg-white hover:text-naranja transition text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Cotizar mi pieza
                  </button>
                </Link>
                <Link href="/servicios">
                  <button className="border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-azul-oscuro transition text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Ver servicios
                  </button>
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full flex items-center justify-center h-full max-h-[600px]">
               <div className="relative w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <Image
                    src="/images/printing.jpg"
                    alt="Prototipo P2S Impresión 3D"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
               </div>
            </div>
          </div>
        </section>

        {/* Qué es y Para Quién */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-azul-oscuro mb-6">¿Qué es el servicio de impresión 3D?</h2>
                  <div className="space-y-4 text-lg text-gray-700">
                      <p>
                          Es un proceso de manufactura aditiva donde creamos objetos tridimensionales capa por capa a partir de un archivo digital. A diferencia de los métodos tradicionales, la impresión 3D permite crear geometrías complejas sin necesidad de moldes costosos.
                      </p>
                      <p>
                          En <span className="font-bold">Prototyp3D El Salvador</span>, utilizamos tecnologías FDM (filamento fundido) para piezas resistentes.
                      </p>
                  </div>
              </div>
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                  <h3 className="text-xl font-bold text-azul-oscuro mb-6">Ideal para:</h3>
                  <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                          <CheckCircle className="text-naranja mt-1" />
                          <div>
                              <span className="font-bold block text-lg">Estudiantes y Arquitectos</span>
                              <span className="text-gray-600">Maquetas detalladas, topografías y proyectos de graduación.</span>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <CheckCircle className="text-naranja mt-1" />
                          <div>
                              <span className="font-bold block text-lg">Emprendedores</span>
                              <span className="text-gray-600">Prototipado rápido de productos para validar en el mercado salvadoreño.</span>
                          </div>
                      </li>
                      <li className="flex items-start gap-3">
                          <CheckCircle className="text-naranja mt-1" />
                          <div>
                              <span className="font-bold block text-lg">Industria y Repuestos</span>
                              <span className="text-gray-600">Fabricación de piezas plásticas descontinuadas o herramentales a medida.</span>
                          </div>
                      </li>
                  </ul>
              </div>
          </div>
        </section>

        {/* CTA Local */}
        <section className="bg-naranja/10 py-16 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
              <MapPin className="w-12 h-12 text-naranja mx-auto" />
              <h2 className="text-3xl md:text-4xl font-bold text-azul-oscuro">Servicio en Todo El Salvador</h2>
              <p className="text-xl text-gray-700">
                  Ofrecemos envíos a todo el país a través de servicios de paquetería local, asegurando que tus piezas lleguen seguras a San Salvador, Soyapango, Santa Ana o San Miguel.
              </p>
               <Link href="/contacto">
                  <button className="mt-4 text-azul-oscuro font-bold underline text-lg hover:text-naranja transition">
                    Ver ubicación y horarios &rarr;
                  </button>
              </Link>
          </div>
        </section>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
