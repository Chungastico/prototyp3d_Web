'use client';

import { useUser, UserProfile } from "@clerk/nextjs";
import { User, Mail, Calendar, Settings, Clock, CheckCircle } from "lucide-react";

export default function StudentProfilePage() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando perfil...</div>;
    }

    if (!user) {
        return <div className="p-8 text-center text-red-500">Error: No se encontró sesión activa.</div>;
    }

    // Determine if user has student status active
    const isStudentEmail = user.primaryEmailAddress?.emailAddress.endsWith('.edu.sv');
    // Using default Clerk created at, could expand to fetch DB specific 
    const isStudentActive = isStudentEmail || user.publicMetadata?.student_role === true;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-500">Gestiona tu información personal y verifica el estado de tu cuenta estudiantil.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Main Auth Card */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                    <div className="flex items-center gap-6 border-b border-gray-100 pb-6">
                        <img 
                            src={user.imageUrl} 
                            alt="Profile" 
                            className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                            <div className="flex items-center gap-2 text-gray-500 mt-1">
                                <Mail className="w-4 h-4" />
                                {user.primaryEmailAddress?.emailAddress}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                             <User className="w-5 h-5 text-naranja" />
                             Detalles de la Cuenta
                         </h3>
                         
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                 <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Nombre Principal</span>
                                 <p className="text-gray-900 font-medium mt-1">{user.firstName}</p>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                 <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Apellido</span>
                                 <p className="text-gray-900 font-medium mt-1">{user.lastName}</p>
                             </div>
                             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 sm:col-span-2">
                                 <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Miembro Desde
                                 </span>
                                 <p className="text-gray-900 font-medium mt-1">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-SV', {
                                        year: 'numeric', month: 'long', day: 'numeric'
                                    }) : 'Desconocido'}
                                 </p>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Sidebar Info Card */}
                <div className="space-y-6">
                    {/* Student Status Card */}
                    <div className={`rounded-2xl shadow-sm border p-6 relative overflow-hidden ${isStudentActive ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'}`}>
                        <div className="relative z-10">
                            <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isStudentActive ? 'text-green-800' : 'text-gray-700'}`}>
                                {isStudentActive ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                Estado Estudiante
                            </h3>
                            
                            {isStudentActive ? (
                                <>
                                    <p className="text-green-700 text-sm font-medium mb-3">
                                        ¡Cuenta verificada! Tienes acceso a los beneficios y descuentos universitarios.
                                    </p>
                                    <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                                        <span className="text-xs text-green-600 uppercase font-semibold block mb-1">Beneficio Principal</span>
                                        <span className="text-lg font-bold text-green-800">20% Descuento</span>
                                        <p className="text-xs text-green-700 mt-1">En todos los proyectos 3D.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Tu cuenta no ha sido verificada con un correo institucional (.edu.sv).
                                    </p>
                                    <button className="w-full bg-white border border-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                                        Solicitar Verificación
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Manage Account Full Width Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mt-8">
                <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                     <Settings className="w-5 h-5 text-gray-500" /> Configuración Avanzada de Cuenta
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-100 w-full flex justify-center bg-gray-50/30">
                     <UserProfile 
                        routing="hash"
                        appearance={{
                            elements: {
                                rootBox: "w-full max-w-full shadow-none",
                                cardBox: "w-full max-w-full shadow-none border-none bg-transparent",
                                scrollBox: "rounded-xl",
                            }
                        }}
                     />
                </div>
            </div>
        </div>
    );
}
