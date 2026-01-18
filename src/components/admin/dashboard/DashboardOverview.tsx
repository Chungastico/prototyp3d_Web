'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, ShoppingCart, LayoutDashboard, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
    activeJobsCount: number;
    nextDeadline: string | null;
    urgentTasks: { id: string; title: string; due: string }[];
    lowStockCount: number;
    monthlyRevenue: number;
    monthlyProfit: number;
}

export function DashboardOverview() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [stats, setStats] = useState<DashboardStats>({
        activeJobsCount: 0,
        nextDeadline: null,
        urgentTasks: [],
        lowStockCount: 0,
        monthlyRevenue: 0,
        monthlyProfit: 0
    });
    const [loading, setLoading] = useState(true);

    const handlePrevMonth = () => setSelectedDate(prev => subMonths(prev, 1));
    const handleNextMonth = () => setSelectedDate(prev => addMonths(prev, 1));

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // 1. Jobs: Active count & Next Deadline (Global)
            const { data: jobs } = await supabase
                .from('gestion_trabajos')
                .select('fecha_entrega, estado')
                .in('estado', ['aprobado', 'en_produccion'])
                .order('fecha_entrega', { ascending: true });

            const activeJobsCount = jobs?.length || 0;
            const nextDeadline = jobs && jobs.length > 0 ? jobs[0].fecha_entrega : null;

            // 2. Projects: Urgent Tasks (Global)
            const { data: tasks } = await supabase
                .from('proyectos_internos_prototyp3d')
                .select('id, proyecto, fecha_objetivo')
                .not('fecha_objetivo', 'is', null)
                .neq('estado', 'Completado')
                .order('fecha_objetivo', { ascending: true })
                .limit(3);

            const urgentTasks = tasks?.map(t => ({
                id: t.id,
                title: t.proyecto,
                due: t.fecha_objetivo
            })) || [];

            // 3. Inventory: Low Stock (Global)
            const { count: inventoryCount } = await supabase
                .from('inventario_filamento')
                .select('*', { count: 'exact', head: true });

            // 4. Finances: Revenue & Profit (Filtered by Month)
            const start = startOfMonth(selectedDate).toISOString();
            const end = endOfMonth(selectedDate).toISOString();

            // Filter jobs by 'fecha_entrega' within the month
            const { data: monthlyJobs } = await supabase
                .from('gestion_trabajos')
                .select(`
                    id,
                    piezas_trabajo (total_venta, total_costo),
                    extras_aplicados (subtotal, es_venta, es_costo)
                `)
                .gte('fecha_entrega', start)
                .lte('fecha_entrega', end)
                .neq('estado', 'cancelado');

            let totalRevenue = 0;
            let totalCost = 0;

            if (monthlyJobs) {
                 monthlyJobs.forEach((job: any) => {
                    // IF Cancelled/Partially Cancelled: Use monto_cobrado
                    if (job.estado === 'cancelado' || job.estado === 'parcialmente_cancelado') {
                        if (job.monto_cobrado) {
                            totalRevenue += job.monto_cobrado;
                            // Profit calc for cancelled jobs? 
                            // Assuming cost is 0 or we already spent it? 
                            // For simplicity, let's assume if it's cancelled, the 'monto_cobrado' is purely what we got,
                            // but we likely still incurred costs.
                            // However, 'piezas_trabajo' might still exist.
                        }
                    } else {
                        // Standard Jobs
                        // Sum pieces
                        if (job.piezas_trabajo) {
                            const piecesSum = job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_venta || 0), 0);
                            const piecesCostSum = job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_costo || 0), 0);
                            totalRevenue += piecesSum;
                            totalCost += piecesCostSum;
                        }
                        // Sum extras
                        if (job.extras_aplicados) {
                            const extrasSum = job.extras_aplicados.reduce((acc: number, e: any) => {
                                return acc + (e.es_venta ? (e.subtotal || 0) : 0);
                            }, 0);
                            const extrasCostSum = job.extras_aplicados.reduce((acc: number, e: any) => {
                                return acc + (e.es_costo ? (e.subtotal || 0) : 0);
                            }, 0);
                            totalRevenue += extrasSum;
                            totalCost += extrasCostSum;
                        }
                    }

                    // EVEN IF CANCELLED, we might want to subtract costs if we already printed things?
                    // For now, let's keep it simple: If cancelled, we only count revenue from 'monto_cobrado'. 
                    // AND we still subtract costs of pieces if they exist?
                    // Better approach: Always subtract costs of pieces created (material used).
                    if (job.estado === 'cancelado' || job.estado === 'parcialmente_cancelado') {
                         if (job.piezas_trabajo) {
                            const piecesCostSum = job.piezas_trabajo.reduce((acc: number, p: any) => acc + (p.total_costo || 0), 0);
                            totalCost += piecesCostSum;
                        }
                         if (job.extras_aplicados) {
                            const extrasCostSum = job.extras_aplicados.reduce((acc: number, e: any) => {
                                return acc + (e.es_costo ? (e.subtotal || 0) : 0);
                            }, 0);
                            totalCost += extrasCostSum;
                        }
                    }
                 });
            }

            const totalProfit = totalRevenue - totalCost;

            setStats({
                activeJobsCount,
                nextDeadline,
                urgentTasks,
                lowStockCount: inventoryCount || 0,
                monthlyRevenue: totalRevenue,
                monthlyProfit: totalProfit
            });

            setLoading(false);
        };

        fetchDashboardData();
    }, [selectedDate]);

    // Salario Mel is 25% of PROFIT (Ganancia)
    const salarioMel = (stats.monthlyProfit || 0) * 0.25;

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div></div>;
    }

    return (
        <div className="space-y-6">
            
            {/* Header / Filter */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
                <div className="flex items-center gap-4 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ArrowRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <span className="font-semibold text-gray-700 min-w-[140px] text-center capitalize">
                        {format(selectedDate, 'MMMM yyyy', { locale: es })}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* JOBS WIDGET */}
                <DashboardCard 
                    title="Pedidos En Curso" 
                    icon={<ShoppingCart className="h-5 w-5 text-naranja" />}
                    href="/admin/jobs"
                    color="border-l-4 border-naranja"
                >
                    <div className="flex flex-col gap-2">
                        <div className="text-3xl font-bold text-gray-800">
                            {stats.activeJobsCount}
                        </div>
                        <p className="text-sm text-gray-500">Pedidos activos ahora</p>
                        
                        {stats.nextDeadline && (
                            <div className="mt-4 flex items-center p-2 bg-orange-50 rounded text-sm text-orange-800">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Entrega: {format(new Date(stats.nextDeadline), "d 'de' MMMM", { locale: es })}</span>
                            </div>
                        )}
                    </div>
                </DashboardCard>

                {/* PROJECTS WIDGET */}
                <DashboardCard 
                    title="Proyectos Prioritarios" 
                    icon={<LayoutDashboard className="h-5 w-5 text-blue-600" />}
                    href="/admin/projects"
                    color="border-l-4 border-blue-600"
                >
                    <div className="space-y-3">
                        {stats.urgentTasks.length > 0 ? (
                            stats.urgentTasks.map((task) => (
                                <div key={task.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                                    <span className="font-medium text-gray-700 truncate max-w-[120px]">{task.title}</span>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {format(new Date(task.due), "d MMM", { locale: es })}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">No hay tareas urgentes</p>
                        )}
                    </div>
                </DashboardCard>

                {/* INVENTORY WIDGET */}
                <DashboardCard 
                    title="Resumen Inventario" 
                    icon={<Package className="h-5 w-5 text-purple-600" />}
                    href="/admin/inventory"
                    color="border-l-4 border-purple-600"
                >
                     <div className="flex flex-col gap-2">
                        <div className="text-2xl font-bold text-gray-800">
                            {stats.lowStockCount} <span className="text-lg font-normal text-gray-500">Items</span>
                        </div>
                        <p className="text-sm text-gray-500">Total en catálogo</p>
                        
                        <div className="mt-2 flex items-center text-xs text-purple-700 font-medium">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Verificar stock bajo
                        </div>
                    </div>
                </DashboardCard>

                 {/* SALARIO MEL WIDGET */}
                 <DashboardCard 
                    title="Salario Mel" 
                    icon={<DollarSign className="h-5 w-5 text-pink-600" />}
                    href="#"
                    color="border-l-4 border-pink-600"
                >
                     <div className="flex flex-col gap-2">
                        <div className="text-2xl font-bold text-gray-800">
                             {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(salarioMel)}
                        </div>
                        <div className="text-xs font-semibold text-pink-600 bg-pink-50 self-start px-2 py-1 rounded">
                            25% de ganancia
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                            Correspondiente a {format(selectedDate, 'MMMM', { locale: es })}
                        </p>
                    </div>
                </DashboardCard>
            </div>

            {/* FINANCES WIDGET */}
             <div className="mt-6">
                <Link href="/admin/finances" className="block group">
                    <Card className="hover:shadow-lg transition-shadow border-none shadow-md bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Finanzas {format(selectedDate, 'MMMM yyyy', { locale: es })}</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(stats.monthlyRevenue)}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">Ingresos Totales del Mes</p>
                                </div>
                                <Button variant="secondary" className="group-hover:translate-x-1 transition-transform">
                                    Ver Reporte Completo <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                             </div>
                        </CardContent>
                    </Card>
                </Link>
             </div>
        </div>
    );
}

function DashboardCard({ title, icon, children, href, color }: any) {
    return (
        <Link href={href} className="block h-full group">
            <Card className={`h-full hover:shadow-lg transition-shadow border-none shadow-md overflow-hidden ${color} relative`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-gray-100 transition-colors">
                        {icon}
                    </div>
                </CardHeader>
                <CardContent>
                    {children}
                </CardContent>
                {/* Hover indicator */}
                <div className="absolute bottom-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
            </Card>
        </Link>
    );
}
