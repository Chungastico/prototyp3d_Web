import { Metadata } from 'next';
import { Mail, Phone, MapPin } from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Contacto | Prototyp3D - Impresión 3D Santa Tecla',
  description: 'Contáctanos para cotizar tu impresión 3D. Estamos ubicados en Santa Tecla, La Libertad. WhatsApp: +503 7093-3901.',
};

export default function ContactPage() {
  return (
    <ScrollLayout>
      <main className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto font-garet">
        <h1 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro mb-4 text-center">
          Contáctanos
        </h1>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          ¿Tienes un proyecto en mente? Escríbenos o visítanos en nuestro taller en Santa Tecla.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Información de Contacto */}
          <div className="space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="bg-naranja/10 p-3 rounded-full text-naranja">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-azul-oscuro">WhatsApp y Teléfono</h3>
                <p className="text-gray-600 mb-1">Atención rápida para cotizaciones.</p>
                <a href="https://wa.me/50370933901" target="_blank" className="text-xl font-bold text-naranja hover:underline">
                  +503 7093-3901
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="bg-naranja/10 p-3 rounded-full text-naranja">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-azul-oscuro">Correo Electrónico</h3>
                <p className="text-gray-600 mb-1">Envía tus archivos STL, OBJ o STEP.</p>
                <a href="mailto:prototyp3d.sv@gmail.com" className="text-lg font-medium text-azul-oscuro hover:text-naranja transition">
                  prototyp3d.sv@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
               <div className="bg-naranja/10 p-3 rounded-full text-naranja">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-azul-oscuro">Ubicación</h3>
                <p className="text-gray-600">
                  Santa Tecla, La Libertad, El Salvador.<br />
                  <span className="text-sm text-gray-500">(Atención con cita previa)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Mapa Embebido */}
          <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15505.656972664986!2d-89.2942485!3d13.6732386!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f6331a90c1f4e7d%3A0x133ec3603407e324!2sSanta%20Tecla!5e0!3m2!1ses-419!2ssv!4v1700000000000!5m2!1ses-419!2ssv" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa de Ubicación Prototyp3D Santa Tecla"
            ></iframe>
          </div>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
