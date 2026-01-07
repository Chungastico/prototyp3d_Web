'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GestionTrabajo, PiezaTrabajo, ExtraAplicado } from './types';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, CheckCircle, Truck, Package, DollarSign, FileBox, ExternalLink } from "lucide-react";
import { PieceForm } from './PieceForm';
import { ExtrasSelector } from './ExtrasSelector';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface JobDetailsProps {
    jobId: string;
    onBack: () => void;
}

export function JobDetails({ jobId, onBack }: JobDetailsProps) {
    const [job, setJob] = useState<GestionTrabajo | null>(null);
    const [pieces, setPieces] = useState<PiezaTrabajo[]>([]);
    const [extras, setExtras] = useState<ExtraAplicado[]>([]);
    const [extraNames, setExtraNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    
    // Modals
    const [pieceModalOpen, setPieceModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        
        // 1. Fetch Job
        const { data: jobData } = await supabase
            .from('gestion_trabajos')
            .select(`*, cliente:clientes(nombre)`)
            .eq('id', jobId)
            .single();
            
        // 2. Fetch Pieces
        const { data: piecesData } = await supabase
            .from('piezas_trabajo')
            .select('*')
            .eq('trabajo_id', jobId);

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

    const updateStatus = async (newStatus: any) => {
        if (!job) return;
        const { error } = await supabase
            .from('gestion_trabajos')
            .update({ estado: newStatus })
            .eq('id', jobId);
        
        if (!error) {
            setJob({ ...job, estado: newStatus });
        }
    };

    // --- Calculations ---
    const totalPiecesSale = pieces.reduce((sum, p) => sum + p.total_venta, 0);
    const totalPiecesCost = pieces.reduce((sum, p) => sum + p.total_costo, 0);
    
    // Assuming es_costo / es_venta are reliably set in extras_aplicados (we set them to true in simpler logic)
    const totalExtrasSale = extras.reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
    const totalExtrasCost = extras.reduce((sum, e) => sum + (e.es_costo ? e.precio_unitario_snapshot * e.cantidad : 0), 0); // Re-calculate cost? Or use subtotal if subtotal = cost?
    // In our logic, 'subtotal' = qty * unit_price (which acts as sales price or cost depending on context).
    // Usually extras have a fixed cost and a fixed sales price, but for simplicity we used one 'precio_unitario'.
    // If the catalog price is the SALE price, then COST is likely distinct.
    // However, the prompt says "Calcular subtotal... Marcar es_costo=true y es_venta=true".
    // This implies the price is used for BOTH or just simplified. 
    // Let's assume subtotal is SALE price. And Cost is ... well, the prompt didn't specify a cost field for extras.
    // Let's assume for extras, Cost ~= Sale (passthrough) OR Cost = 0 if it's service?
    // To be safe and show *some* margin, usually cost < sale. 
    // But sticking to prompt: "Total venta (suma de piezas + extras), Total costo (suma de piezas + extras)".
    // So distinct cost field is required or we reuse subtotal.
    // Given strict schema, `extras_aplicados` checks: `subtotal` is the only value.
    // So `Total Cost` of Extra = `subtotal`? Then profit is 0.
    // Let's assume `subtotal` adds to both Cost and Sale for now, implying 0 profit on extras unless logic changes.
    // OR we can assume extras are pure profit services?
    // Let's stick to: Sale = subtotal. Cost = subtotal (conservative, 0 profit). 
    // Wait, "Envío" ($3) -> Customer pays $3, we pay $3. Profit 0. Correct.
    // "Empaquetado" ($1) -> Cost $1.
    // So yes, Extras add to both. 
    
    const grandTotalSale = totalPiecesSale + totalExtrasSale;
    const grandTotalCost = totalPiecesCost + totalExtrasCost;
    const grandTotalProfit = grandTotalSale - grandTotalCost;

    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (!job) return <div className="p-8 text-center">Pedido no encontrado</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={onBack} size="sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{job.nombre_proyecto}</h1>
                        <p className="text-gray-500 text-sm">{(job as any).cliente?.nombre}</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    {['cotizado', 'aprobado', 'en_produccion', 'listo', 'entregado'].map((s) => (
                        <button
                            key={s}
                            onClick={() => updateStatus(s)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
                                job.estado === s 
                                ? 'bg-gray-900 text-white border-gray-900' 
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
                            }`}
                        >
                            {s === 'en_produccion' ? 'En Producción' : s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Content: Pieces & Extras */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Pieces Section */}
                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Package className="h-4 w-4" /> Piezas
                            </h3>
                            <Button size="sm" onClick={() => setPieceModalOpen(true)} className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50">
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
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pieces.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50/50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{p.nombre_pieza}</td>
                                                <td className="px-4 py-3 text-center">{p.cantidad}</td>
                                                <td className="px-4 py-3 text-right text-gray-500">${p.costo_total_unit.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right text-naranja font-medium">${p.precio_final_unit.toFixed(2)}</td>
                                                <td className="px-4 py-3 text-right font-bold">${p.total_venta.toFixed(2)}</td>
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
                    
                    {/* Financial Summary */}
                    <div className="bg-gray-900 text-white rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-naranja" /> Resumen Financiero
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-300">
                                <span>Total Costo Producción</span>
                                <span>${totalPiecesCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                                <span>Total Extras</span>
                                <span>${totalExtrasSale.toFixed(2)}</span>
                            </div>
                             <div className="h-px bg-gray-700 my-2"></div>
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total Venta</span>
                                <span>${grandTotalSale.toFixed(2)}</span>
                            </div>
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
                    </div>

                </div>
            </div>

            <PieceForm 
                open={pieceModalOpen} 
                onOpenChange={setPieceModalOpen} 
                jobId={jobId} 
                onPieceAdded={fetchData} 
            />
        </div>
    );
}
