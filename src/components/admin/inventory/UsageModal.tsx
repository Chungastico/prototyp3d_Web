'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/lib/supabase';
import { Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface UsageModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filamentId: string | null;
    filamentName: string;
}

interface ConsumptionRecord {
    id: string;
    gramos_usados: number;
    pieza: {
        nombre_pieza: string;
        trabajo: {
            id: string;
            nombre_proyecto: string;
            fecha_solicitado: string;
            estado: string;
        }
    }
}

export function UsageModal({ open, onOpenChange, filamentId, filamentName }: UsageModalProps) {
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<ConsumptionRecord[]>([]);

    useEffect(() => {
        if (open && filamentId) {
            fetchUsage();
        }
    }, [open, filamentId]);

    const fetchUsage = async () => {
        setLoading(true);
        // We fetch from consumo_filamento and join with piezas and trabajos
        // Note: Since our previous fix, inventory is only affected if the job is 'aprobado' or later.
        // History should probably show all assignments, but highlight active ones.
        // For simplicity and to answer "where it was used", we'll show all and label them.
        const { data, error } = await supabase
            .from('consumo_filamento')
            .select(`
                id,
                gramos_usados,
                pieza:piezas_trabajo (
                    nombre_pieza,
                    trabajo:gestion_trabajos (
                        id,
                        nombre_proyecto,
                        fecha_solicitado,
                        estado
                    )
                )
            `)
            .eq('filamento_id', filamentId);

        if (error) {
            console.error("Error fetching usage history:", error);
        } else {
            // Sort by date descending
            const sorted = ((data as any) || []).sort((a: any, b: any) => {
                const dateA = new Date(a.pieza?.trabajo?.fecha_solicitado).getTime();
                const dateB = new Date(b.pieza?.trabajo?.fecha_solicitado).getTime();
                return dateB - dateA;
            });
            setRecords(sorted);
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center pr-6">
                        <span>Historial de Uso: <span className="text-naranja">{filamentName}</span></span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 mt-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-naranja" />
                        </div>
                    ) : records.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 italic">
                            No hay registros de uso para este filamento.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record) => {
                                if (!record.pieza || !record.pieza.trabajo) return null;
                                
                                const isPending = record.pieza.trabajo.estado === 'cotizado';
                                
                                return (
                                    <div key={record.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                        <div className="flex-1">
                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                {record.pieza.trabajo.nombre_proyecto}
                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                                    isPending 
                                                        ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                                        : record.pieza.trabajo.estado === 'entregado'
                                                            ? 'bg-green-100 text-green-700 border border-green-200'
                                                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                }`}>
                                                    {record.pieza.trabajo.estado.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <span className="font-medium text-gray-700">Pieza:</span> {record.pieza.nombre_pieza}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="font-medium text-gray-700">Fecha:</span> {format(new Date(record.pieza.trabajo.fecha_solicitado), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-lg font-bold text-gray-900">{record.gramos_usados}g</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                                                {isPending ? 'Proyectados' : 'Consumidos'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 pt-4 border-t">
                    <Button onClick={() => onOpenChange(false)} variant="outline">Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
