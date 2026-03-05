import { syncStudentClient } from "@/app/actions/student";
import { supabaseAdmin } from "@/lib/supabase-admin";
import Link from "next/link";
import { Plus, Package, FileText, ChevronRight, Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function getStatusInfo(status: string) {
    switch (status) {
        case 'cotizado':
            return { label: 'Esperando Aprobación', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: Clock };
        case 'aprobado':
            return { label: 'Aprobado', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle2 };
        case 'en_produccion':
            return { label: 'En Producción', color: 'text-naranja bg-orange-50 border-orange-200', icon: PlayCircle };
        case 'listo':
            return { label: 'Listo para Entrega', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: Package };
        case 'entregado':
            return { label: 'Entregado', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: CheckCircle2 };
        case 'cancelado':
            return { label: 'Cancelado', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertCircle };
        default:
            return { label: status, color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Clock };
    }
}

export default async function DashboardPage() {
    const { clientId, error } = await syncStudentClient();

    if (error || !clientId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
                <p className="text-gray-600">No se pudo cargar tu perfil. Intenta iniciar sesión nuevamente.</p>
            </div>
        );
    }

    // Fetch projects for this client
    const { data: proyectos, error: proyError } = await supabaseAdmin
        .from('gestion_trabajos')
        .select('*')
        .eq('cliente_id', clientId)
        .order('fecha_solicitado', { ascending: false });

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-azul-oscuro">Mi Dashboard</h1>
                    <p className="text-gray-600 mt-1">Gestiona tus proyectos de impresión 3D</p>
                </div>
                
                <Link 
                    href="/dashboard/nuevo-proyecto" 
                    className="flex items-center gap-2 bg-naranja hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm shadow-orange-200 hover:shadow-md hover:-translate-y-0.5"
                >
                    <Plus className="h-5 w-5" />
                    Nuevo Proyecto
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-naranja" />
                        Mis Proyectos
                    </h2>
                </div>

                {proyError && (
                    <div className="p-6 text-red-500 bg-red-50 flex flex-col gap-2">
                        <span className="font-bold">Ocurrió un error al cargar tus proyectos.</span>
                        <pre className="text-sm bg-red-100 p-2 rounded overflow-auto">{JSON.stringify(proyError, null, 2)}</pre>
                    </div>
                )}

                {!proyError && (!proyectos || proyectos.length === 0) ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Package className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes proyectos activos</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            Comienza creando tu primer proyecto de impresión 3D subiendo tus archivos STL para que podamos cotizarlos.
                        </p>
                        <Link 
                            href="/dashboard/nuevo-proyecto" 
                            className="text-naranja hover:text-orange-600 font-medium flex items-center gap-1"
                        >
                            Crear mi primer proyecto <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {proyectos?.map((proyecto) => {
                            const StatusIcon = getStatusInfo(proyecto.estado).icon;
                            
                            // Determinar si la cotización está lista (por ejemplo si ya tiene piezas asignadas, 
                            // o si el admin le cambió el estado a 'aprobado' o si total_venta > 0.
                            // Para ser simples, asumiremos que si tiene "total_pagado" > 0 o "estado" diferente de cotizado.
                            // You can refine this logic based on how Quotes are finalized in your system.
                            // But usually, Admin downloads STLs -> generates pieces -> prints PDF quote -> student approves.
                            
                            return (
                                <div key={proyecto.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{proyecto.nombre_proyecto}</h3>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusInfo(proyecto.estado).color}`}>
                                                <StatusIcon className="h-3.5 w-3.5" />
                                                {getStatusInfo(proyecto.estado).label}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                Solicitado: {format(new Date(proyecto.fecha_solicitado), "d 'de' MMMM, yyyy", { locale: es })}
                                            </div>
                                            {proyecto.fecha_entrega && (
                                                <div className="flex items-center gap-1">
                                                    <Package className="h-4 w-4" />
                                                    Entrega Est.: {format(new Date(proyecto.fecha_entrega), "d 'de' MMMM", { locale: es })}
                                                </div>
                                            )}
                                            {proyecto.files && Array.isArray(proyecto.files) && (
                                                 <div className="flex items-center gap-1 font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                                     {proyecto.files.length} archivo(s) STL
                                                 </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {proyecto.estado === 'cotizado' && (
                                            <span className="hidden sm:inline-block text-sm text-gray-500 italic mr-2">Cotizando...</span>
                                        )}
                                        <Link 
                                            href={`/dashboard/proyectos/${proyecto.id}`}
                                            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                        >
                                            <FileText className="h-4 w-4" />
                                            Ver Detalles
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
