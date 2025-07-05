import '../styles/globals.css';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext'; // ✅ importa tu proveedor
import '@react-three/fiber';

export const metadata = {
    title: 'Prototyp3D',
    description: 'Impulsamos tus ideas con impresión 3D',
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head />
            <body className="font-sans bg-beige-claro text-negro">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}
