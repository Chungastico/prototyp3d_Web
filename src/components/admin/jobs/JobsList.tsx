'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GestionTrabajo } from './types';
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, DollarSign, Package } from "lucide-react";
import { CreateJobModal } from '@/components/admin/jobs/CreateJobModal';
import { JobDetails } from '@/components/admin/jobs/JobDetails';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function JobsList() {
    const [jobs, setJobs] = useState<GestionTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    const fetchJobs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('gestion_trabajos')
            .select(`
                *,
                cliente:clientes(nombre)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching jobs:", error);
        } else {
            setJobs(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'cotizado': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'aprobado': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'en_produccion': return 'bg-orange-50 text-orange-700 border-orange-200'; // DB value: en_produccion
            case 'listo': return 'bg-green-50 text-green-700 border-green-200';
            case 'entregado': return 'bg-purple-50 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        if (status === 'en_produccion') return 'En Producción';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    if (selectedJobId) {
        return <JobDetails jobId={selectedJobId} onBack={() => { setSelectedJobId(null); fetchJobs(); }} />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Button onClick={() => setCreateModalOpen(true)} className="bg-naranja hover:bg-orange-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Pedido
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-naranja border-t-transparent"></div>
                </div>
            ) : jobs.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No hay pedidos registrados</h3>
                    <p className="text-gray-500 mt-1">Comienza creando un nuevo pedido para gestionar tu producción.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job) => (
                        <div 
                            key={job.id} 
                            onClick={() => setSelectedJobId(job.id)}
                            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                        {job.thumbnail_url ? (
                                            <img src={job.thumbnail_url} alt={job.nombre_proyecto} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                <Package className="h-6 w-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-naranja transition-colors">
                                            {job.nombre_proyecto}
                                        </h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <span className="font-medium text-gray-700">{(job as any).cliente?.nombre || 'Cliente Desconocido'}</span>
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>Entrega: {job.fecha_entrega ? format(new Date(job.fecha_entrega), 'dd MMM yyyy', { locale: es }) : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.estado)}`}>
                                        {formatStatus(job.estado)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${job.estado_pago === 'pagado' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {job.estado_pago === 'pagado' ? 'PAGADO' : 'PENDIENTE PAGO'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CreateJobModal 
                open={createModalOpen} 
                onOpenChange={setCreateModalOpen} 
                onJobCreated={fetchJobs} 
            />
        </div>
    );
}
