import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncStudentClient } from "@/app/actions/student";
import { AlertCircle, ArrowLeft, Package } from "lucide-react";
import { currentUser } from '@clerk/nextjs/server';
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
        .eq('cliente_id', clientId)
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

    // Pieces & extras
    const [
        { data: pieces },
        { data: extras }
    ] = await Promise.all([
        supabaseAdmin
            .from('piezas_trabajo')
            .select('*')
            .eq('trabajo_id', job.id),
        supabaseAdmin
            .from('extras_aplicados')
            .select('*')
            .eq('trabajo_id', job.id)
    ]);

    // True when admin has quoted every file
    const allFilesQuoted = Array.isArray(job.files) && job.files.length > 0 && job.files.every((f: any) => f.quoted);

    // All users in the student dashboard are individual consumers — CF never applies to them
    const isActiveStudent = true;
    const filamentNames: Record<string, string> = {};
    const filamentMaterials: Record<string, string> = {};
    const extraNames: Record<string, string> = {};

    const filamentIds = pieces && pieces.length > 0
        ? Array.from(new Set(pieces.map(p => p.filamento_id).filter(Boolean)))
        : [];

    const extraIds = extras && extras.length > 0
        ? Array.from(new Set(extras.map(e => e.extra_id)))
        : [];

    const [filamentsRes, namesRes] = await Promise.all([
        filamentIds.length > 0
            ? supabaseAdmin.from('inventario_filamento').select('id, color_tipo_filamento, material').in('id', filamentIds)
            : Promise.resolve({ data: null }),
        extraIds.length > 0
            ? supabaseAdmin.from('catalogo_extras').select('id, nombre').in('id', extraIds)
            : Promise.resolve({ data: null })
    ]);

    if (filamentsRes.data) {
        filamentsRes.data.forEach(f => {
            filamentNames[f.id] = f.color_tipo_filamento;
            filamentMaterials[f.id] = f.material || '-';
        });
    }

    if (namesRes.data) {
        namesRes.data.forEach(n => extraNames[n.id] = n.nombre);
    }

    // Totals
    const totalPiecesSale = (pieces || []).reduce((sum, p) => sum + p.total_venta, 0);
    const totalExtrasSale = (extras || []).reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
    const grandTotalSale = totalPiecesSale + totalExtrasSale;

    // Status label
    const estadoLabels: Record<string, { label: string; color: string }> = {
        cotizado:      { label: 'Esperando Aprobación', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        aprobado:      { label: 'Aprobado',              color: 'bg-green-50 text-green-700 border-green-200' },
        en_produccion: { label: 'En Producción',         color: 'bg-purple-50 text-purple-700 border-purple-200' },
        listo:         { label: 'Listo para Retirar',    color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        entregado:     { label: 'Entregado',             color: 'bg-gray-50 text-gray-600 border-gray-200' },
        cancelado:     { label: 'Cancelado',             color: 'bg-red-50 text-red-700 border-red-200' },
    };
    const estadoInfo = (allFilesQuoted && job.estado === 'cotizado')
        ? { label: 'Cotizaci\u00f3n Lista', color: 'bg-green-50 text-green-700 border-green-200' }
        : estadoLabels[job.estado] ?? { label: job.estado, color: 'bg-blue-50 text-blue-700 border-blue-200' };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 min-h-screen">
            <Link 
                href="/dashboard" 
                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <Package className="h-6 w-6 text-naranja" />
                            {job.nombre_proyecto}
                        </h1>
                        <div className={`self-start sm:self-auto inline-block px-3 py-1 rounded-full text-sm font-medium border ${estadoInfo.color}`}>
                            {estadoInfo.label}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="p-6">
                    <StudentProjectFiles 
                        jobId={job.id} 
                        clientId={clientId} 
                        initialFiles={job.files || []} 
                        estado={job.estado}
                        grandTotal={grandTotalSale > 0 ? grandTotalSale : undefined}
                        creditoFiscal={job.credito_fiscal ?? false}
                        pieces={pieces || []}
                        filamentNames={filamentNames}
                        isActiveStudent={isActiveStudent}
                    />

                    {/* PDF Download — shown when all files are quoted by admin */}
                    {allFilesQuoted && pieces && pieces.length > 0 && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <p className="text-sm text-gray-500 mb-3 text-center">
                                Descarga tu cotización formal para revisarla o compartirla.
                            </p>
                            <StudentQuoteAction 
                                job={job} 
                                pieces={pieces} 
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
    );
}
