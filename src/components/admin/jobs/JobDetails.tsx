'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GestionTrabajo, PiezaTrabajo, ExtraAplicado } from './types';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, CheckCircle, Truck, Package, DollarSign, FileBox, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { PieceForm } from './PieceForm';
import { ExtrasSelector } from './ExtrasSelector';
import { CreateJobModal } from './CreateJobModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { QuotePDF } from './QuotePDF';

interface JobDetailsProps {
    jobId: string;
    onBack: () => void;
}

export function JobDetails({ jobId, onBack }: JobDetailsProps) {
    const [job, setJob] = useState<GestionTrabajo | null>(null);
    const [pieces, setPieces] = useState<PiezaTrabajo[]>([]);
    const [extras, setExtras] = useState<ExtraAplicado[]>([]);
    const [extraNames, setExtraNames] = useState<Record<string, string>>({});
    const [filamentNames, setFilamentNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    
    // Modals
    const [pieceModalOpen, setPieceModalOpen] = useState(false);
    const [projectEditModalOpen, setProjectEditModalOpen] = useState(false);

    const [pieceToEdit, setPieceToEdit] = useState<PiezaTrabajo | null>(null);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        
        // 1. Fetch Job with client name
        const { data: jobData } = await supabase
            .from('gestion_trabajos')
            .select(`*, cliente:clientes(*)`)
            .eq('id', jobId)
            .single();
            
        // 2. Fetch Pieces
        const { data: piecesData } = await supabase
            .from('piezas_trabajo')
            .select('*')
            .eq('trabajo_id', jobId);

        // 2b. Fetch Filament Info if pieces exist
        if (piecesData && piecesData.length > 0) {
            const filamentIds = Array.from(new Set(piecesData.map(p => p.filamento_id).filter(Boolean)));
            if (filamentIds.length > 0) {
                const { data: filaments } = await supabase
                    .from('inventario_filamento')
                    .select('id, color_tipo_filamento')
                    .in('id', filamentIds);
                
                const fMap: Record<string, string> = {};
                if (filaments) {
                    filaments.forEach(f => {
                         fMap[f.id] = f.color_tipo_filamento;
                    });
                }
                setFilamentNames(fMap);
            }
        }

        // 3. Fetch Extras (Job Level)
        const { data: extrasData } = await supabase
            .from('extras_aplicados')
            .select('*')
            .eq('trabajo_id', jobId);
            
        // 3b. Fetch Extras (Piece Level)
        // Note: Supabase doesn't easily do "OR" across tables joined differently in one query simply. 
        // We'll just fetch piece-extras separately if we have pieces.
        let allExtras = extrasData || [];
        
        if (piecesData && piecesData.length > 0) {
            const pieceIds = piecesData.map(p => p.id);
            const { data: pieceExtras } = await supabase
                .from('extras_aplicados')
                .select('*')
                .in('pieza_id', pieceIds);
            
            if (pieceExtras) allExtras = [...allExtras, ...pieceExtras];
        }

        // 4. Fetch Extra Names
        if (allExtras.length > 0) {
            const extraIds = Array.from(new Set(allExtras.map(e => e.extra_id)));
            const { data: names } = await supabase
                .from('catalogo_extras')
                .select('id, nombre')
                .in('id', extraIds);
            
            const nameMap: Record<string, string> = {};
            if (names) names.forEach(n => nameMap[n.id] = n.nombre);
            setExtraNames(nameMap);
        }

        if (jobData) setJob(jobData);
        if (piecesData) setPieces(piecesData);
        setExtras(allExtras);
        setLoading(false);
    }, [jobId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateStatus = async (newStatus: any, montoCobrado?: number) => {
        if (!job) return;
        
        const updates: any = { estado: newStatus };
        if (montoCobrado !== undefined) {
            updates.monto_cobrado = montoCobrado;
        }

        const { error } = await supabase
            .from('gestion_trabajos')
            .update(updates)
            .eq('id', jobId);
        
        if (!error) {
            setJob({ ...job, ...updates });
        }
    };

    const deletePiece = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta pieza?')) return;
        
        const { error } = await supabase
            .from('piezas_trabajo')
            .delete()
            .eq('id', id);
        
        if (error) {
            alert('Error al eliminar pieza');
            console.error(error);
        } else {
            fetchData();
        }
    };

    // --- Calculations ---
    const totalPiecesSale = pieces.reduce((sum, p) => sum + p.total_venta, 0);
    const totalPiecesCost = pieces.reduce((sum, p) => sum + p.total_costo, 0);

    // Detailed Cost Breakdown
    const totalMaterialCost = pieces.reduce((sum, p) => sum + (p.costo_filamento_snapshot * p.cantidad), 0);
    const totalMachineCost = pieces.reduce((sum, p) => sum + (p.tiempo_impresora_h * p.costo_impresora_h_rate * p.cantidad), 0);
    const totalModelingCost = pieces.reduce((sum, p) => sum + (p.tiempo_modelado_h * p.costo_modelado_h_rate * p.cantidad), 0);
    
    // Extras
    const totalExtrasSale = extras.reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
    const totalExtrasCost = extras.reduce((sum, e) => sum + (e.es_costo ? e.subtotal : 0), 0);
    
    // Production Stats
    const totalPrintTime = pieces.reduce((sum, p) => sum + (p.tiempo_impresora_h * p.cantidad), 0);
    const totalFilament = pieces.reduce((sum, p) => sum + (p.gramos_usados * p.cantidad), 0);

    const grandTotalSale = totalPiecesSale + totalExtrasSale;
    const grandTotalCost = totalPiecesCost + totalExtrasCost;
    const grandTotalProfit = grandTotalSale - grandTotalCost;

    // IVA for Crédito Fiscal
    const isCreditoFiscal = job?.credito_fiscal === true;
    const ivaAmount = isCreditoFiscal ? grandTotalSale * 0.13 : 0;
    const grandTotalWithIVA = grandTotalSale + ivaAmount;

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (!job) return <div className="p-8 text-center">Pedido no encontrado</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            {/* ... (Header code remains unchanged) ... */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={onBack} size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            {job.nombre_proyecto}
                            {/* PDF Export Button */}
                            {isClient && (
                                <PDFDownloadLink
                                    document={
                                        <QuotePDF 
                                            job={job} 
                                            pieces={pieces} 
                                            extras={extras} 
                                            client={(job as any).cliente} 
                                            extraNames={extraNames}
                                            filamentNames={filamentNames}
                                        />
                                    }
                                    fileName={`${(job.es_empresa && job.nombre_empresa 
                                        ? job.nombre_empresa 
                                        : ((job as any).cliente?.nombre_cliente || 'Cotizacion')
                                    ).replace(/\s+/g, '_')}_${format(new Date(), 'ddMMyy')}.pdf`}
                                >
                                    {({ loading }) => (
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            disabled={loading}
                                            className="ml-2 h-8 text-xs bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300"
                                        >
                                            {loading ? 'Generando...' : 'Exportar PDF'}
                                        </Button>
                                    )}
                                </PDFDownloadLink>
                            )}
                        </h1>
                        <p className="text-gray-500 text-sm">{(job as any).cliente?.nombre_cliente}</p>
                    </div>
                </div>
                
                <div className="flex gap-2 items-center">
                    {/* Status Buttons */}
                     <div className="flex gap-1">
                        {['aprobado', 'entregado'].map((s) => (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                    job.estado === s 
                                    ? 'bg-gray-900 text-white border-gray-900' 
                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                                }`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Cancellation Options */}
                    {(job.estado !== 'cancelado' && job.estado !== 'parcialmente_cancelado') ? (
                         <div className="flex gap-1 ml-2 border-l pl-2 border-gray-200">
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => {
                                    const amount = prompt("Monto cobrado por cancelación (si aplica):", "0");
                                    if (amount !== null) {
                                        const numAmount = parseFloat(amount);
                                        if (!isNaN(numAmount)) {
                                            updateStatus('cancelado', numAmount);
                                        } else {
                                            alert("Monto inválido");
                                        }
                                    }
                                }}
                             >
                                Cancelar
                             </Button>
                             <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 text-xs text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                                onClick={() => {
                                     const amount = prompt("Monto cobrado (Parcial):", "0");
                                    if (amount !== null) {
                                        const numAmount = parseFloat(amount);
                                         if (!isNaN(numAmount)) {
                                            updateStatus('parcialmente_cancelado', numAmount);
                                        } else {
                                            alert("Monto inválido");
                                        }
                                    }
                                }}
                             >
                                Parc. Cancelado
                             </Button>
                         </div>
                    ) : (
                         <span className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full border ${
                            job.estado === 'cancelado' 
                                ? 'bg-red-100 text-red-700 border-red-200' 
                                : 'bg-orange-100 text-orange-700 border-orange-200'
                         }`}>
                            {job.estado === 'cancelado' ? 'Cancelado' : 'Parc. Cancelado'}
                             {job.monto_cobrado !== undefined && job.monto_cobrado !== null && (
                                 <span className="ml-1 font-normal text-xs opacity-75">
                                     (${job.monto_cobrado.toFixed(2)})
                                 </span>
                             )}
                        </span>
                    )}

                    {/* Read-only indicators for automated statuses */}
                    {['cotizado', 'en_produccion', 'listo'].includes(job.estado) && (
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border bg-gray-900 text-white border-gray-900`}>
                            {job.estado === 'en_produccion' ? 'En Producción' : job.estado.charAt(0).toUpperCase() + job.estado.slice(1)}
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content: Pieces & Extras */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ... (Pieces and Extras sections remain unchanged) ... */}
                    {/* Pieces Section */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="h-4 w-4" /> Piezas
                            </h3>
                            <Button size="sm" onClick={() => { setPieceToEdit(null); setPieceModalOpen(true); }} className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50">
                                + Agregar Pieza
                            </Button>
                        </div>
                        
                        {pieces.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">No hay piezas agregadas.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
                                        <tr>
                                            <th className="px-4 py-3">Nombre</th>
                                            <th className="px-4 py-3 text-center">Cant.</th>
                                            <th className="px-4 py-3 text-right">Costo U.</th>
                                            <th className="px-4 py-3 text-right">Precio U.</th>
                                            <th className="px-4 py-3 text-right">Subtotal</th>
                                            <th className="px-4 py-3 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pieces.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50 group">
                                                <td className="px-4 py-3 font-medium text-gray-900">{p.nombre_pieza}</td>
                                                <td className="px-4 py-3 text-center">{p.cantidad}</td>
                                                <td className="px-4 py-3 text-right text-gray-500">${p.costo_total_unit.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-naranja font-medium">${p.precio_final_unit.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-bold">${p.total_venta.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-blue-600"
                                                        onClick={() => {
                                                            setPieceToEdit(p);
                                                            setPieceModalOpen(true);
                                                        }}
                                                    >
                                                        <span className="sr-only">Editar</span>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-600"
                                                        onClick={() => deletePiece(p.id)}
                                                    >
                                                        <span className="sr-only">Eliminar</span>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Extras Section */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Truck className="h-4 w-4" /> Extras & Servicios
                            </h3>
                        </div>
                        
                        <div className="p-4">
                             <ExtrasSelector 
                                jobId={jobId} 
                                pieces={pieces} 
                                onExtraApplied={fetchData} 
                             />
                        </div>

                        {extras.length > 0 && (
                             <div className="border-t border-gray-100">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
                                        <tr>
                                            <th className="px-4 py-3">Concepto</th>
                                            <th className="px-4 py-3 text-center">Aplicado a</th>
                                            <th className="px-4 py-3 text-center">Cant.</th>
                                            <th className="px-4 py-3 text-right">Precio U.</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {extras.map(e => (
                                            <tr key={e.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium">{extraNames[e.extra_id] || e.extra_id}</td>
                                                <td className="px-4 py-3 text-center text-xs text-gray-500">
                                                    {e.pieza_id ? 'Pieza' : 'Pedido'}
                                                </td>
                                                <td className="px-4 py-3 text-center">{e.cantidad}</td>
                                                <td className="px-4 py-3 text-right">${e.precio_unitario_snapshot.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-bold">${e.subtotal.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Summary & Info */}
                <div className="space-y-6">
                    
                    {/* Production Summary */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                            <Package className="h-5 w-5 text-naranja" /> Producción
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 block mb-1">Tiempo Total</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {Math.floor(totalPrintTime)}h {Math.round((totalPrintTime % 1) * 60)}m
                                </span>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-xs text-gray-500 block mb-1">Filamento Total</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {Math.round(totalFilament)}g
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-naranja" /> Resumen Financiero
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="text-gray-400 font-semibold text-xs uppercase mb-1">Costos Desglosados</div>
                            <div className="flex justify-between text-gray-300 pl-2">
                                <span>Material (Filamento)</span>
                                <span>${totalMaterialCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300 pl-2">
                                <span>Máquina/Luz</span>
                                <span>${totalMachineCost.toFixed(2)}</span>
                            </div>
                            {totalModelingCost > 0 && (
                                <div className="flex justify-between text-gray-300 pl-2">
                                    <span>Modelado 3D</span>
                                    <span>${totalModelingCost.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-300 pl-2">
                                <span>Extras/Envíos</span>
                                <span>${totalExtrasCost.toFixed(2)}</span>
                            </div>

                            <div className="h-px bg-gray-700 my-2"></div>
                            
                            <div className="flex justify-between text-gray-200">
                                <span className="font-semibold">Total Costos</span>
                                <span>${grandTotalCost.toFixed(2)}</span>
                            </div>
                            
                             <div className="h-px bg-gray-700 my-2"></div>
                             
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total Venta</span>
                                <span>${grandTotalSale.toFixed(2)}</span>
                            </div>
                            {isCreditoFiscal && (
                                <>
                                <div className="flex justify-between text-blue-400 text-sm font-medium mt-1">
                                    <span>IVA 13%</span>
                                    <span>${ivaAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold text-blue-300 mt-1">
                                    <span>Total + IVA</span>
                                    <span>${grandTotalWithIVA.toFixed(2)}</span>
                                </div>
                                </>
                            )}
                            <div className="flex justify-between text-green-400 text-sm font-medium mt-1">
                                <span>Ganancia Estimada</span>
                                <span>${grandTotalProfit.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Files & Info */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
                        <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Archivos y Fechas</h4>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span>Pedido: {format(new Date(job.fecha_solicitado), 'dd MMM yyyy', { locale: es })}</span>
                            </div>
                             <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>Entrega: {job.fecha_entrega ? format(new Date(job.fecha_entrega), 'dd MMM yyyy', { locale: es }) : 'N/A'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mt-4">
                            {job.files && (job.files as any).url && (
                                <a 
                                    href={(job.files as any).url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs transition-colors"
                                >
                                    <FileBox className="h-4 w-4 text-blue-500" />
                                    <span className="truncate flex-1">{(job.files as any).name || 'Archivo 3D'}</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                            
                            {job.fusion_project_url && (
                                <a 
                                    href={job.fusion_project_url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-2 p-2 rounded bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs transition-colors"
                                >
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Autodesk_Fusion_360_Logo.png/640px-Autodesk_Fusion_360_Logo.png" alt="Fusion" className="h-4 w-4" />
                                    <span className="truncate flex-1">Fusion 360 Link</span>
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                        
                        {job.thumbnail_url && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100">
                                <img src={job.thumbnail_url} alt="Thumbnail" className="w-full h-32 object-cover" />
                            </div>
                        )}

                        <Button 
                            variant="outline" 
                            className="w-full mt-4 flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
                            onClick={() => setProjectEditModalOpen(true)}
                        >
                            <Pencil className="h-4 w-4" /> Editar Proyecto
                        </Button>
                    </div>

                </div>
            </div>

            <PieceForm 
                open={pieceModalOpen} 
                onOpenChange={(open) => {
                    setPieceModalOpen(open);
                    if (!open) setPieceToEdit(null);
                }}
                jobId={jobId} 
                onPieceAdded={fetchData} 
                pieceToEdit={pieceToEdit}
            />

            <CreateJobModal 
                open={projectEditModalOpen} 
                onOpenChange={setProjectEditModalOpen} 
                onJobCreated={fetchData}
                jobToEdit={job}
            />
        </div>
    );
}
