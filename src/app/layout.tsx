
import '../styles/globals.css'
import { ReactNode } from 'react'

export const metadata = {
    title: 'Prototyp3D',
    description: 'Impulsamos tus ideas con impresión 3D',
}

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="es">
        <head>
            <link
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap"
            rel="stylesheet"
            />
        </head>
        <body className="font-sans bg-beige-claro text-negro">{children}</body>
        </html>
    )
}
