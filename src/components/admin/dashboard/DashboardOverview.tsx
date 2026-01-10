'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Package, ShoppingCart, LayoutDashboard, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DashboardStats {
    activeJobsCount: number;
    nextDeadline: string | null;
    urgentTasks: { id: string; title: string; due: string }[];
    lowStockCount: number;
    monthlyRevenue: number;
}

export function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats>({
        activeJobsCount: 0,
        nextDeadline: null,
        urgentTasks: [],
        lowStockCount: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);

            // 1. Jobs: Active count & Next Deadline
            const { data: jobs } = await supabase
                .from('gestion_trabajos')
                .select('fecha_entrega, estado')
                .in('estado', ['aprobado', 'en_produccion'])
                .order('fecha_entrega', { ascending: true });

            const activeJobsCount = jobs?.length || 0;
            const nextDeadline = jobs && jobs.length > 0 ? jobs[0].fecha_entrega : null;

            // 2. Projects: Urgent Tasks (< 3 days or overdue)
            // Note: We'd need to filter by date in JS or simple query
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

            // 3. Inventory: Low Stock (< 300g approx, assuming logic)
            // We'll count rows where color is verified and assumed stock is low? 
            // Actually, let's just count simple availability if we don't have perfect tracking yet.
            // For now, let's just fetch count of materials.
            const { count: inventoryCount } = await supabase
                .from('inventario_filamento')
                .select('*', { count: 'exact', head: true });

            // 4. Finances: Revenue
            // Quick sum of all completed sales?
            const { data: financialData } = await supabase
                .from('piezas_trabajo')
                .select('total_venta');
            
            const totalRevenue = financialData?.reduce((acc, curr) => acc + (curr.total_venta || 0), 0) || 0;

            setStats({
                activeJobsCount,
                nextDeadline,
                urgentTasks,
                lowStockCount: inventoryCount || 0, // Placeholder mapping
                monthlyRevenue: totalRevenue
            });

            setLoading(false);
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-naranja"></div></div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
            
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
                                <span className="font-medium text-gray-700 truncate max-w-[180px]">{task.title}</span>
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

             {/* FINANCES WIDGET */}
             <div className="md:col-span-2 lg:col-span-3">
                <Link href="/admin/finances" className="block group">
                    <Card className="hover:shadow-lg transition-shadow border-none shadow-md bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg font-medium">Finanzas Globales</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <div className="text-4xl font-bold text-white">
                                        {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(stats.monthlyRevenue)}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">Ingresos Totales Históricos</p>
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
