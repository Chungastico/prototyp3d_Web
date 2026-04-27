import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import HeroVideo from '@/components/ui/HeroVideo';
import {
  Wrench,
  ShieldCheck,
  AlertTriangle,
  MessageCircle
} from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    metadataBase: new URL("https://www.prototyp3dsv.com"),
    alternates: {
        canonical: "/piezas-automotrices-3d"
    },
    robots: {
        index: true,
        follow: true
    },
    title: "Piezas Automotrices en Impresión 3D El Salvador",
    description: "Fabricamos piezas automotrices funcionales, resueltas y personalizadas, como reposiciones de repuestos descontinuados o accesorios de vehículos.",
    keywords: [
        "piezas automotrices impresión 3D",
        "repuestos plásticos El Salvador",
        "creación piezas vehículos 3D",
        "impresión 3D automotriz",
        "repuestos descontinuados El Salvador"
    ]
};

export default function PiezasAutomotrices() {
  return (
    <ScrollLayout>
      <main className="font-garet text-negro">
        {/* 1. Hero Section */}
        <section className="bg-azul-oscuro text-white min-h-[calc(100vh-80px)] px-6 py-16 md:py-0 overflow-hidden flex items-center relative">
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('/images/pattern-car.png')] bg-repeat" />
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 w-full z-10 p-4">
            <div className="flex-1 space-y-6 md:space-y-8 flex flex-col justify-center text-center md:text-left pt-4 md:pt-0">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Piezas <span className="text-naranja">automotrices</span> en impresión 3D en El Salvador
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                Fabricamos piezas funcionales y personalizadas para vehículos de manera rápida y precisa.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 w-full">
                <Link href="/contacto" className="w-full sm:w-auto">
                  <button className="w-full bg-naranja text-azul-oscuro font-bold py-4 px-8 rounded-full hover:bg-white transition text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Consultar mi pieza
                  </button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full order-first md:order-last mt-8 md:mt-0">
               <div className="relative aspect-video md:aspect-square w-full rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  <HeroVideo 
                    src="/images/products/rejilla.mp4" 
                    poster="/images/pieza-auto-hero.jpg"
                    className="object-cover" 
                  />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-full font-semibold border border-white/20 text-sm z-10">
                      Rejilla A/C fabricada en ABS
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 3. Problemas que solucionas */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col justify-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold text-azul-oscuro mb-8">
                    Resolvemos tus problemas
                </h2>
                <ul className="space-y-6">
                    <li className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <AlertTriangle className="text-naranja w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-azul-oscuro">Piezas difíciles de encontrar</h4>
                            <p className="text-gray-600 mt-1">Importar algunas piezas toma meses y cuesta mucho dinero. Nosotros las fabricamos localmente en días.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <Wrench className="text-naranja w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-azul-oscuro">Repuestos descontinuados</h4>
                            <p className="text-gray-600 mt-1">Ideal para vehículos clásicos o modelos menos comunes donde el repuesto plástico original ya no se fabrica.</p>
                        </div>
                    </li>
                    <li className="flex gap-4">
                        <div className="flex-shrink-0 mt-1">
                            <ShieldCheck className="text-naranja w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-azul-oscuro">Personalización exacta</h4>
                            <p className="text-gray-600 mt-1">Modificamos consolas centrales, bases de medidores o monturas de pantallas según tu estilo.</p>
                        </div>
                    </li>
                </ul>
            </div>
        </section>

        {/* 4. Materiales y 5. Proceso */}
        <section className="py-20 bg-azul-oscuro text-white px-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Materiales <span className="text-naranja">resistentes</span> al calor</h2>
                    <p className="text-gray-300 text-lg">
                        El interior de un vehículo salvadoreño puede superar los 60°C bajo el sol. Usamos plástico apto para automoción.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6 mt-8">
                        <div className="bg-white/10 p-6 rounded-2xl flex-1 backdrop-blur-sm border border-white/10">
                            <h3 className="font-bold text-2xl text-naranja mb-2">ABS</h3>
                            <p className="text-sm text-gray-300">Excelente resistencia al impacto y altas temperaturas. Ideal para piezas mecánicas o en contacto directo con sol.</p>
                        </div>
                        <div className="bg-white/10 p-6 rounded-2xl flex-1 backdrop-blur-sm border border-white/10">
                            <h3 className="font-bold text-2xl text-naranja mb-2">PETG</h3>
                            <p className="text-sm text-gray-300">Buen equilibrio entre fuerza y flexibilidad. Alta resistencia térmica superior al PLA.</p>
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center">Nuestro Proceso</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative">
                        <span className="text-naranja font-black text-6xl absolute top-4 left-4 opacity-20">1</span>
                        <h4 className="font-bold text-xl mt-4 mb-2 relative z-10">Escaneo y medidas</h4>
                        <p className="text-sm text-gray-400 relative z-10">Revisamos la pieza rota o el espacio exacto del auto.</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative">
                        <span className="text-naranja font-black text-6xl absolute top-4 left-4 opacity-20">2</span>
                        <h4 className="font-bold text-xl mt-4 mb-2 relative z-10">Diseño CAD</h4>
                        <p className="text-sm text-gray-400 relative z-10">Modelamos la pieza exacta en software 3D industrial.</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative">
                        <span className="text-naranja font-black text-6xl absolute top-4 left-4 opacity-20">3</span>
                        <h4 className="font-bold text-xl mt-4 mb-2 relative z-10">Fabricación</h4>
                        <p className="text-sm text-gray-400 relative z-10">Impresión en material ABS o PETG de alta densidad.</p>
                    </div>
                    <div className="bg-white/5 p-8 rounded-3xl border border-white/10 relative">
                        <span className="text-naranja font-black text-6xl absolute top-4 left-4 opacity-20">4</span>
                        <h4 className="font-bold text-xl mt-4 mb-2 relative z-10">Pruebas</h4>
                        <p className="text-sm text-gray-400 relative z-10">Instalamos o probamos la encajadura real de la pieza.</p>
                    </div>
                </div>
            </div>
        </section>

        {/* 6. Casos Reales (MUY IMPORTANTE) */}
        <section className="py-20 px-6 max-w-7xl mx-auto bg-gray-50 rounded-3xl my-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-azul-oscuro mb-12 text-center">
                Soluciones Implementadas
            </h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg group">
                    <div className="relative h-72 w-full overflow-hidden">
                        <Image src="/images/products/vespa.jpeg" alt="Rejilla de ventilación Cessna" fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-azul-oscuro mb-3 group-hover:text-naranja transition">
                            Rejilla de ventilación Cessna
                        </h3>
                        <p className="text-gray-600">
                            Pieza plástica original de ventilación descontinuada, reconstruida idénticamente usando impresión 3D resistente al calor extremo.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl overflow-hidden shadow-lg group">
                    <div className="relative h-72 w-full overflow-hidden">
                        <Image src="/images/products/aveo.png" alt="Manecilla de puerta Chevrolet Aveo 2008" fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-azul-oscuro mb-3 group-hover:text-naranja transition">
                            Manecilla de puerta Aveo 2008
                        </h3>
                        <p className="text-gray-600">
                            Reposición de manecilla interna para Chevrolet Aveo, fabricada en material de alta resistencia técnica para soportar el uso diario y el calor del vehículo.
                        </p>
                    </div>
                </div>

            </div>
        </section>

        {/* 7. CTA Final */}
        <section className="bg-naranja py-20 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro">
                    No pierdas tiempo buscando. Lo fabricamos.
                </h2>
                <p className="text-xl md:text-2xl text-azul-oscuro/80 font-medium">
                    Envíanos una foto de la pieza rota o las medidas y te daremos una cotización rápida.
                </p>
                <div className="flex gap-4 justify-center mt-8">
                    <Link href="https://wa.me/50376253509?text=Hola,%20quisiera%20cotizar%20la%20fabricacion%20de%20una%20pieza%20automotriz" target="_blank">
                        <button className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 px-8 rounded-full hover:bg-[#128C7E] transition text-xl shadow-2xl transform hover:-translate-y-1">
                            <MessageCircle className="w-6 h-6" /> WhatsApp
                        </button>
                    </Link>
                    <Link href="/contacto">
                        <button className="bg-azul-oscuro text-white font-bold py-4 px-10 rounded-full hover:bg-white hover:text-azul-oscuro transition text-xl shadow-2xl transform hover:-translate-y-1">
                            Solicita tu pieza
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
