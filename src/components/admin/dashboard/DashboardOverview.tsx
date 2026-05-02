'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, LayoutDashboard, DollarSign, Clock, AlertTriangle, Plus, Calculator, Box, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isBefore, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

interface UpcomingJob {
    id: string;
    title: string;
    client: string;
    due: string;
    estado: string;
}

interface DashboardStats {
    activeJobsCount: number;
    upcomingJobs: UpcomingJob[];
    urgentTasks: { id: string; title: string; due: string; estado: string }[];
    lowStockCount: number;
    monthlyRevenue: number;
    monthlyProfit: number;
    piecesThisMonth: number;
}

export function DashboardOverview() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stats, setStats] = useState<DashboardStats>({
        activeJobsCount: 0,
        upcomingJobs: [],
        urgentTasks: [],
        lowStockCount: 0,
        monthlyRevenue: 0,
        monthlyProfit: 0,
        piecesThisMonth: 0
    });
    const [loading, setLoading] = useState(true);

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // ⚡ Bolt: Execute independent queries concurrently to prevent network waterfalls
            const start = startOfMonth(selectedDate).toISOString();
            const end = endOfMonth(selectedDate).toISOString();

            const [
                { data: jobs },
                { data: tasks },
                { count: inventoryCount },
                { data: monthlyJobs }
            ] = await Promise.all([
                // 1. Jobs: Active count & Upcoming 3 Deadlines
                supabase
                    .from('gestion_trabajos')
                    .select('id, nombre_proyecto, fecha_entrega, cliente:clientes(nombre_cliente), estado')
                    .in('estado', ['aprobado', 'en_produccion', 'cotizado'])
                    .order('fecha_entrega', { ascending: true, nullsFirst: false }),

                // 2. Projects: Urgent Tasks
                supabase
                    .from('proyectos_internos_prototyp3d')
                    .select('id, proyecto, fecha_objetivo, estado')
                    .not('fecha_objetivo', 'is', null)
                    .neq('estado', 'Completado')
                    .order('fecha_objetivo', { ascending: true })
                    .limit(3),

                // 3. Inventory: Low Stock (Global)
                supabase
                    .from('inventario_filamento')
                    .select('*', { count: 'exact', head: true }),

                // 4. Monthly Operations & Finances
                supabase
                    .from('gestion_trabajos')
                    .select(`
                        id,
                        estado,
                        monto_cobrado,
                        piezas_trabajo (total_venta, total_costo),
                        extras_aplicados (subtotal, es_venta, es_costo)
                    `)
                    .gte('fecha_entrega', start)
                    .lte('fecha_entrega', end)
                    .neq('estado', 'cancelado')
            ]);

            const activeJobsCount = jobs?.filter(j => j.estado !== 'cotizado').length || 0;
            
            const upcomingJobs = jobs
                ?.filter(j => j.estado === 'aprobado' || j.estado === 'en_produccion')
                .slice(0, 3)
                .map((j: any) => ({
                    id: j.id,
                    title: j.nombre_proyecto,
                    client: j.cliente?.nombre_cliente || 'Sin cliente',
                    due: j.fecha_entrega,
                    estado: j.estado
                })) || [];

            const urgentTasks = tasks?.map(t => ({
                id: t.id,
                title: t.proyecto,
                due: t.fecha_objetivo,
                estado: t.estado
            })) || [];

            let totalRevenue = 0;
            let totalCost = 0;
            let piecesThisMonth = 0;

            if (monthlyJobs) {
                 monthlyJobs.forEach((job: any) => {
                     // Count pieces for operations metric
                     if (job.piezas_trabajo && job.estado !== 'cancelado') {
                         piecesThisMonth += job.piezas_trabajo.length;
                     }

                    if (job.estado === 'cancelado' || job.estado === 'parcialmente_cancelado') {
                        if (job.monto_cobrado) totalRevenue += job.monto_cobrado;
                         if (job.piezas_trabajo) {
                            totalCost += job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_costo || 0), 0);
                        }
                         if (job.extras_aplicados) {
                            totalCost += job.extras_aplicados.reduce((acc: number, e: any) => acc + (e.es_costo ? (e.subtotal || 0) : 0), 0);
                        }
                    } else {
                        if (job.piezas_trabajo) {
                            totalRevenue += job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_venta || 0), 0);
                            totalCost += job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_costo || 0), 0);
                        }
                        if (job.extras_aplicados) {
                            totalRevenue += job.extras_aplicados.reduce((acc: number, e: any) => acc + (e.es_venta ? (e.subtotal || 0) : 0), 0);
                            totalCost += job.extras_aplicados.reduce((acc: number, e: any) => acc + (e.es_costo ? (e.subtotal || 0) : 0), 0);
                        }
                    }
                 });
            }

            setStats({
                activeJobsCount,
                upcomingJobs,
                urgentTasks,
                lowStockCount: inventoryCount || 0,
                monthlyRevenue: totalRevenue,
                monthlyProfit: totalRevenue - totalCost,
                piecesThisMonth
            });

            setLoading(false);
        };

        fetchDashboardData();
    }, [selectedDate]);

    const salarioMel = (stats.monthlyProfit || 0) * 0.25;

    const isUrgent = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        return isBefore(date, new Date()) || isToday(date);
    };

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div></div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            
            {/* Header & Date Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 border-gray-200">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Panel de Operaciones</h2>
                    <p className="text-gray-500 mt-1">Tu resumen de producción y finanzas de Prótotyp3d.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-200 w-fit">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4 rotate-180 text-gray-600" />
                    </Button>
                    <span className="font-semibold text-gray-800 min-w-[120px] text-center capitalize text-sm">
                        {format(selectedDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg hover:bg-gray-100">
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickActionButton 
                    href="/admin/jobs" 
                    icon={<Plus className="h-4 w-4" />} 
                    title="Nuevo Pedido" 
                    color="bg-naranja hover:bg-orange-600 text-white border-transparent" 
                />
                <QuickActionButton 
                    href="/admin/calculadora-express" 
                    icon={<Calculator className="h-4 w-4 text-blue-600" />} 
                    title="Calculadora" 
                    color="bg-white hover:bg-blue-50 text-gray-800 border-gray-200 hover:border-blue-200" 
                />
                <QuickActionButton 
                    href="/admin/inventory" 
                    icon={<Package className="h-4 w-4 text-purple-600" />} 
                    title="Inventario" 
                    color="bg-white hover:bg-purple-50 text-gray-800 border-gray-200 hover:border-purple-200" 
                />
                <QuickActionButton 
                    href="/admin/projects" 
                    icon={<LayoutDashboard className="h-4 w-4 text-teal-600" />} 
                    title="Proyectos" 
                    color="bg-white hover:bg-teal-50 text-gray-800 border-gray-200 hover:border-teal-200" 
                />
            </div>

            {/* ROW 1: Actionable Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Upcoming Jobs */}
                <Card className="col-span-1 shadow-sm border-gray-200 flex flex-col h-full">
                    <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold text-orange-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            Entregas Próximas
                        </CardTitle>
                        <Link href="/admin/jobs" className="text-xs text-orange-600 font-medium hover:underline">Ver todos</Link>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {stats.upcomingJobs.length > 0 ? (
                            <div className="space-y-4">
                                {stats.upcomingJobs.map((job) => (
                                    <div key={job.id} className="flex justify-between items-start border-l-2 pl-3 border-orange-300">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{job.title}</p>
                                            <p className="text-xs text-gray-500">{job.client}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUrgent(job.due) ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {format(new Date(job.due), "d MMM", { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6">
                                <CheckCircle2 className="h-8 w-8 text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No hay entregas pendientes</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Priority Projects */}
                <Card className="col-span-1 shadow-sm border-gray-200 flex flex-col h-full">
                    <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-base font-semibold text-blue-900 flex items-center gap-2">
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                            Proyectos Internos
                        </CardTitle>
                        <Link href="/admin/projects" className="text-xs text-blue-600 font-medium hover:underline">Ver panel</Link>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1">
                        {stats.urgentTasks.length > 0 ? (
                            <div className="space-y-4">
                                {stats.urgentTasks.map((task) => (
                                    <div key={task.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{task.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{task.estado}</p>
                                        </div>
                                        <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                                            {format(new Date(task.due), "d MMM", { locale: es })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-8">Sin proyectos prioritarios</p>
                        )}
                    </CardContent>
                </Card>

                {/* Inventory Alert */}
                <Card className="col-span-1 shadow-sm border-gray-200 flex flex-col h-full bg-slate-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Package className="h-4 w-4 text-purple-500" />
                            Estado del Inventario
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2 flex flex-col justify-center flex-1">
                         <div className="flex items-end gap-2 mb-4">
                            <span className="text-4xl font-bold text-gray-800">{stats.lowStockCount}</span>
                            <span className="text-sm text-gray-500 mb-1">Items registrados</span>
                         </div>
                         <div className="bg-white p-3 rounded-lg border border-purple-100 flex items-start gap-3 shadow-sm mt-auto">
                            <div className="bg-purple-100 p-2 rounded-full mt-0.5">
                                <AlertTriangle className="h-4 w-4 text-purple-700" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">Actualizar Stock</p>
                                <p className="text-xs text-gray-500 mt-0.5">Recuerda registrar el material gastado de tus impresiones.</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* ROW 2: Monthly Production Performance */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <Box className="h-7 w-7 text-naranja" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Trabajos Activos</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-gray-900">{stats.activeJobsCount}</span>
                                <span className="text-sm text-green-600 font-medium">Pedidos</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 flex items-center gap-5 bg-gray-50/50">
                        <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Package className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Producción ({format(selectedDate, 'MMM', { locale: es })})</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <span className="text-3xl font-bold text-gray-900">{stats.piecesThisMonth}</span>
                                <span className="text-sm text-gray-500 font-medium">Piezas impresas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* ROW 3: Finances (Moved to bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                 {/* FINANCES */}
                <Card className="shadow-md border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-400" />
                            Ingresos ({format(selectedDate, 'MMMM', { locale: es })})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-white mb-4">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(stats.monthlyRevenue)}
                        </div>
                        <Link href="/admin/finances">
                            <Button variant="secondary" size="sm" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-0 transition-colors">
                                Ver Reporte Financiero <ArrowRight className="ml-2 w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* SALARIO MEL WIDGET */}
                <Card className="shadow-sm border-gray-200 bg-white">
                    <CardHeader className="pb-2">
                         <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-pink-500" />
                            Salario Mel ({format(selectedDate, 'MMM', { locale: es })})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(salarioMel)}
                        </div>
                        <div className="inline-flex items-center text-xs font-semibold text-pink-700 bg-pink-100 px-2 py-1 rounded">
                            25% de Ganancia Neta
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function QuickActionButton({ href, icon, title, color }: { href: string, icon: React.ReactNode, title: string, color: string }) {
    return (
        <Link href={href} className="block group">
            <div className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow ${color}`}>
                <div className="mb-1">{icon}</div>
                <span className="text-sm font-semibold">{title}</span>
            </div>
        </Link>
    );
}

