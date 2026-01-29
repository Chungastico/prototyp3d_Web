'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingDown, Activity, Zap, Layers, Box } from 'lucide-react';

interface FinancialMetrics {
    ventas: number;
    gastosMaterial: number;
    gastosMaquina: number;
    gastosModelado: number;
    gastosExtras: number; // Formerly 'gastos'
    gananciaBruta: number;
    gananciaOperativa: number;
    impuestos: number;
    gananciaNeta: number;
}

export function FinancialOverview() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<FinancialMetrics>({
        ventas: 0,
        gastosMaterial: 0,
        gastosMaquina: 0,
        gastosModelado: 0,
        gastosExtras: 0,
        gananciaBruta: 0,
        gananciaOperativa: 0,
        impuestos: 0,
        gananciaNeta: 0
    });
    const [topProducts, setTopProducts] = useState<{name: string, revenue: number, count: number}[]>([]);

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);

        // 1. Fetch Pieces (Sales & Direct Costs)
        const { data: piecesData, error: piecesError } = await supabase
            .from('piezas_trabajo')
            .select(`
                *,
                trabajo:gestion_trabajos!inner (estado)
            `)
            .in('trabajo.estado', ['aprobado', 'en_produccion', 'listo', 'entregado']);

        // 2. Fetch Extras (Additional Sales & Expenses)
        const { data: extrasData, error: extrasError } = await supabase
            .from('extras_aplicados')
            .select(`
                *,
                trabajo:gestion_trabajos (estado)
            `);

        if (piecesError || extrasError) {
            console.error("Error fetching financial data");
            setLoading(false);
            return;
        }

        // --- CALCULATIONS ---

        let ventas = 0;
        let gastosMaterial = 0;
        let gastosMaquina = 0;
        let gastosModelado = 0;
        let gastosExtras = 0;
        
        // Process Pieces
        const productMap = new Map<string, {revenue: number, count: number}>();

        piecesData?.forEach((p: any) => {
            // Revenue
            ventas += (p.total_venta || 0);
            
            // Costs Breakdown
            const qty = p.cantidad || 0;
            // Material
            // Use snapshot if available, otherwise fallback (though snapshot should exist for history)
            const matCostUnit = (p.costo_filamento_snapshot) || 0; 
            gastosMaterial += (matCostUnit * qty);

            // Machine
            const machCostUnit = (p.tiempo_impresora_h || 0) * (p.costo_impresora_h_rate || 0);
            gastosMaquina += (machCostUnit * qty);

            // Modeling
            const modCostUnit = (p.tiempo_modelado_h || 0) * (p.costo_modelado_h_rate || 0);
            gastosModelado += (modCostUnit * qty);

            // Product Analysis
            const current = productMap.get(p.nombre_pieza) || { revenue: 0, count: 0 };
            productMap.set(p.nombre_pieza, {
                revenue: current.revenue + (p.total_venta || 0),
                count: current.count + (p.cantidad || 0)
            });
        });

        // Process Extras
        extrasData?.forEach((e: any) => {
            if (e.es_venta) {
                ventas += (e.subtotal || 0);
            }
            
            if (e.es_costo) {
                // Determine if this is material or generic expense.
                // Since we don't have a strict type for extras, we'll put them in 'Gastos Operativos' (gastosExtras)
                // as requested to separate from "Gastos Filamento" and "Gastos Maquina".
                gastosExtras += (e.subtotal || 0);
            }
        });

        const totalCostosProduccion = gastosMaterial + gastosMaquina + gastosModelado;
        const gananciaBruta = ventas - totalCostosProduccion;
        const gananciaOperativa = gananciaBruta - gastosExtras;
        const impuestos = 0; // 0% placeholder
        const gananciaNeta = gananciaOperativa - impuestos;

        setMetrics({
            ventas,
            gastosMaterial,
            gastosMaquina,
            gastosModelado,
            gastosExtras,
            gananciaBruta,
            gananciaOperativa,
            impuestos,
            gananciaNeta
        });

        // Sort Top Products
        const sortedProducts = Array.from(productMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        
        setTopProducts(sortedProducts);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div></div>;
    }

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Ventas Totales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.ventas)}</div>
                        <p className="text-xs text-gray-500 mt-1">Ingresos brutos</p>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Gastos Filamento</CardTitle>
                        <Layers className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.gastosMaterial)}</div>
                        <p className="text-xs text-gray-500 mt-1">Consumo de material</p>
                    </CardContent>
                </Card>

                 <Card className="bg-white border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Gastos Máquina</CardTitle>
                        <Zap className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.gastosMaquina)}</div>
                        <p className="text-xs text-gray-500 mt-1">Energía y desgaste</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-md bg-gradient-to-br from-green-50 to-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Ganancia Neta</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(metrics.gananciaNeta)}</div>
                        <p className="text-xs text-green-600 mt-1">
                            {metrics.ventas > 0 ? ((metrics.gananciaNeta / metrics.ventas) * 100).toFixed(1) : 0}% Margen Neto
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Income Statement View */}
                <Card className="lg:col-span-2 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Estado de Resultados</CardTitle>
                        <CardDescription>Desglose financiero detallado</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Ventas */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-700">Ventas</span>
                                <span className="font-bold text-gray-900">{formatCurrency(metrics.ventas)}</span>
                            </div>
                            
                            {/* Costs Breakdown */}
                            <div className="space-y-2 pl-3 border-l-2 border-red-100 ml-1">
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-3 w-3" />
                                        <span>(-) Gastos Filamento</span>
                                    </div>
                                    <span className="text-red-500">{formatCurrency(metrics.gastosMaterial)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-3 w-3" />
                                        <span>(-) Gastos Máquina/Luz</span>
                                    </div>
                                    <span className="text-red-500">{formatCurrency(metrics.gastosMaquina)}</span>
                                </div>
                                {metrics.gastosModelado > 0 && (
                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Box className="h-3 w-3" />
                                            <span>(-) Gastos Modelado 3D</span>
                                        </div>
                                        <span className="text-red-500">{formatCurrency(metrics.gastosModelado)}</span>
                                    </div>
                                )}
                            </div>


                            <hr className="border-gray-100" />

                            {/* Ganancia Bruta */}
                            <div className="flex justify-between items-center px-3 font-medium text-gray-800">
                                <span>Ganancia Bruta</span>
                                <span>{formatCurrency(metrics.gananciaBruta)}</span>
                            </div>

                            {/* Gastos */}
                            {metrics.gastosExtras > 0 && (
                                <div className="flex justify-between items-center px-3 text-sm text-red-600">
                                    <span>(-) Otros Gastos Operativos (Extras)</span>
                                    <span>{formatCurrency(metrics.gastosExtras)}</span>
                                </div>
                            )}

                            {/* Ganancia Operativa */}
                            <div className="flex justify-between items-center px-3 font-medium text-gray-800">
                                <span>Ganancia Operativa</span>
                                <span>{formatCurrency(metrics.gananciaOperativa)}</span>
                            </div>

                             {/* Impuestos */}
                             <div className="flex justify-between items-center px-3 text-sm text-gray-500">
                                <span>(-) Impuestos (Est. 0%)</span>
                                <span>{formatCurrency(metrics.impuestos)}</span>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Ganancia Neta */}
                            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                                <span className="font-bold text-green-800 text-lg">Ganancia Neta</span>
                                <span className="font-bold text-green-800 text-lg">{formatCurrency(metrics.gananciaNeta)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products & Distribution */}
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader>
                            <CardTitle>Productos Top</CardTitle>
                            <CardDescription>Por ingresos generados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-gray-800 line-clamp-1">{product.name}</span>
                                            <span className="text-xs text-gray-500">{product.count} unidades</span>
                                        </div>
                                        <span className="font-semibold text-sm text-naranja">
                                            {formatCurrency(product.revenue)}
                                        </span>
                                    </div>
                                ))}
                                {topProducts.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-4">No hay datos suficientes</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost Breakdown Mini-Chart */}
                    <Card className="border-none shadow-md">
                        <CardHeader>
                             <CardTitle>Destino del Dinero</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Material</span>
                                        <span>{metrics.ventas > 0 ? ((metrics.gastosMaterial / metrics.ventas) * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${metrics.ventas > 0 ? (metrics.gastosMaterial / metrics.ventas) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Máquina</span>
                                        <span>{metrics.ventas > 0 ? ((metrics.gastosMaquina / metrics.ventas) * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${metrics.ventas > 0 ? (metrics.gastosMaquina / metrics.ventas) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Ganancia</span>
                                        <span>{metrics.ventas > 0 ? ((metrics.gananciaNeta / metrics.ventas) * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${metrics.ventas > 0 ? (metrics.gananciaNeta / metrics.ventas) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
