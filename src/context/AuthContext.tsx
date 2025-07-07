'use client';

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/firebase/firebase";
import {
    registerUser,
    loginUser,
    logoutUser,
    loginWithGoogle
} from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore";

type AuthContextType = {
    user: User | null;
    role: string | null;
    loading: boolean;
    registerUser: typeof registerUser;
    loginUser: typeof loginUser;
    logoutUser: typeof logoutUser;
    loginWithGoogle: typeof loginWithGoogle;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // Leer rol del usuario desde Firestore
                const docRef = doc(db, "usuarios", currentUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setRole(data.role || null);
                } else {
                    setRole(null);
                }
            } else {
                setRole(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                loading,
                registerUser,
                loginUser,
                logoutUser,
                loginWithGoogle
            }}
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
