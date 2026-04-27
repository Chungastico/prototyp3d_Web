import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Gift, 
  CalendarDays, 
  Briefcase,
  Star,
  Sparkles,
  MessageCircle,
  Clock
} from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
    metadataBase: new URL("https://www.prototyp3dsv.com"),
    alternates: {
        canonical: "/regalos-personalizados-3d"
    },
    robots: {
        index: true,
        follow: true
    },
    title: "Regalos Personalizados en Impresión 3D | El Salvador",
    description: "Sorprende con un regalo único y original. Figuras, lámparas, llaveros y decoración personalizados en impresión 3D para cumpleaños, aniversarios y empresas.",
    keywords: [
        "regalos personalizados El Salvador",
        "regalos originales El Salvador",
        "regalos 3D",
        "regalos para novios",
        "regalos de cumpleaños",
        "regalos empresariales"
    ]
};

export default function RegalosPersonalizados() {
  return (
    <ScrollLayout>
      <main className="font-garet text-negro">
        {/* 1. Hero Section (Emocional) */}
        <section className="bg-azul-oscuro text-white min-h-[calc(100vh-80px)] px-6 py-20 md:py-0 overflow-hidden flex items-center relative">
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            {/* Background elements to add some emotional flair */}
             <Heart className="absolute top-20 right-20 w-32 h-32 text-naranja rotate-12" />
             <Gift className="absolute bottom-40 left-20 w-48 h-48 text-white -rotate-12" />
          </div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 w-full z-10">
            <div className="flex-1 space-y-6 md:space-y-8 flex flex-col justify-center text-center md:text-left pt-4 md:pt-0">
              <span className="inline-block py-1 px-4 rounded-full bg-naranja/20 text-naranja border border-naranja/30 text-sm font-bold tracking-widest uppercase mb-2 self-center md:self-start">
                  Sorprende de verdad
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                Regalos <span className="text-naranja">personalizados</span> en impresión 3D
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 max-w-2xl leading-relaxed font-light">
                No regales lo mismo de siempre. Sorprende con un diseño único, creado especialmente para esa persona o momento especial.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4 w-full">
                <Link href="#tipos-regalos" className="w-full sm:w-auto">
                  <button className="w-full bg-naranja text-azul-oscuro font-bold py-4 px-8 rounded-full hover:bg-white transition text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                    Ver opciones de regalos
                  </button>
                </Link>
                <Link href="https://wa.me/50376253509?text=Hola,%20quiero%20hacer%20un%20regalo%20personalizado" target="_blank" className="w-full sm:w-auto">
                    <button className="w-full flex items-center justify-center gap-2 border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-azul-oscuro transition text-lg shadow-lg">
                        <MessageCircle className="w-5 h-5"/> Escribir al WhatsApp
                    </button>
                </Link>
              </div>
            </div>
            
            <div className="flex-1 w-full mt-8 md:mt-0 relative flex justify-center">
               <div className="relative aspect-auto h-[400px] md:h-[500px] w-full max-w-md rounded-full overflow-hidden shadow-[0_0_50px_rgba(255,108,55,0.3)] border-4 border-white/10 group">
                  <Image
                    src="/images/products/regalo-hero.jpg"
                    alt="Lámpara personalizada o figura 3D como regalo"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-azul-oscuro via-transparent to-transparent flex items-end justify-center pb-8">
                      <span className="bg-white text-azul-oscuro px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500"/> Regala Emociones
                      </span>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* 3. Para qué ocasiones (Arriba para conectar rápido con la necesidad) */}
        <section className="py-12 bg-gray-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center font-bold text-gray-500 mb-8 tracking-widest uppercase">El regalo ideal para cada momento</p>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm text-azul-oscuro font-bold border border-gray-100"><CalendarDays className="text-naranja w-5 h-5"/> Cumpleaños</div>
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm text-azul-oscuro font-bold border border-gray-100"><Heart className="text-naranja w-5 h-5"/> San Valentín</div>
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm text-azul-oscuro font-bold border border-gray-100"><Star className="text-naranja w-5 h-5"/> Aniversarios</div>
                    <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm text-azul-oscuro font-bold border border-gray-100"><Briefcase className="text-naranja w-5 h-5"/> Regalos Empresariales</div>
                </div>
            </div>
        </section>

        {/* 2. Tipos de regalos y 4. Personalización */}
        <section id="tipos-regalos" className="py-24 px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16 max-w-3xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro mb-6">
                    ¿Qué podemos crear?
                </h2>
                <p className="text-gray-600 text-lg">
                    Cualquier idea que tengas, podemos diseñarla e imprimirla. La magia del 3D es que no hay límites. Puedes <span className="font-bold">personalizar nombres, colores, agregar logos corporativos</span> o enviar tu propio diseño.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Llaveros (Link a la otra página) */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group">
                    <div className="relative h-56 w-full">
                        <Image src="/images/products/nombres.jpg" alt="Llaveros personalizados" fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-bold text-azul-oscuro mb-3">Llaveros</h3>
                        <p className="text-gray-600 mb-6 flex-1">El detalle perfecto y económico para recordar a alguien todos los días o dar en eventos y fiestas.</p>
                        <Link href="/llaveros-personalizados-el-salvador">
                            <span className="text-naranja font-bold flex items-center gap-1 group-hover:translate-x-2 transition">Ver llaveros &rarr;</span>
                        </Link>
                    </div>
                </div>

                {/* Figuras */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group">
                    <div className="relative h-56 w-full">
                        <Image src="/images/products/pikachu.jpg" alt="Figuras y coleccionables" fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-bold text-azul-oscuro mb-3">Figuras / Personajes</h3>
                        <p className="text-gray-600 mb-6 flex-1">Logos 3D para escritorios, personajes favoritos, soportes para audífonos o controles de consola únicos.</p>
                    </div>
                </div>

                {/* Decoración / Lámparas */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group">
                    <div className="relative h-56 w-full">
                        <Image src="/images/products/regalo-decoracion.jpg" alt="Decoración personalizada" fill className="object-cover group-hover:scale-105 transition duration-500" />
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                        <h3 className="text-2xl font-bold text-azul-oscuro mb-3">Decoración y Hogar</h3>
                        <p className="text-gray-600 mb-6 flex-1">Macetas con formas creativas, organizadores de cables, cuadros en relieve (litofanias) y lámparas personalizadas.</p>
                    </div>
                </div>
            </div>
        </section>


        {/* 5. Ejemplos Reales (Emocionales) */}
        <section className="py-24 px-6 bg-azul-oscuro overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('/images/pattern-dots.png')] bg-repeat" />
            <div className="max-w-7xl mx-auto z-10 relative">
                <div className="flex flex-col md:flex-row gap-12 items-center mb-16">
                    <div className="flex-1">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            Regalos que marcan <span className="text-naranja">la diferencia</span>
                        </h2>
                        <p className="text-gray-300 text-lg">
                            Mira algunas de las sonrisas y momentos especiales que nuestros clientes han creado gracias a la impresión 3D en El Salvador.
                        </p>
                    </div>
                    <div className="flex-shrink-0">
                         <div className="animate-pulse bg-naranja/20 p-4 rounded-full border border-naranja/40">
                             <Sparkles className="w-12 h-12 text-naranja" />
                         </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Ejemplo 1 */}
                    <div className="group rounded-3xl overflow-hidden relative h-96 shadow-2xl">
                        <Image src="/images/products/ejemplo-regalo-pareja.jpg" alt="Regalo para aniversario de pareja" fill className="object-cover group-hover:scale-105 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                            <h3 className="text-3xl font-bold text-white mb-2">Cuadro Iluminado (Litofanía)</h3>
                            <p className="text-gray-300">"Quería algo único para nuestro aniversario. Prototyp3d tomó una foto nuestra y la hizo 3D. Al encender la luz detrás, se ve increíble." - Carlos M.</p>
                        </div>
                    </div>
                    
                    {/* Ejemplo 2 */}
                    <div className="group rounded-3xl overflow-hidden relative h-96 shadow-2xl mt-8 md:mt-16">
                        <Image src="/images/products/ejemplo-regalo-corporativo.jpg" alt="Regalos corporativos fin de año" fill className="object-cover group-hover:scale-105 transition duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8">
                            <h3 className="text-3xl font-bold text-white mb-2">Trofeos Empleado del Mes</h3>
                            <p className="text-gray-300">"Dejamos de dar las mismas placas de acrílico. Ahora damos el logo de nuestra empresa en 3D dorado con el nombre impreso. Al equipo le encanta." - Agencia Tech</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>


        {/* 6. CTA Final (Doble Acción) */}
        <section className="bg-naranja py-24 px-6 text-azul-oscuro relative overflow-hidden">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <Gift className="w-20 h-20 mx-auto text-white/50 mb-6" />
                <h2 className="text-4xl md:text-6xl font-black mb-6">
                    Crea tu regalo personalizado hoy
                </h2>
                <p className="text-xl md:text-2xl font-medium mb-12 text-azul-oscuro/80">
                    Cuéntanos tu idea, elegimos colores y lo imprimimos. Es rápido y el resultado es permanente.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link href="https://wa.me/50376253509?text=Hola,%20quiero%20hacer%20un%20regalo%20personalizado">
                        <button className="w-full bg-[#25D366] text-white font-bold py-5 px-10 rounded-full hover:bg-[#128C7E] transition text-xl shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3">
                            <MessageCircle className="w-6 h-6" /> Consultar Idea
                        </button>
                    </Link>
                    <div className="flex items-center justify-center gap-2 text-azul-oscuro/60 font-medium">
                        <Clock className="w-5 h-5"/> Respuestas rápidas
                    </div>
                </div>
            </div>
        </section>

      </main>
      <Footer />
    </ScrollLayout>
  );
}
