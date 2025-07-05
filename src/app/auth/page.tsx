'use client';

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Tab = "login" | "register";

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState<Tab>("login");
    const { loginUser, registerUser, loginWithGoogle } = useAuth();

    // Estados login
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState<string | null>(null);
    const [loginLoading, setLoginLoading] = useState(false);

    // Estados registro
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regError, setRegError] = useState<string | null>(null);
    const [regLoading, setRegLoading] = useState(false);
    const [regSuccess, setRegSuccess] = useState<string | null>(null);

    // Validar email
    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    // Login handler
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        if (!isValidEmail(loginEmail)) {
            setLoginError("Email inválido");
            return;
        }
        if (loginPassword.length < 6) {
            setLoginError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            setLoginLoading(true);
            await loginUser(loginEmail, loginPassword);
            // Aquí podrías redirigir o mostrar mensaje
        } catch (error: unknown) {
            if (error instanceof Error) setLoginError(error.message);
            else setLoginError("Error al iniciar sesión");
        } finally {
            setLoginLoading(false);
        }
    };

    // Registro handler
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegError(null);
        setRegSuccess(null);

        if (!isValidEmail(regEmail)) {
            setRegError("Email inválido");
            return;
        }
        if (regPassword.length < 6) {
            setRegError("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        try {
            setRegLoading(true);
            await registerUser(regEmail, regPassword);
            setRegSuccess("Registro exitoso. Revisa tu correo para verificar tu cuenta.");
            setRegEmail("");
            setRegPassword("");
        } catch (error: unknown) {
            if (error instanceof Error) setRegError(error.message);
            else setRegError("Error al registrar usuario");
        } finally {
            setRegLoading(false);
        }
    };

    // Login con Google
    const handleGoogleLogin = async () => {
        try {
            await loginWithGoogle();
            // Redirigir o mostrar mensaje opcional
        } catch (error: unknown) {
            if (error instanceof Error) alert(error.message);
            else alert("Error al iniciar sesión con Google");
        }
    };

    return (
        <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow">
            {/* Botón login Google */}
            <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-red-600 text-white py-2 rounded mb-6 hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    width="24px"
                    height="24px"
                    className="inline-block"
                >
                    <path fill="#FFC107" d="M43.6 20.4H42V20H24v8h11.3C34 32.7 29.9 36 24 36c-7 0-13-6-13-13s6-13 13-13c3.3 0 6.3 1.3 8.4 3.4l6-6C34.2 6.7 29.3 5 24 5 12.95 5 4 13.95 4 25s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.6-.4-3.6z" />
                    <path fill="#FF3D00" d="M6.3 14.6l6.6 4.9C14 17.2 18.6 15 24 15c3.3 0 6.3 1.3 8.4 3.4l6-6C34.2 6.7 29.3 5 24 5 17.6 5 12.1 8.7 9.3 14.6z" />
                    <path fill="#4CAF50" d="M24 43c5.4 0 10-2.7 12.8-6.8l-6.2-5c-1.7 1.2-4 1.8-6.6 1.8-4.5 0-8.3-3-9.7-7.3l-6.5 5c2.9 5.7 8.9 9.3 16.2 9.3z" />
                    <path fill="#1976D2" d="M43.6 20.4H42V20H24v8h11.3c-1 3-4 6-11.3 6-7 0-13-6-13-13s6-13 13-13c3.3 0 6.3 1.3 8.4 3.4l6-6z" />
                </svg>
                Continuar con Google
            </button>

            <div className="flex mb-6 border-b">
                <button
                    className={`flex-1 py-2 text-center ${
                        activeTab === "login"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("login")}
                    type="button"
                >
                    Iniciar sesión
                </button>
                <button
                    className={`flex-1 py-2 text-center ${
                        activeTab === "register"
                            ? "border-b-2 border-blue-600 font-semibold"
                            : "text-gray-500"
                    }`}
                    onClick={() => setActiveTab("register")}
                    type="button"
                >
                    Registrarse
                </button>
            </div>

            {activeTab === "login" && (
                <form onSubmit={handleLogin} noValidate>
                    <label className="block mb-2">
                        Email
                        <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </label>

                    <label className="block mb-4">
                        Contraseña
                        <input
                            type="password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                            required
                            minLength={6}
                        />
                    </label>

                    {loginError && <p className="text-red-600 mb-4">{loginError}</p>}

                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loginLoading ? "Cargando..." : "Iniciar sesión"}
                    </button>
                </form>
            )}

            {activeTab === "register" && (
                <form onSubmit={handleRegister} noValidate>
                    <label className="block mb-2">
                        Email
                        <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                            required
                        />
                    </label>

                    <label className="block mb-4">
                        Contraseña
                        <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full mt-1 p-2 border rounded"
                            required
                            minLength={6}
                        />
                    </label>

                    {regError && <p className="text-red-600 mb-4">{regError}</p>}
                    {regSuccess && <p className="text-green-600 mb-4">{regSuccess}</p>}

                    <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                    >
                        {regLoading ? "Cargando..." : "Registrarse"}
                    </button>
                </form>
            )}
        </main>
    );
}
