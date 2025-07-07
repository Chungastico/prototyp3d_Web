// app/perfil/layout.tsx (y igual para /checkout/layout.tsx)
'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
}
