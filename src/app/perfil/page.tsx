// app/perfil/page.tsx
'use client';

import ProtectedPage from '@/components/ProtectedPage';

export default function PerfilPage() {
    return (
        <ProtectedPage>
            <main className="p-6">
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                <p>Bienvenido a tu panel privado</p>
                {/* Aquí puedes mostrar info del usuario */}
            </main>
        </ProtectedPage>
    );
}
