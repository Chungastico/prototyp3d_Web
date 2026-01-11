import '../styles/globals.css';
import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';
import StructuredData from '@/components/seo/StructuredData';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import '@react-three/fiber';

export const metadata: Metadata = {
    title: {
        template: '%s | Prototyp3D',
        default: 'Prototyp3D | Impresión 3D en El Salvador'
    },
    description: 'Impulsamos tus ideas con impresión 3D. Servicios de impresión FDM en El Salvador.',
    metadataBase: new URL('https://www.prototyp3dsv.com'),
    openGraph: {
        type: 'website',
        locale: 'es_SV',
        siteName: 'Prototyp3D',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="es" suppressHydrationWarning>
                <head>
                    <StructuredData />
                </head>
                <body className="font-sans bg-beige-claro text-negro">
                    {children}
                    <SpeedInsights />
                    <Analytics />
                </body>
            </html>
        </ClerkProvider>
    );
}
