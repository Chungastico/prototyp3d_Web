import { Metadata } from 'next';
import Link from 'next/link';
import { Factory, ShieldCheck, TrendingUp } from 'lucide-react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Impresión 3D para Empresas | Prototipado y Manufactura El Salvador',
  description: 'Soluciones de impresión 3D B2B en El Salvador. Prototipado rápido, lotes cortos de producción y repuestos industriales. Facturación y confidencialidad.',
  keywords: ['prototipado 3D El Salvador', 'impresión 3D industrial', 'manufactura aditiva empresas', 'lotes cortos'],
};

export default function EmpresasPage() {
  return (
    <ScrollLayout>
      <main className="font-garet text-negro pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
           <header className="mb-16 border-b border-gray-200 pb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro mb-6 max-w-4xl">
                  Soluciones de Manufactura Aditiva para <span className="text-naranja">Empresas en El Salvador</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                  Acelere su ciclo de innovación. Reduzca costos de desarrollo y lance productos al mercado más rápido con nuestro servicio de prototipado profesional.
              </p>
          </header>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 mb-20">
              <div>
                  <h2 className="text-3xl font-bold text-azul-oscuro mb-6">¿Por qué integrar impresión 3D?</h2>
                   <ul className="space-y-6">
                      <li className="flex gap-4">
                          <div className="bg-naranja/10 p-3 h-fit rounded-lg text-naranja">
                              <TrendingUp size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-xl mb-1">Validación Rápida (Time-to-Market)</h3>
                              <p className="text-gray-600">
                                  Pase del diseño CAD a una pieza física funcional en horas, no semanas. Detecte errores de diseño antes de invertir en moldes costosos.
                              </p>
                          </div>
                      </li>
                      <li className="flex gap-4">
                          <div className="bg-naranja/10 p-3 h-fit rounded-lg text-naranja">
                               <Factory size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-xl mb-1">Producción de Lotes Cortos</h3>
                              <p className="text-gray-600">
                                  Fabricamos series de 10 a 500 unidades para test de mercado o productos de nicho, sin mínimos de producción masiva.
                              </p>
                          </div>
                      </li>
                      <li className="flex gap-4">
                           <div className="bg-naranja/10 p-3 h-fit rounded-lg text-naranja">
                               <ShieldCheck size={24} />
                          </div>
                          <div>
                              <h3 className="font-bold text-xl mb-1">Confidencialidad y Soporte</h3>
                              <p className="text-gray-600">
                                  Tratamos su propiedad intelectual con estricta confidencialidad. Emitimos Facturas de Crédito Fiscal.
                              </p>
                          </div>
                      </li>
                  </ul>
              </div>
              <div className="bg-gray-900 text-white p-8 md:p-12 rounded-3xl flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-4">Solicite una consultoría técnica</h3>
                  <p className="text-gray-300 mb-8">
                      Nuestros ingenieros pueden asesorarle sobre materiales (PLA, PETG, ABS, Resina) y optimización de diseño para manufactura.
                  </p>
                  <div className="space-y-4">
                       <Link href="/contacto" className="block w-full">
                          <button className="w-full bg-naranja text-azul-oscuro font-bold py-4 rounded-lg hover:bg-white transition text-lg">
                              Contactar Asesor
                          </button>
                      </Link>
                      <p className="text-sm text-center text-gray-500">
                          Respuesta en menos de 24 horas hábiles.
                      </p>
                  </div>
              </div>
          </div>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
