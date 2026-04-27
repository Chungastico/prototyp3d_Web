'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, FileText, Info } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

interface ProjectFinanceData {
    jobId: string;
    jobName: string;
    clientName: string;
    date: string;
    status: string;
    isCreditoFiscal: boolean;
    ventaTotal: number;
    costoProduccion: number; // Mat + Mach + Mod + Obj
    costoExtras: number;
    iva: number;
    margenBruto: number; // Venta - Costos
    melShare: number; // 25% of Margen Bruto
    utilidadNeta: number; // Margen Bruto - IVA - MelShare
}

const MEL_SHARE_PERCENTAGE = 0.25;

export function DetailedProjectAnalysis() {
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [debugInfo, setDebugInfo] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [projects, setProjects] = useState<ProjectFinanceData[]>([]);

    useEffect(() => {
        fetchDetailedData();
    }, [selectedMonth]);

    const fetchDetailedData = async () => {
        setLoading(true);
        setErrorMsg(null);
        setDebugInfo("Starting fetch...");
        try {
            const now = new Date().toISOString();
            
            // 1. Fetch PIECES joined with JOBS (Exact pattern from FinancialOverview)
            const { data: piecesData, error: piecesError } = await supabase
                .from('piezas_trabajo')
                .select(`
                    *,
                    trabajo:gestion_trabajos!inner (
                        id, 
                        nombre_proyecto, 
                        estado, 
                        fecha_entrega, 
                        credito_fiscal,
                        cliente_id
                    )
                `)
                .in('trabajo.estado', ['aprobado', 'en_produccion', 'listo', 'entregado']);

            if (piecesError) {
                setErrorMsg(`Error fetching pieces: ${piecesError.message}`);
                throw piecesError;
            }
            
            setDebugInfo(prev => `${prev} | Raw Pieces: ${piecesData?.length || 0}`);
            
            const clientMap: Record<string, string> = {};

            // 2. Add pieces to map and apply date filtering per piece
            const projectMap: Record<string, ProjectFinanceData> = {};
            let hasDataForMonth = false;

            piecesData?.forEach(p => {
                const j = Array.isArray(p.trabajo) ? p.trabajo[0] : p.trabajo; // Safely handle array if Supabase returns one
                if (!j) return;
                
                const dateToUse = j.fecha_entrega || now;
                const monthKey = dateToUse.substring(0, 7);

                // Only process pieces that belong to the selected month
                if (monthKey !== selectedMonth) return;

                hasDataForMonth = true;
                const activeJobId = p.trabajo_id || j.id; // Use real ID

                if (!projectMap[activeJobId]) {
                    projectMap[activeJobId] = {
                        jobId: activeJobId,
                        jobName: j.nombre_proyecto || 'Sin nombre',
                        clientName: 'Cargando...', // Set loading initially, will update below
                        date: dateToUse,
                        status: j.estado,
                        isCreditoFiscal: j.credito_fiscal || false,
                        ventaTotal: 0,
                        costoProduccion: 0,
                        costoExtras: 0,
                        iva: 0,
                        margenBruto: 0,
                        melShare: 0,
                        utilidadNeta: 0
                    };
                }

                const proj = projectMap[activeJobId];
                const qty = p.cantidad || 0;
                proj.ventaTotal += (p.total_venta || 0);

                const matCost = (p.costo_filamento_snapshot || 0) * qty;
                const machCost = ((p.tiempo_impresora_h || 0) * (p.costo_impresora_h_rate || 0)) * qty;
                const modCost = ((p.tiempo_modelado_h || 0) * (p.costo_modelado_h_rate || 0)) * qty;
                const objCost = ((p.costo_objeto_snapshot || 0) * (p.cantidad_objeto_por_pieza || 0)) * qty;

                proj.costoProduccion += (matCost + machCost + modCost + objCost);
            });

            if (!hasDataForMonth) {
                setProjects([]);
                setLoading(false);
                return;
            }

            // 3. Fetch clients (only for the projects we actually have this month)
            const activeJobIds = Object.keys(projectMap);
            const clientIdsToFetch = Array.from(new Set(
                Object.values(projectMap).map(p => {
                    const originalJob = piecesData.find(pd => pd.trabajo_id === p.jobId)?.trabajo;
                    return originalJob?.cliente_id;
                }).filter(Boolean)
            ));

            if (clientIdsToFetch.length > 0) {
                const { data: clients } = await supabase
                    .from('clientes')
                    .select('id, nombre_cliente')
                    .in('id', clientIdsToFetch);
                
                clients?.forEach(c => {
                    // Update all projects that belong to this client
                    Object.values(projectMap).forEach(proj => {
                        const originalJob = piecesData.find(pd => pd.trabajo_id === proj.jobId)?.trabajo;
                        if (originalJob?.cliente_id === c.id) {
                            proj.clientName = c.nombre_cliente;
                        }
                    });
                });
            }

            // 4. Fetch Extras for active jobs
            const { data: extrasData } = await supabase
                .from('extras_aplicados')
                .select('*')
                .in('trabajo_id', activeJobIds);

            extrasData?.forEach(e => {
                const proj = projectMap[e.trabajo_id];
                if (!proj) return;

                if (e.es_venta) proj.ventaTotal += (e.subtotal || 0);
                if (e.es_costo) proj.costoExtras += (e.subtotal || 0);
            });

            // Final Calculations per project
            const result = Object.values(projectMap).map(proj => {
                const totalCosts = proj.costoProduccion + proj.costoExtras;
                proj.margenBruto = proj.ventaTotal - totalCosts;
                
                // IVA 13% if Credito Fiscal
                if (proj.isCreditoFiscal) {
                    proj.iva = proj.ventaTotal * 0.13;
                }

                // Mel Share 25% on Margen Bruto (as per FinancialOverview logic)
                proj.melShare = proj.margenBruto > 0 ? proj.margenBruto * MEL_SHARE_PERCENTAGE : 0;
                
                // Net Utility = Margen Bruto - IVA - Mel Share
                proj.utilidadNeta = proj.margenBruto - proj.iva - proj.melShare;

                return proj;
            }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setProjects(result);
            setDebugInfo(prev => `${prev} | Final Projects: ${result.length}`);
        } catch (error: any) {
            console.error("Error fetching detailed finances:", error);
            setErrorMsg(errorMsg || error.message || "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const handlePrevMonth = () => {
        const date = parseISO(selectedMonth + '-01');
        setSelectedMonth(format(subMonths(date, 1), 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const date = parseISO(selectedMonth + '-01');
        setSelectedMonth(format(addMonths(date, 1), 'yyyy-MM'));
    };

    // Monthly Totals
    const totals = projects.reduce((acc, p) => ({
        venta: acc.venta + p.ventaTotal,
        costo: acc.costo + (p.costoProduccion + p.costoExtras),
        iva: acc.iva + p.iva,
        mel: acc.mel + p.melShare,
        utilidad: acc.utilidad + p.utilidadNeta
    }), { venta: 0, costo: 0, iva: 0, mel: 0, utilidad: 0 });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-naranja" />
                        Análisis Detallado por Proyectos
                    </h2>
                    <p className="text-sm text-gray-500">Desglose de rentabilidad e impuestos por cada trabajo entregado</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-1 rounded-lg border shadow-sm">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-bold uppercase min-w-[120px] text-center text-gray-700">
                        {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: es })}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-blue-500" />
                    <CardContent className="pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Totales</p>
                        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.venta)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-red-500" />
                    <CardContent className="pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">IVA a Declarar (13%)</p>
                        <p className="text-xl font-bold text-red-600">{formatCurrency(totals.iva)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-pink-500" />
                    <CardContent className="pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Retención Mel (25%)</p>
                        <p className="text-xl font-bold text-pink-600">{formatCurrency(totals.mel)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-0 shadow-sm overflow-hidden">
                    <div className="h-1 bg-green-500" />
                    <CardContent className="pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Utilidad Neta Total</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(totals.utilidad)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-0">
                    {/* DEBUG PANEL */}
                    <div className="bg-slate-800 text-green-400 p-2 text-xs font-mono break-all font-bold">
                        [SYS_DEBUG] {debugInfo}
                        {errorMsg && <div className="text-red-400">ERROR: {errorMsg}</div>}
                    </div>
                    
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50">
                                <TableRow>
                                    <TableHead className="font-bold text-gray-700">Proyecto / Cliente</TableHead>
                                    <TableHead className="font-bold text-gray-700">Fecha</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">Venta</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">Costos</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">IVA (13%)</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">Comisión (25%)</TableHead>
                                    <TableHead className="font-bold text-gray-700 text-right">Utilidad Neta</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-naranja mx-auto"></div>
                                        </TableCell>
                                    </TableRow>
                                ) : projects.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                                            No hay proyectos registrados para este mes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    projects.map((p) => (
                                        <TableRow key={p.jobId} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900">{p.jobName}</span>
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        {p.clientName}
                                                        {p.isCreditoFiscal && (
                                                            <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-200 text-blue-600 bg-blue-50">C.F.</Badge>
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-500 whitespace-nowrap">
                                                {format(parseISO(p.date), 'dd MMM yyyy', { locale: es })}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-900">
                                                {formatCurrency(p.ventaTotal)}
                                            </TableCell>
                                            <TableCell className="text-right text-red-500 text-xs">
                                                -{formatCurrency(p.costoProduccion + p.costoExtras)}
                                            </TableCell>
                                            <TableCell className="text-right text-orange-600 font-medium">
                                                {p.iva > 0 ? formatCurrency(p.iva) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right text-pink-600 text-xs">
                                                -{formatCurrency(p.melShare)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`font-bold py-1 px-2 rounded ${p.utilidadNeta > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {formatCurrency(p.utilidadNeta)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-bold">Información sobre los cálculos:</p>
                    <p>• El **IVA** se calcula como el 13% de la venta total solo para proyectos marcados con "Crédito Fiscal".</p>
                    <p>• La **Comisión (25%)** se calcula sobre la Ganancia Bruta (Venta - Costos de Producción).</p>
                    <p>• Los **Costos** incluyen material (filamento), uso de máquina, tiempo de modelado y objetos/extras asociados.</p>
                </div>
            </div>
        </div>
    );
}
