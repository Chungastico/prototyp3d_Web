'use client';

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function AuthPage() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center mb-8 border-b">
                    <button
                        onClick={() => setMode('signin')}
                        className={`pb-2 px-4 ${mode === 'signin' 
                            ? 'border-b-2 border-primary text-primary font-semibold' 
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        onClick={() => setMode('signup')}
                        className={`pb-2 px-4 ${mode === 'signup' 
                            ? 'border-b-2 border-primary text-primary font-semibold' 
                            : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Registrarse
                    </button>
                </div>

                <div className="flex justify-center">
                    {mode === 'signin' ? (
                        <SignIn routing="hash" />
                    ) : (
                        <SignUp routing="hash" />
                    )}
                </div>
            </div>
        </main>
    );
}
