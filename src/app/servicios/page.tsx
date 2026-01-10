import { Metadata } from 'next';
import Link from 'next/link';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Servicios de Impresión 3D y Diseño | Prototyp3D El Salvador',
  description: 'Ofrecemos impresión 3D FDM y Resina, diseño CAD y modelado 3D en Santa Tecla y San Salvador. Calidad profesional para estudiantes y empresas.',
};

export default function ServicesPage() {
  return (
    <ScrollLayout>
      <main className="pt-24 pb-16 px-6 md:px-12 max-w-7xl mx-auto font-garet">
        <h1 className="text-4xl md:text-5xl font-extrabold text-azul-oscuro mb-6">
          Servicios de Impresión 3D y Diseño en El Salvador
        </h1>
        <p className="text-xl text-gray-700 mb-12 max-w-3xl">
          Transformamos tus ideas en objetos tangibles con tecnología de punta. Desde prototipos rápidos hasta piezas finales de alta precisión.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Impresión FDM */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <h2 className="text-2xl font-bold text-naranja mb-4">Impresión 3D FDM</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              Ideal para prototipado rápido, maquetas arquitectónicas y piezas funcionales mecánicas. Utilizamos materiales como PLA, PETG y TPU.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6 space-y-2">
              <li>Económico y resistente</li>
              <li>Gran variedad de colores</li>
              <li>Piezas de gran formato</li>
            </ul>
             <Link href="/impresion-3d-el-salvador" className="mt-auto text-azul-oscuro font-bold hover:text-naranja underline">
              Más información &rarr;
            </Link>
          </div>

          {/* Impresión Resina (SLA) */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <h2 className="text-2xl font-bold text-naranja mb-4">Impresión en Resina 8K</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              Máxima resolución para joyería, miniaturas de rol, odontología y piezas que requieren un detalle superficial impecable.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6 space-y-2">
              <li>Acabado superficial liso</li>
              <li>Alta precisión dimensional</li>
              <li>Materiales técnicos y dentales</li>
            </ul>
             <Link href="/contacto" className="mt-auto text-azul-oscuro font-bold hover:text-naranja underline">
              Cotizar Resina &rarr;
            </Link>
          </div>

          {/* Diseño 3D */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow flex flex-col">
            <h2 className="text-2xl font-bold text-naranja mb-4">Diseño y Modelado 3D</h2>
            <p className="text-gray-600 mb-6 flex-grow">
              ¿No tienes el archivo? Nosotros lo creamos. Desde ingeniería inversa hasta modelado artístico para impresión.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6 space-y-2">
              <li>Diseño CAD paramétrico</li>
              <li>Esculpido digital</li>
              <li>Optimización para impresión</li>
            </ul>
             <Link href="/contacto" className="mt-auto text-azul-oscuro font-bold hover:text-naranja underline">
              Solicitar Diseño &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-azul-oscuro mb-4">¿Listo para iniciar tu proyecto?</h3>
          <Link href="/contacto">
            <button className="bg-naranja text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition">
              Cotizar ahora
            </button>
          </Link>
        </div>
      </main>
      <Footer />
    </ScrollLayout>
  );
}
