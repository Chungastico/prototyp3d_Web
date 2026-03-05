import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncStudentClient } from "@/app/actions/student";
import { AlertCircle, ArrowLeft, Package, DollarSign, Receipt } from "lucide-react";
import Link from "next/link";
import StudentQuoteAction from "./StudentQuoteAction";
import StudentProjectFiles from "./StudentProjectFiles";

export default async function DetalleProyectoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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

    const { data: job, error: jobError } = await supabaseAdmin
        .from('gestion_trabajos')
        .select('*, cliente:clientes(*)')
        .eq('id', id)
        .eq('cliente_id', clientId) // Security check
        .single();

    if (jobError || !job) {
         return (
             <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Proyecto no encontrado</h2>
                <p className="text-gray-600">El proyecto que buscas no existe o no tienes acceso a él.</p>
                <Link href="/dashboard" className="mt-4 text-naranja font-medium">Volver a mis proyectos</Link>
            </div>
        );
    }

    // Get pieces and extras to pass to PDF
    const { data: pieces } = await supabaseAdmin
        .from('piezas_trabajo')
        .select('*')
        .eq('trabajo_id', job.id);
        
    const { data: extras } = await supabaseAdmin
        .from('extras_aplicados')
        .select('*')
        .eq('trabajo_id', job.id);

    // Fetch Filament Info if pieces exist
    const filamentNames: Record<string, string> = {};
    const filamentMaterials: Record<string, string> = {};
    if (pieces && pieces.length > 0) {
        const filamentIds = Array.from(new Set(pieces.map(p => p.filamento_id).filter(Boolean)));
        if (filamentIds.length > 0) {
            const { data: filaments } = await supabaseAdmin
                .from('inventario_filamento')
                .select('id, color_tipo_filamento, material')
                .in('id', filamentIds);
            
            if (filaments) {
                filaments.forEach(f => {
                     filamentNames[f.id] = f.color_tipo_filamento;
                     filamentMaterials[f.id] = f.material || '-';
                });
            }
        }
    }

    // Fetch Extra Names
    const extraNames: Record<string, string> = {};
    if (extras && extras.length > 0) {
        const extraIds = Array.from(new Set(extras.map(e => e.extra_id)));
        const { data: names } = await supabaseAdmin
            .from('catalogo_extras')
            .select('id, nombre')
            .in('id', extraIds);
        
        if (names) names.forEach(n => extraNames[n.id] = n.nombre);
    }

    // Basic calculation for the UI
    const totalPiecesSale = (pieces || []).reduce((sum, p) => sum + p.total_venta, 0);
    const totalExtrasSale = (extras || []).reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
    const grandTotalSale = totalPiecesSale + totalExtrasSale;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
            <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Package className="h-6 w-6 text-naranja" />
                            {job.nombre_proyecto}
                        </h1>
                        <div className="inline-block px-3 py-1 rounded-full text-sm font-medium border bg-blue-50 text-blue-700 border-blue-200">
                            {job.estado.charAt(0).toUpperCase() + job.estado.slice(1).replace('_', ' ')}
                        </div>
                    </div>

                    {/* Crédito Fiscal banner is rendered inside StudentProjectFiles (client component) */}
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        
                        <div className="md:col-span-2">
                            <StudentProjectFiles 
                                jobId={job.id} 
                                clientId={clientId} 
                                initialFiles={job.files || []} 
                                estado={job.estado}
                                grandTotal={grandTotalSale > 0 ? grandTotalSale : undefined}
                                creditoFiscal={job.credito_fiscal ?? false}
                                pieces={pieces || []}
                                filamentNames={filamentNames}
                            />
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                                    <DollarSign className="h-5 w-5 text-naranja" />
                                    Presupuesto Final
                                </h3>
                                
                                {job.estado === 'cotizado' ? (
                                    <div className="text-center py-6">
                                        <p className="text-gray-500 text-sm mb-2">Estamos analizando tus piezas y calculando los costos.</p>
                                        <p className="text-naranja font-medium">Te notificaremos cuando la cotización esté lista.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b pb-4">
                                            <span className="text-gray-600">Total a Pagar</span>
                                            <span className="text-3xl font-bold text-gray-900">${grandTotalSale.toFixed(2)}</span>
                                        </div>
                                        
                                        <StudentQuoteAction 
                                            job={job} 
                                            pieces={pieces || []} 
                                            extras={extras || []} 
                                            extraNames={extraNames}
                                            filamentNames={filamentNames}
                                            filamentMaterials={filamentMaterials}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
