'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, Activity, Zap, Layers, Box, PiggyBank, Briefcase, UserMinus, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface FinancialMetrics {
    ventas: number;
    gastosMaterial: number;
    gastosMaquina: number;
    gastosModelado: number;
    gastosExtras: number; // Extras applied in orders
    gastosManuales: number; // From transacciones_financieras (marketing, etc)
    capitalInvertido: number; // From transacciones_financieras
    gananciaBruta: number;
    gananciaOperativa: number;
    impuestos: number;
    gananciaNeta: number;
    saldoTotal: number; // Actual cash on hand
    
    // Mel Logic
    melShareTotal: number; // Total accumulated share for Mel (25%)
    melPaid: number;      // Total paid to Mel
    melPending: number;   // Current debt to Mel
    capitalLibre: number; // SaldoTotal - FondoAhorro - MelPending
}

const MEL_SHARE_PERCENTAGE = 0.25;

export function FinancialOverview() {
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<FinancialMetrics>({
        ventas: 0, gastosMaterial: 0, gastosMaquina: 0, gastosModelado: 0, gastosExtras: 0, gastosManuales: 0,
        capitalInvertido: 0, gananciaBruta: 0, gananciaOperativa: 0, impuestos: 0, gananciaNeta: 0, saldoTotal: 0,
        melShareTotal: 0, melPaid: 0, melPending: 0, capitalLibre: 0
    });
    
    // Monthly Analysis State
    const [monthlyData, setMonthlyData] = useState<Record<string, any>>({});
    const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [availableMonths, setAvailableMonths] = useState<string[]>([]);

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);

        try {
            // 1. Fetch Pieces (Sales & Direct Costs)
            const { data: piecesData, error: piecesError } = await supabase
                .from('piezas_trabajo')
                .select(`
                    *,
                    trabajo:gestion_trabajos!inner (estado, fecha_entrega)
                `)
                .in('trabajo.estado', ['aprobado', 'en_produccion', 'listo', 'entregado']);

            if (piecesError) throw piecesError;

            // 2. Fetch Extras
            const { data: extrasData, error: extrasError } = await supabase
                .from('extras_aplicados')
                .select(`
                    *,
                    trabajo:gestion_trabajos (estado, fecha_entrega)
                `);
            
            // 3. Fetch Manual Transactions
            const { data: transactionsData, error: transError } = await supabase
                .from('transacciones_financieras')
                .select('*');

            // --- GLOBAL AGGREGATION ---
            let ventas = 0;
            let gastosMaterial = 0;
            let gastosMaquina = 0;
            let gastosModelado = 0;
            let gastosExtras = 0;
            let gastosManuales = 0;
            let capitalInvertido = 0;
            let melShareTotal = 0;
            let melPaid = 0;

            // Monthly Buckets
            const months: Record<string, any> = {};

            const getMonthKey = (dateStr: string) => {
                if (!dateStr) return 'Unknown';
                return dateStr.substring(0, 7); // YYYY-MM
            };

            const initMonth = (key: string) => {
                if (!months[key]) {
                    months[key] = {
                        ventasProyectos: 0, 
                        ingresosManuales: 0,
                        material: 0, 
                        maquina: 0, 
                        modelado: 0, 
                        extrasCosto: 0, 
                        gastosManuales: 0, 
                        melShare: 0, 
                        melPaid: 0
                    };
                }
            };

            // Process Pieces
            piecesData?.forEach((p: any) => {
                const date = p.trabajo?.fecha_entrega || new Date().toISOString(); 
                const monthKey = getMonthKey(date);
                initMonth(monthKey);

                const qty = p.cantidad || 0;
                const sale = p.total_venta || 0;
                
                // Costs
                const matCost = (p.costo_filamento_snapshot || 0) * qty;
                const machCost = ((p.tiempo_impresora_h || 0) * (p.costo_impresora_h_rate || 0)) * qty;
                const modCost = ((p.tiempo_modelado_h || 0) * (p.costo_modelado_h_rate || 0)) * qty;

                // Profit per piece for Mel Share
                // Gross Profit per item = Sale - (Mat + Mach + Mod)
                const grossProfitItem = sale - (matCost + machCost + modCost);
                const itemMelShare = grossProfitItem > 0 ? grossProfitItem * MEL_SHARE_PERCENTAGE : 0;

                // Global Accumulators
                ventas += sale;
                gastosMaterial += matCost;
                gastosMaquina += machCost;
                gastosModelado += modCost;
                melShareTotal += itemMelShare;

                // Monthly Accumulators
                months[monthKey].ventasProyectos += sale;
                months[monthKey].material += matCost;
                months[monthKey].maquina += machCost;
                months[monthKey].modelado += modCost;
                months[monthKey].melShare += itemMelShare;
            });

            // Process Extras
            extrasData?.forEach((e: any) => {
                const date = e.trabajo?.fecha_entrega || new Date().toISOString();
                const monthKey = getMonthKey(date);
                initMonth(monthKey);

                if (e.es_venta) {
                    ventas += (e.subtotal || 0);
                    months[monthKey].ventasProyectos += (e.subtotal || 0);
                }
                if (e.es_costo) {
                    gastosExtras += (e.subtotal || 0);
                    months[monthKey].extrasCosto += (e.subtotal || 0);
                }
            });

            // Process Transactions
            transactionsData?.forEach((t: any) => {
                const monthKey = getMonthKey(t.fecha);
                initMonth(monthKey);

                if (t.tipo === 'ingreso') {
                    capitalInvertido += (t.monto || 0);
                    months[monthKey].ingresosManuales += (t.monto || 0);
                } else if (t.tipo === 'gasto') {
                    // Check if it's a payment to Mel
                    const isMelPayment = t.categoria?.toLowerCase().includes('mel') || t.descripcion?.toLowerCase().includes('mel');
                    
                    if (isMelPayment) {
                        melPaid += (t.monto || 0);
                        months[monthKey].melPaid += (t.monto || 0);
                    } else {
                        // Regular operational expense
                        gastosManuales += (t.monto || 0);
                        months[monthKey].gastosManuales += (t.monto || 0);
                    }
                }
            });

            // Derived Global Metrics
            const totalIngresos = ventas + capitalInvertido;
            // Real outflows for Cash Balance: Material, Extras, Manual Ops.
            // *Machine & Modeling are internal 'Savings', so they stay in Cash (SaldoTotal).
            // *Mel Paid is a real outflow.
            const totalEgresosReales = gastosMaterial + gastosExtras + gastosManuales + melPaid;
            const saldoTotal = totalIngresos - totalEgresosReales;

            // Current Month Logic for Debt
            const currentMonthKey = format(new Date(), 'yyyy-MM');
            const currentMonthShare = months[currentMonthKey]?.melShare || 0;

            const melPending = (melShareTotal - currentMonthShare) - melPaid;
            
            // Capital Libre = Saldo Total - (Fondo Maquina + Fondo Modelado) - Deuda Mel
            // Note: We keep currentMonthShare in Capital Libre logic? 
            // If Mel's share sits in cash until month end, it is technically "encumbered" but not "payable".
            // Let's treat it as encumbered cash for safety.
            const capitalLibre = saldoTotal - (gastosMaquina + gastosModelado) - melPending - currentMonthShare;

            setMetrics({
                ventas, gastosMaterial, gastosMaquina, gastosModelado, gastosExtras, gastosManuales, capitalInvertido,
                gananciaBruta: ventas - (gastosMaterial + gastosMaquina + gastosModelado), // Global approx
                gananciaOperativa: 0, impuestos: 0, gananciaNeta: 0, // Not used much in new view
                saldoTotal,
                melShareTotal, melPaid, melPending, capitalLibre
            });

            setMonthlyData(months);
            setAvailableMonths(Object.keys(months).sort().reverse());
           
        } catch (error) {
            console.error("Error calculating finances:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    // --- Monthly Calculations Helper ---
    const getMonthStats = () => {
        const data = monthlyData[selectedMonth] || { 
            ventasProyectos: 0, ingresosManuales: 0,
            material: 0, maquina: 0, modelado: 0, extrasCosto: 0, 
            gastosManuales: 0, melShare: 0, melPaid: 0 
        };
        
        // Use fallbacks for backward compatibility (HMR/State issues)
        const ventasProyectos = data.ventasProyectos ?? data.ventas ?? 0;
        const ingresosManuales = data.ingresosManuales ?? data.capital ?? 0;
        const totalIngresos = ventasProyectos + ingresosManuales;
        
        const material = data.material ?? 0;
        const maquina = data.maquina ?? 0;
        const modelado = data.modelado ?? 0;
        const extrasCosto = data.extrasCosto ?? data.extras ?? 0;
        
        const costosProduccion = material + maquina + modelado + extrasCosto;
        const gananciaBruta = totalIngresos - costosProduccion;
        
        const gastosManuales = data.gastosManuales ?? data.manuales ?? 0;
        const participacionMel = data.melShare ?? 0;
        const melPaid = data.melPaid ?? 0;
        
        const gastosOperativos = gastosManuales;
        
        const gananciaNetaMensual = gananciaBruta - gastosOperativos - participacionMel;

        return {
            ventasProyectos,
            ingresosManuales,
            totalIngresos,
            
            material,
            maquina,
            modelado,
            extrasCosto,
            costosProduccion,

            gananciaBruta,
            
            gastosManuales,
            participacionMel,
            melPaid,
            gananciaNetaMensual
        };
    };

    const mStats = getMonthStats();

    // Navigation Handlers
    const handlePrevMonth = () => {
        const date = parseISO(selectedMonth + '-01');
        setSelectedMonth(format(subMonths(date, 1), 'yyyy-MM'));
    };

    const handleNextMonth = () => {
        const date = parseISO(selectedMonth + '-01');
        setSelectedMonth(format(addMonths(date, 1), 'yyyy-MM'));
    };

    // Payment Modal State
    const [isPayModalOpen, setIsPayModalOpen] = useState(false);
    const [payAmount, setPayAmount] = useState('');
    const [payDate, setPayDate] = useState('');
    const [payNotes, setPayNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenPayModal = () => {
        // Default amount: The pending balance for THIS MONTH?
        // User wants to pay "what is generated".
        // Let's suggest the share amount if nothing is paid, or the difference.
        const share = mStats.participacionMel;
        const paid = mStats.melPaid;
        const pendingMonth = share - paid;

        setPayAmount(pendingMonth > 0 ? pendingMonth.toFixed(2) : '');
        setPayDate(selectedMonth + '-01'); // Default to 1st of selected month to ensure it lands in calculations
        setPayNotes('');
        setIsPayModalOpen(true);
    };

    const handleSavePayment = async () => {
        if (!payAmount) return;
        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('transacciones_financieras')
                .insert([{
                    tipo: 'gasto',
                    categoria: 'Pago a Mel',
                    descripcion: `Pago de utilidades a Mel (${format(parseISO(payDate), 'MMMM yyyy', { locale: es })})`,
                    monto: parseFloat(payAmount),
                    fecha: payDate,
                    notas: payNotes
                }]);

            if (error) throw error;

            setIsPayModalOpen(false);
            fetchFinancialData(); // Refresh data
        } catch (error) {
            console.error("Error saving payment:", error);
            alert("Error al registrar el pago.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-naranja"></div></div>;

    return (
        <div className="space-y-8">
            {/* GLOBAL KPI CARDS */}
            <h2 className="text-xl font-bold text-gray-800">Situación Global</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white shadow-sm border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Saldo en Caja (Total)</CardTitle>
                        <Briefcase className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-700">{formatCurrency(metrics.saldoTotal)}</div>
                        <div className="text-xs text-gray-400 mt-1 flex flex-col gap-0.5">
                            <span>Dinero físico disponible hoy</span>

                        </div>
                    </CardContent>
                </Card>

                 <Card className="bg-blue-50/50 shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Fondo Ahorro (Máquina + Modelado)</CardTitle>
                        <PiggyBank className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.gastosMaquina + metrics.gastosModelado)}</div>
                        <p className="text-xs text-blue-600 mt-1">Acumulado Histórico</p>
                    </CardContent>
                </Card>

                <Card className="bg-green-50/50 shadow-sm border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Capital Libre (Real)</CardTitle>
                        <Activity className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{formatCurrency(metrics.capitalLibre)}</div>
                        <p className="text-xs text-green-600 mt-1">Libre de polvo y paja</p>
                    </CardContent>
                </Card>
            </div>

            <hr className="border-gray-200" />

            {/* MONTHLY ANALYSIS SECTION */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            Análisis Mensual
                        </h2>
                        <p className="text-sm text-gray-500">Desglose de rendimiento por periodo</p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white p-1 rounded-lg border shadow-sm">
                        <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium uppercase min-w-[120px] text-center">
                            {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: es })}
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Monthly Breakdown Card */}
                     <Card className="lg:col-span-2 shadow-md border-0">
                        <CardHeader className="bg-gray-50/50 pb-4">
                            <CardTitle className="text-lg">Estado de Resultados ({format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: es })})</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-5">
                            {/* INGRESOS */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">INGRESOS</h3>
                                <div className="space-y-1 pl-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Ventas de Proyectos</span>
                                        <span className="font-medium text-gray-800">{formatCurrency(mStats.ventasProyectos)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Ingresos Externos (Capital)</span>
                                        <span className="font-medium text-gray-800">{formatCurrency(mStats.ingresosManuales)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-base font-semibold text-blue-700 pt-1 border-t border-dashed">
                                        <span>Total Ingresos</span>
                                        <span>{formatCurrency(mStats.totalIngresos)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* COSTOS DE PRODUCCION (Variable) */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">COSTOS DE PRODUCCIÓN (PIEZAS)</h3>
                                <div className="space-y-1 pl-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Material (Filamento)</span>
                                        <span className="text-red-500">-{formatCurrency(mStats.material)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Uso Maquina (Depreciación/Ahorro)</span>
                                        <span className="text-red-500">-{formatCurrency(mStats.maquina)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Modelado 3D</span>
                                        <span className="text-red-500">-{formatCurrency(mStats.modelado)}</span>
                                    </div>
                                     {mStats.extrasCosto > 0 && (
                                        <div className="flex justify-between text-sm text-gray-600">
                                            <span>Extras (Costos)</span>
                                            <span className="text-red-500">-{formatCurrency(mStats.extrasCosto)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm font-medium text-gray-700 pt-1 border-t border-dashed">
                                        <span>Total Costos Producción</span>
                                        <span className="text-red-600">-{formatCurrency(mStats.costosProduccion)}</span>
                                    </div>
                                </div>
                            </div>

                             {/* MARGIN CHECK */}
                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm font-medium text-gray-700">
                                <span>= Ganancia Bruta (Ingresos - Costos Prod.)</span>
                                <span>{formatCurrency(mStats.gananciaBruta)}</span>
                            </div>

                            {/* GASTOS OPERATIVOS (Fixed/External) */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">GASTOS OPERATIVOS / OBLIGACIONES</h3>
                                <div className="space-y-1 pl-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Gastos Generales (Manuales)</span>
                                        <span className="text-red-500">-{formatCurrency(mStats.gastosManuales)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium text-pink-600 bg-pink-50 p-1 rounded">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3" />
                                            <span>Participación Mel (25%)</span>
                                        </div>
                                        <span className="text-red-500">-{formatCurrency(mStats.participacionMel)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-200" />

                            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg">
                                <span className="text-xl font-bold text-green-800">Ganancia Neta (Tuya)</span>
                                <span className="text-xl font-bold text-green-800">{formatCurrency(mStats.gananciaNetaMensual)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Monthly Summary Cards (Right Side) */}
                    <div className="space-y-4">
                        {/* Monthly Settlement Card */}
                        {(() => {
                            const selectedDate = parseISO(selectedMonth + '-01');
                            const currentDate = new Date();
                            const isFuture = selectedDate > endOfMonth(currentDate);
                            const isCurrent = isWithinInterval(currentDate, { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) });
                            const isPast = selectedDate < startOfMonth(currentDate);

                            let cardStatus = 'neutral'; // neutral, success, warning, error
                            let statusText = '';
                            let buttonText = '';
                            let isButtonDisabled = false;

                            if (isFuture) {
                                cardStatus = 'neutral';
                                statusText = 'AÚN NO DISPONIBLE';
                                buttonText = 'Próximamente';
                                isButtonDisabled = true;
                            } else if (isCurrent) {
                                cardStatus = 'warning';
                                statusText = 'EN CURSO (ACUMULANDO)';
                                buttonText = 'Disponible al cierre de mes';
                                isButtonDisabled = true;
                            } else {
                                // Past Month - Ready for Settlement
                                const balance = mStats.participacionMel - mStats.melPaid;
                                if (balance > 0.01) {
                                    cardStatus = 'error'; // Red
                                    statusText = formatCurrency(balance);
                                    buttonText = 'Registrar Pago Pendiente';
                                } else if (balance < -0.01) {
                                    cardStatus = 'success'; // Green
                                    statusText = `Saldo a Favor: ${formatCurrency(Math.abs(balance))}`;
                                    buttonText = 'Registrar Pago Extra';
                                } else {
                                    cardStatus = 'success'; // Green
                                    statusText = 'AL DÍA';
                                    buttonText = 'Registrar Pago Extra';
                                }
                            }

                            const getCardStyle = () => {
                                switch (cardStatus) {
                                    case 'error': return 'bg-red-50/50 border-l-red-500';
                                    case 'success': return 'bg-green-50/50 border-l-green-500';
                                    case 'warning': return 'bg-yellow-50/50 border-l-yellow-500';
                                    default: return 'bg-gray-50/50 border-l-gray-400';
                                }
                            };

                            const getTextStyle = () => {
                                switch (cardStatus) {
                                    case 'error': return 'text-red-700';
                                    case 'success': return 'text-green-700';
                                    case 'warning': return 'text-yellow-700';
                                    default: return 'text-gray-500';
                                }
                            };

                            return (
                                <Card className={`shadow-sm border-l-4 ${getCardStyle()}`}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className={`text-sm font-medium ${getTextStyle()}`}>
                                            Liquidación Mel ({format(selectedDate, 'MMMM', { locale: es })})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className={`text-2xl font-bold ${getTextStyle()}`}>
                                            {statusText}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                            <span>Generado: {formatCurrency(mStats.participacionMel)}</span>
                                            <span>Pagado: {formatCurrency(mStats.melPaid)}</span>
                                        </div>

                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            className={`w-full mt-3 bg-white ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''} border-${cardStatus === 'neutral' ? 'gray' : cardStatus === 'warning' ? 'yellow' : cardStatus === 'error' ? 'red' : 'green'}-200 text-${cardStatus === 'neutral' ? 'gray' : cardStatus === 'warning' ? 'yellow' : cardStatus === 'error' ? 'red' : 'green'}-700`}
                                            onClick={handleOpenPayModal}
                                            disabled={isButtonDisabled}
                                        >
                                            {buttonText}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        <Card className="bg-white shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Margen Neto Mensual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-800">
                                    {mStats.totalIngresos > 0 ? ((mStats.gananciaNetaMensual / mStats.totalIngresos) * 100).toFixed(1) : 0}%
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {isPayModalOpen && (
                 <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Registrar Pago a Mel</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Pago</label>
                                <input 
                                    type="date"
                                    value={payDate}
                                    onChange={(e) => setPayDate(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-naranja focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                    <input 
                                        type="number"
                                        value={payAmount}
                                        onChange={(e) => setPayAmount(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-naranja focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Deuda actual: {formatCurrency(metrics.melPending)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Referencia</label>
                                <input 
                                    type="text"
                                    value={payNotes}
                                    onChange={(e) => setPayNotes(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-naranja focus:outline-none"
                                    placeholder="Ej. Transferencia Bco Agricola"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setIsPayModalOpen(false)}>Cancelar</Button>
                            <Button 
                                onClick={handleSavePayment} 
                                disabled={isSubmitting || !payAmount}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {isSubmitting ? 'Registrando...' : 'Confirmar Pago'}
                            </Button>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
}
