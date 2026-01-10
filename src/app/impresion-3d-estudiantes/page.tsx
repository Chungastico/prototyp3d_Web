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
      <main className="font-garet text-negro pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-16">
              <span className="text-naranja font-bold tracking-widest uppercase text-sm mb-2 block">Ideal para Tesis y Proyectos</span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-azul-oscuro mb-6">
                  Impresión 3D para Estudiantes
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Sabemos que el tiempo y el presupuesto son clave en la universidad. Te ayudamos a entregar tu proyecto a tiempo con acabados profesionales.
              </p>
          </header>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                  <BookOpen className="text-azul-oscuro w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Maquetas de Arquitectura</h3>
                  <p className="text-gray-600">
                      Imprimimos topografías complejas, fachadas detalladas y mobiliario a escala. Ahorra horas de corte manual.
                  </p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                  <Lightbulb className="text-naranja w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Prototipos de Ingeniería</h3>
                  <p className="text-gray-600">
                      Engranajes, carcasas para Arduino/Raspberry Pi, mecanismos funcionales. Materiales resistentes como PETG o ABS.
                  </p>
              </div>
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                  <Users className="text-blue-500 w-10 h-10 mb-4" />
                  <h3 className="text-xl font-bold mb-3">Descuentos Grupales</h3>
                  <p className="text-gray-600">
                      ¿Toda la clase necesita imprimir? Contáctanos para precios especiales por volumen de piezas.
                  </p>
              </div>
          </div>

          <section className="bg-blue-50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                  <h2 className="text-3xl font-bold text-azul-oscuro mb-4">¿Tienes una entrega urgente?</h2>
                  <p className="text-lg text-gray-700 mb-2">
                      Entendemos las "noches de entrega". Envíanos tu archivo hoy mismo para evaluar tiempos.
                  </p>
                  <p className="text-sm text-gray-500">
                      *Sujeto a disponibilidad de máquinas.
                  </p>
              </div>
              <Link href="/contacto">
                  <button className="bg-naranja text-azul-oscuro font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition shadow-lg">
                      Enviar archivo ahora
                  </button>
              </Link>
          </section>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
