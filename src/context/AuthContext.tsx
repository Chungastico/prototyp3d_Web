'use client';

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
// import { supabase } from "@/lib/supabase";
// import { useEffect, useState } from "react";

import { useUserRole } from "@/hooks/useUserRole";

// Este hook actúa como un puente (bridge) para migrar de Firebase AuthContext a Clerk
// sin romper los componentes existentes que usan `useAuth`.

export const useAuth = () => {
    const { user, isLoaded } = useUser();
    const { signOut, openSignIn, openSignUp } = useClerk();
    const router = useRouter();

    // Fetch role from Supabase
    const { role, loading: roleLoading } = useUserRole();

    const logoutUser = async () => {
        await signOut();
        router.push('/');
    };

    const loginUser = () => openSignIn();
    
    // Funciones legacy que ya no deberían usarse si se usa <SignIn /> de Clerk,
    // pero se mantienen para evitar errores de compilación en componentes no migrados.
    const registerUser = () => openSignUp();
    const loginWithGoogle = () => openSignIn();

    return {
        user,
        role,
        loading: !isLoaded || roleLoading,
        logoutUser,
        loginUser,
        registerUser,
        loginWithGoogle
    };
};

// Componente dummy para compatibilidad si algún archivo aún lo importa
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};
