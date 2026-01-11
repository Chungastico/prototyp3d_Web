import HomeClient from '@/components/home/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Impresión 3D en El Salvador | Prototyp3D',
  description: 'Servicio profesional de impresión 3D en El Salvador. Creamos prototipos, maquetas y piezas finales. Cobertura en todo el país.',
  keywords: ['impresión 3D El Salvador', 'prototipado 3D', 'impresoras 3D', 'El Salvador', 'modelado 3D', 'maquetas'],
  openGraph: {
    title: 'Impresión 3D en El Salvador – Prototyp3D',
    description: 'Materializamos tus ideas con impresión 3D, diseño y fabricación digital en El Salvador.',
    url: 'https://www.prototyp3dsv.com',
    siteName: 'Prototyp3D',
    images: [
      {
        url: '/images/HeroBambu.png', // We will verify this path later or update it
        width: 1200,
        height: 630,
        alt: 'Impresora 3D Bambu Lab en Prototyp3D El Salvador',
      },
    ],
    locale: 'es_SV',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prototyp3D | Impresión 3D Experta en El Salvador',
    description: 'Servicios de impresión 3D y diseño para estudiantes y empresas. Atendemos todo El Salvador.',
    images: ['/images/HeroBambu.png'],
  },
  alternates: {
    canonical: 'https://www.prototyp3dsv.com',
  },
};

export default function Home() {
    return <HomeClient />;
}
