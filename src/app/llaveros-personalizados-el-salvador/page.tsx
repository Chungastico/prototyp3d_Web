import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MessageCircle, 
  Send, 
  MonitorSmartphone, 
  Printer, 
  PackageCheck,
  CheckCircle,
  Star
} from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    metadataBase: new URL("https://www.prototyp3dsv.com"),
    alternates: {
        canonical: "/llaveros-personalizados-el-salvador"
    },
    robots: {
        index: true,
        follow: true
    },
    title: "Llaveros Personalizados en El Salvador | Diseños únicos en 3D",
    description: "Crea tu llavero personalizado con nombre, logo o diseño especial en El Salvador. Producción rápida mediante impresión 3D y diseño totalmente único.",
    keywords: [
        "llaveros personalizados El Salvador",
        "llaveros 3D El Salvador",
        "llaveros con nombre",
        "regalos corporativos El Salvador",
        "impresión 3D de llaveros"
    ]
};

export default function LlaverosPersonalizados() {
  return (
    <ScrollLayout>
      <main className="font-garet text-negro">
        {/* 1. Hero Section */}
        <section className="bg-azul-oscuro text-white min-h-[calc(100vh-80px)] px-6 py-12 md:py-0 overflow-hidden flex items-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 w-full">
            <div className="flex-1 space-y-6 md:space-y-8 flex flex-col justify-center text-center md:text-left z-10 w-full pt-4 md:pt-0">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Llaveros <span className="text-naranja">personalizados</span> en El Salvador
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 max-w-2xl leading-relaxed">
                Crea tu llavero con nombre, logo o diseño especial. Producción rápida y totalmente personalizado en impresión 3D.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 w-full">
                <Link href="https://wa.me/50376253509?text=Hola,%20quisiera%20cotizar%20un%20llavero%20personalizado" target="_blank" rel="noopener noreferrer">
                  <button className="flex items-center gap-2 bg-[#25D366] text-white font-bold py-4 px-8 rounded-full hover:bg-[#128C7E] transition text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    <MessageCircle className="w-6 h-6" />
                    Cotizar ahora por WhatsApp
                  </button>
                </Link>
              </div>
            </div>
            {/* Hero Images Grid */}
            <div className="flex-1 w-full grid grid-cols-2 gap-4 mt-8 md:mt-0">
               <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                  <Image src="/images/products/Albania.png" alt="Llavero con Nombre personalizado en 3D" fill className="object-cover group-hover:scale-110 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <span className="text-white font-bold">Nombres 3D</span>
                  </div>
               </div>
               <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10 group mt-8">
                  <Image src="/images/products/Llavero.jpg" alt="Llavero con Logo para Empresas" fill className="object-cover group-hover:scale-110 transition duration-500" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <span className="text-white font-bold">Logos de Empresa</span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 2. Tipos de llaveros (Intención Comercial) */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-azul-oscuro mb-12 text-center">
                El llavero perfecto para cada <span className="text-naranja">ocasión</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { title: 'Llaveros con Nombre', desc: 'Tu nombre en letras 3D del color que prefieras.', img: '/images/products/nombres.jpg' },
                    { title: 'Para Parejas', desc: 'Mitades que se unen, iniciales compartidas o fechas especiales.', img: '/images/products/polaroid.webp' },
                    { title: 'Para Empresas', desc: 'Logos a todo color para regalar a clientes o colaboradores.', img: '/images/products/zapato.webp' },
                    { title: 'Diseños Especiales', desc: 'Personajes, siluetas de autos o formas únicas.', img: '/images/products/pikachu.jpg' }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl transition duration-300 group">
                        <div className="relative h-48 w-full overflow-hidden">
                            <Image src={item.img} alt={item.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-azul-oscuro mb-2">{item.title}</h3>
                            <p className="text-gray-600">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 3. Precios y Cómo funciona juntos en Grid */}
        <section className="py-20 bg-gray-50 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
                
                {/* Cómo funciona */}
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-azul-oscuro mb-8">¿Cómo es el proceso?</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-naranja/10 p-3 rounded-xl"><Send className="text-naranja w-6 h-6" /></div>
                            <div>
                                <h4 className="font-bold text-lg text-azul-oscuro">1. Envíanos tu idea</h4>
                                <p className="text-gray-600 text-sm">Contáctanos y cuéntanos qué diseño tienes en mente.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-naranja/10 p-3 rounded-xl"><MonitorSmartphone className="text-naranja w-6 h-6" /></div>
                            <div>
                                <h4 className="font-bold text-lg text-azul-oscuro">2. Propuesta digital</h4>
                                <p className="text-gray-600 text-sm">Te enviamos cómo se verá en 3D antes de imprimir.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-naranja/10 p-3 rounded-xl"><Printer className="text-naranja w-6 h-6" /></div>
                            <div>
                                <h4 className="font-bold text-lg text-azul-oscuro">3. Producción 3D</h4>
                                <p className="text-gray-600 text-sm">Fabricamos el llavero con materiales de alta calidad.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <div className="bg-naranja/10 p-3 rounded-xl"><PackageCheck className="text-naranja w-6 h-6" /></div>
                            <div>
                                <h4 className="font-bold text-lg text-azul-oscuro">4. Entrega</h4>
                                <p className="text-gray-600 text-sm">Recibe o te enviamos el producto final.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing / CTA Corto */}
                <div className="flex flex-col justify-center bg-azul-oscuro text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Star className="w-32 h-32" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 z-10">Precios accesibles</h3>
                    <p className="text-xl mb-6 text-gray-300 z-10">
                        Nuestros llaveros están disponibles <span className="font-bold text-naranja">desde $0.70</span>, variando únicamente según el nivel de detalle, colores y tamaño del diseño.
                    </p>
                    <ul className="space-y-3 mb-8 z-10">
                        <li className="flex items-center gap-2"><CheckCircle className="text-naranja w-5 h-5"/> Cotización gratis</li>
                        <li className="flex items-center gap-2"><CheckCircle className="text-naranja w-5 h-5"/> Descuentos por volumen</li>
                        <li className="flex items-center gap-2"><CheckCircle className="text-naranja w-5 h-5"/> Excelente calidad visual</li>
                    </ul>
                    <Link href="https://wa.me/50376253509?text=Hola,%20quisiera%20cotizar%20un%20llavero%20personalizado" target="_blank" className="z-10 w-full sm:w-auto">
                        <button className="w-full bg-naranja text-azul-oscuro font-bold py-4 px-8 rounded-full hover:bg-white transition text-lg shadow-lg">
                            Consultar mi diseño
                        </button>
                    </Link>
                </div>

            </div>
        </section>

        {/* 7. CTA Final */}
        <section className="bg-naranja py-20 px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <h2 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro">
                    ¿Listo para tener el tuyo?
                </h2>
                <p className="text-xl md:text-2xl text-azul-oscuro/80">
                    Cotiza tu llavero personalizado hoy mismo y destaca con un accesorio único hecho a tu medida.
                </p>
                <Link href="https://wa.me/50376253509?text=Hola,%20quisiera%20cotizar%20un%20llavero%20personalizado" target="_blank">
                    <button className="mt-8 bg-azul-oscuro text-white font-bold py-4 px-10 rounded-full hover:bg-white hover:text-azul-oscuro transition text-xl shadow-2xl transform hover:-translate-y-1">
                        Cotizar mi llavero
                    </button>
                </Link>
            </div>
        </section>

      </main>
      <Footer />
    </ScrollLayout>
  );
}
