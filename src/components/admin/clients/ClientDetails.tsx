'use client';

import React, { useEffect, useState } from 'react';
import { Cliente, GestionTrabajo } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Calendar, Package } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ClientDetailsProps {
    client: Cliente;
    onBack: () => void;
}

export function ClientDetails({ client, onBack }: ClientDetailsProps) {
    const [clientJobs, setClientJobs] = useState<GestionTrabajo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientJobs = async () => {
            setLoading(true);
            // Assuming 'cliente_id' links jobs to clients
            // Since `cliente_id` is a UUID in the types, we can query by it.
            // Note: DB schema for gestion_trabajos usually has a foreign key to clientes.
            const { data, error } = await supabase
                .from('gestion_trabajos')
                .select('*')
                .eq('cliente_id', client.id)
                .order('fecha_solicitado', { ascending: false });

            if (error) {
                console.error("Error fetching client jobs:", error);
            } else {
                setClientJobs(data || []);
            }
            setLoading(false);
        };

        if (client.id) {
            fetchClientJobs();
        }
    }, [client.id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'cotizado': return 'bg-gray-100 text-gray-700';
            case 'aprobado': return 'bg-blue-50 text-blue-700';
            case 'en_produccion': return 'bg-orange-50 text-orange-700';
            case 'listo': return 'bg-green-50 text-green-700';
            case 'entregado': return 'bg-purple-50 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="pl-0 hover:pl-2 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver a Clientes
                </Button>
            </div>

            {/* Header info */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{client.nombre_cliente}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                            <Mail className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{client.email || 'Sin correo registrado'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="h-5 w-5 mr-3 text-gray-400" />
                            <span>{client.telefono || 'Sin teléfono registrado'}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                         <div className="flex items-center text-gray-600">
                            <span className="font-semibold w-24">Frecuencia:</span>
                            <span>{client.frecuencia_compra || 'No especificada'}</span>
                        </div>
                        <div className="flex items-start text-gray-600">
                            <span className="font-semibold w-24 shrink-0">Notas:</span>
                            <span className="text-sm">{client.observaciones || 'Sin observaciones'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Historial de Pedidos */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-naranja" />
                    Historial de Pedidos ({clientJobs.length})
                </h2>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-naranja border-t-transparent"></div>
                    </div>
                ) : clientJobs.length === 0 ? (
                    <p className="text-gray-500 text-sm">Este cliente no tiene pedidos registrados.</p>
                ) : (
                    <div className="space-y-4">
                        {clientJobs.map(job => (
                            <div key={job.id} className="flex items-center justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <h4 className="font-medium text-gray-900">{job.nombre_proyecto}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(job.fecha_solicitado), 'dd MMM yyyy', { locale: es })}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(job.estado)}`}>
                                            {job.estado.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* You could add a price if available in the job object easily */}
                                    {job.estado_pago === 'pagado' ? (
                                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">PAGADO</span>
                                    ) : (
                                        <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">PENDIENTE</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
