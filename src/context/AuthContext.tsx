'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { registerUser, loginUser, logoutUser, loginWithGoogle } from "@/lib/auth";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    registerUser: typeof registerUser;
    loginUser: typeof loginUser;
    logoutUser: typeof logoutUser;
    loginWithGoogle: typeof loginWithGoogle;
    };

    const AuthContext = createContext<AuthContextType | undefined>(undefined);

    export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
        value={{ user, loading, registerUser, loginUser, logoutUser, loginWithGoogle }}
        >
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un <AuthProvider>");
    }
    return context;
};
