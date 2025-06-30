'use client';

import Link from 'next/link';
import { Instagram, Mail, Phone, Globe } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-blue-950 text-white px-6 md:px-12 py-8 text-sm">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Instagram */}
            <div className="flex items-start gap-3">
            <Instagram size={18} className="mt-1 text-pink-400" />
            <div>
                <p className="text-gray-400">Instagram</p>
                <p className="font-medium">@prototyp3d.sv</p>
            </div>
            </div>

            {/* Correo */}
            <div className="flex items-start gap-3">
            <Mail size={18} className="mt-1 text-blue-400" />
            <div>
                <p className="text-gray-400">Email</p>
                <p className="font-medium">prototyp3d.sv@gmail.com</p>
            </div>
            </div>

            {/* WhatsApp */}
            <div className="flex items-start gap-3">
            <Phone size={18} className="mt-1 text-green-400" />
            <div>
                <p className="text-gray-400">WhatsApp</p>
                <p className="font-medium">+503 7093-3901</p>
            </div>
            </div>

            {/* Sitio web */}
            <div className="flex items-start gap-3">
            <Globe size={18} className="mt-1 text-yellow-400" />
            <div>
                <p className="text-gray-400">Sitio web</p>
                <Link
                href="https://prototyp3d.web.app/"
                target="_blank"
                className="font-medium hover:underline underline-offset-2"
                >
                prototyp3d.web.app
                </Link>
            </div>
            </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} Todos los derechos reservados.
        </div>
        </footer>
    );
}
