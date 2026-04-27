import HomeClient from '@/components/home/HomeClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prototyp3D | Impresión 3D Profesional en El Salvador',
  description: 'Cotiza tu impresión 3D en El Salvador y recibe en 48h. Especialistas en repuestos industriales, prototipos y diseños personalizados desde $0.70. Cobertura nacional.',
  keywords: ['impresión 3D El Salvador', 'repuestos plásticos', 'prototipado rápido', 'impresoras 3D SV', 'modelado 3D', 'maquetas'],
  openGraph: {
    title: 'Impresión 3D Profesional en El Salvador – Prototyp3D',
    description: 'Materializamos tus repuestos y prototipos con impresión 3D industrial en El Salvador. Entrega rápida y confiable.',
    url: 'https://www.prototyp3dsv.com',
    siteName: 'Prototyp3D',
    images: [
      {
        url: '/images/HeroBambu.png',
        width: 1200,
        height: 630,
        alt: 'Servicio de Impresión 3D Profesional en El Salvador - Prototyp3D',
      },
    ],
    locale: 'es_SV',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prototyp3D | Soluciones de Impresión 3D en El Salvador',
    description: 'Expertos en repuestos funcionales y prototipado rápido para empresas y particulares. Cotización inmediata.',
    images: ['/images/HeroBambu.png'],
  },
  alternates: {
    canonical: 'https://www.prototyp3dsv.com',
  },
};

export default function Home() {
    return <HomeClient />;
}
