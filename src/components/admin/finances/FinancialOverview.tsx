'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PiezaTrabajo, ExtraAplicado } from '@/components/admin/jobs/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Activity } from 'lucide-react';

interface FinancialMetrics {
    ventas: number;
    costoVentas: number;
    gananciaBruta: number;
    gastos: number;
    gananciaOperativa: number;
    impuestos: number;
    gananciaNeta: number;
}

export function FinancialOverview() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<FinancialMetrics>({
        ventas: 0,
        costoVentas: 0,
        gananciaBruta: 0,
        gastos: 0,
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
        // We only consider approved or completed jobs for "Realized" financials, 
        // but often dashboards show everything. Let's filter for finalized/in-progress to be realistic.
        // Actually, user probably wants to see everything that is 'sold'.
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
        let costoVentas = 0;
        let gastos = 0;
        
        // Process Pieces
        const productMap = new Map<string, {revenue: number, count: number}>();

        piecesData?.forEach((p: any) => {
            // Revenue
            ventas += (p.total_venta || 0);
            
            // COGS (Direct Cost of the piece)
            costoVentas += (p.total_costo || 0);

            // Product Analysis
            const current = productMap.get(p.nombre_pieza) || { revenue: 0, count: 0 };
            productMap.set(p.nombre_pieza, {
                revenue: current.revenue + (p.total_venta || 0),
                count: current.count + (p.cantidad || 0)
            });
        });

        // Process Extras
        extrasData?.forEach((e: any) => {
            // Only count extras if attached to a valid job (or global/loose extras if allowed)
            // For now, let's assume all fetched extras are valid.
            
            if (e.es_venta) {
                ventas += (e.subtotal || 0);
            }
            
            if (e.es_costo) {
                // If it's a cost, is it COGS or Expense?
                // Usually "ExtraMaterial" might be COGS, "Shipping" might be Expense.
                // For simplicity: All 'Extras' marked as cost are Operating Expenses (Gastos) unless specified.
                // Or we could treat them as COGS if they are attached to a piece. 
                // Let's assume they are Gastos for this simplified view.
                gastos += (e.subtotal || 0);
            }
        });

        const gananciaBruta = ventas - costoVentas;
        const gananciaOperativa = gananciaBruta - gastos;
        const impuestos = 0; // 0% placeholder
        const gananciaNeta = gananciaOperativa - impuestos;

        setMetrics({
            ventas,
            costoVentas,
            gananciaBruta,
            gastos,
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
                        <CardTitle className="text-sm font-medium text-gray-500">Costo de Ventas</CardTitle>
                        <CreditCard className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.costoVentas)}</div>
                        <p className="text-xs text-gray-500 mt-1">Material y producción</p>
                    </CardContent>
                </Card>
                 <Card className="bg-white border-none shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Gastos Operativos</CardTitle>
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.gastos)}</div>
                        <p className="text-xs text-gray-500 mt-1">Extras y servicios</p>
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
                        <CardDescription>Desglose financiero del periodo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Ventas */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold text-gray-700">Ventas</span>
                                <span className="font-bold text-gray-900">{formatCurrency(metrics.ventas)}</span>
                            </div>
                            
                            {/* Costo de Ventas */}
                            <div className="flex justify-between items-center px-3 text-sm text-red-600">
                                <span>(-) Costo de Ventas</span>
                                <span>{formatCurrency(metrics.costoVentas)}</span>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Ganancia Bruta */}
                            <div className="flex justify-between items-center px-3 font-medium text-gray-800">
                                <span>Ganancia Bruta</span>
                                <span>{formatCurrency(metrics.gananciaBruta)}</span>
                            </div>

                            {/* Gastos */}
                            <div className="flex justify-between items-center px-3 text-sm text-red-600">
                                <span>(-) Gastos Operativos</span>
                                <span>{formatCurrency(metrics.gastos)}</span>
                            </div>

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
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Costo Prod.</span>
                                        <span>{metrics.ventas > 0 ? ((metrics.costoVentas / metrics.ventas) * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${metrics.ventas > 0 ? (metrics.costoVentas / metrics.ventas) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Gastos</span>
                                        <span>{metrics.ventas > 0 ? ((metrics.gastos / metrics.ventas) * 100).toFixed(0) : 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${metrics.ventas > 0 ? (metrics.gastos / metrics.ventas) * 100 : 0}%` }}></div>
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
