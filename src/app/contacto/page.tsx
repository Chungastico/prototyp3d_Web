import React from 'react';
import { Metadata } from 'next';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

import ContactMap from '@/components/contact/ContactMap';

export const metadata: Metadata = {
  title: 'Contacto | Prototyp3D El Salvador',
  description: 'Contáctanos para tus proyectos de impresión 3D. Ubicados en San Salvador.',
};

export default function ContactPage() {
  return (
    <ScrollLayout>
      <main className="font-garet text-white bg-azul-oscuro">
        <section className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] h-auto flex flex-col lg:justify-center px-6 relative z-10 overflow-hidden pt-20 pb-8">
            
            {/* Background decorators */}
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute bottom-20 right-20 w-80 h-80 bg-naranja rounded-full blur-[100px]" />
                <div className="absolute top-20 left-20 w-60 h-60 bg-azul-claro rounded-full blur-[80px]" />
            </div>

            <div className="max-w-6xl mx-auto w-full lg:h-full flex flex-col lg:flex-row gap-12 items-center relative z-10 px-4">
                
                {/* Left: Contact Info */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center min-h-[calc(100vh-160px)] lg:min-h-0 lg:h-full space-y-8">
                    <header>
                        <span className="text-naranja font-bold tracking-widest uppercase text-md mb-3 block">Estamos para servirte</span>
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">Contáctanos</h1>
                        <p className="text-lg text-gray-300 font-light leading-relaxed max-w-lg">
                            Escríbenos para comenzar tu próximo proyecto.
                        </p>
                    </header>

                    <div className="space-y-6">
                         <div className="flex items-start gap-4">
                            <div className="bg-naranja/10 p-3 rounded-xl text-naranja shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1 text-white">Ubicación</h3>
                                <p className="text-gray-300 leading-relaxed text-base">
                                    Entrada a Auto Mariscos, Pasaje Palomo, Redondel Don Rua, San Salvador.
                                </p>
                            </div>
                        </div>

                         <div className="flex items-start gap-4">
                            <div className="bg-naranja/10 p-3 rounded-xl text-naranja shrink-0">
                                <Phone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1 text-white">WhatsApp / Teléfono</h3>
                                <p className="text-gray-300 mb-1 text-base">+503 7625-3509</p>
                                <Link href="https://wa.me/50376253509" target="_blank" className="text-naranja font-bold hover:underline flex items-center gap-2 text-sm">
                                    Enviar mensaje ahora →
                                </Link>
                            </div>
                        </div>

                         <div className="flex items-start gap-4">
                            <div className="bg-naranja/10 p-3 rounded-xl text-naranja shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1 text-white">Correo Electrónico</h3>
                                <p className="text-gray-300 mb-1 text-base">prototyp3d.sv@gmail.com</p>
                                <Link href="mailto:prototyp3d.sv@gmail.com" className="text-naranja font-bold hover:underline flex items-center gap-2 text-sm">
                                    Enviar correo →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Map */}
                <div className="w-full lg:w-1/2 h-[450px] lg:h-[500px] hover:scale-[1.01] transition-all duration-500">
                     <ContactMap />
                </div>

            </div>
        </section>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
