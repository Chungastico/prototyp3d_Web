'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PiezaTrabajo, GestionTrabajo } from './types';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Package, Printer, Box, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PieceWithJob extends PiezaTrabajo {
    trabajo: GestionTrabajo & {
        cliente: { nombre_cliente: string }
    };
    filamento?: {
        color_tipo_filamento: string;
        material: string;
    };
}

const COLUMNS = [
    { id: 'no_impreso', title: 'Por Imprimir', icon: Printer, color: 'bg-gray-100' },
    { id: 'impreso', title: 'Impreso', icon: Package, color: 'bg-blue-50' },
    { id: 'empaquetado', title: 'Empaquetado', icon: Box, color: 'bg-green-50' }
];

export function PiecesKanban() {
    const [pieces, setPieces] = useState<PieceWithJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sensors
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const fetchPieces = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('piezas_trabajo')
            .select(`
                *,
                trabajo:gestion_trabajos!inner (
                    *,
                    cliente:clientes (nombre_cliente)
                ),
                filamento:inventario_filamento (
                    color_tipo_filamento,
                    material
                )
            `)
            .in('trabajo.estado', ['aprobado', 'en_produccion', 'listo']); // filter is applied
            
        if (error) {
            console.error("Error fetching pieces:", error);
        } else {
            // Processing: Add Priority and Sort
            let cleanedData = data?.map(p => ({
                ...p,
                estado: p.estado || 'no_impreso'
            })) || [];

            // Sort: 1. By Deadline (Ascending - urgent first)
            cleanedData.sort((a, b) => {
                const dateA = new Date(a.trabajo.fecha_entrega).getTime();
                const dateB = new Date(b.trabajo.fecha_entrega).getTime();
                return dateA - dateB;
            });

            setPieces(cleanedData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPieces();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const pieceId = active.id as string;
        let newStatus = over.id as string;
        
        // Fix: If over.id is NOT a column ID, it means we dropped on a card.
        // We must find which column that card belongs to.
        const validStatuses = ['no_impreso', 'impreso', 'empaquetado'];
        if (!validStatuses.includes(newStatus)) {
            const overPiece = pieces.find(p => p.id === newStatus);
            if (overPiece) {
                newStatus = overPiece.estado || 'no_impreso';
            } else {
                // Fallback or error case
                console.warn("Dropped on unknown element:", newStatus);
                return;
            }
        }

        const currentPiece = pieces.find(p => p.id === pieceId);

        if (!currentPiece || currentPiece.estado === newStatus) return;

        // 1. Optimistic Update (Preserve sort order effectively by just updating status)
        setPieces(prev => {
            const updated = prev.map(p => 
                p.id === pieceId ? { ...p, estado: newStatus as any } : p
            );
            // Re-sort to maintain priority order
            return updated.sort((a, b) => {
                const dateA = new Date(a.trabajo.fecha_entrega).getTime();
                const dateB = new Date(b.trabajo.fecha_entrega).getTime();
                return dateA - dateB;
            });
        });

        // 2. DB Update - Piece Status
        const { error } = await supabase
            .from('piezas_trabajo')
            .update({ estado: newStatus })
            .eq('id', pieceId);

        if (error) {
            console.error("Error updating piece status:", error);
            fetchPieces(); // Revert on error
            return;
        }

        // 3. Automation Logic
        await checkProjectAutomation(currentPiece.trabajo_id, newStatus, pieceId);
    };

    const checkProjectAutomation = async (jobId: string, newPieceStatus: string, currentPieceId: string) => {
        // Need to refetch latest piece statuses for this job to be accurate
        const { data: jobPieces } = await supabase
            .from('piezas_trabajo')
            .select('estado')
            .eq('trabajo_id', jobId);
        
        const { data: jobData } = await supabase
            .from('gestion_trabajos')
            .select('estado')
            .eq('id', jobId)
            .single();
        
        if (!jobPieces || !jobData) return;
        const currentJobStatus = jobData.estado;

         if (currentJobStatus === 'aprobado') {
            if (newPieceStatus === 'impreso' || newPieceStatus === 'empaquetado') {
                 await updateJobStatus(jobId, 'en_produccion');
            }
        }

        if (currentJobStatus === 'aprobado' || currentJobStatus === 'en_produccion') {
            const allReady = jobPieces.every(p => 
                p.estado === 'impreso' || p.estado === 'empaquetado'
            );
            if (allReady) await updateJobStatus(jobId, 'listo');
        }
    };

    const updateJobStatus = async (jobId: string, status: string) => {
        await supabase.from('gestion_trabajos').update({ estado: status }).eq('id', jobId);
        console.log(`Job ${jobId} updated to ${status}`);
    };

    if (loading) return (
        <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-naranja" />
        </div>
    );

    return (
        <DndContext 
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-200px)]">
                {COLUMNS.map(col => (
                    <div key={col.id} className="flex-1 min-w-[300px] flex flex-col bg-gray-50/50 rounded-xl border border-gray-200/60 max-h-full">
                        {/* Column Header */}
                        <div className={`p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/50 backdrop-blur-sm rounded-t-xl z-10`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${col.color}`}>
                                    <col.icon className="h-4 w-4 text-gray-700" />
                                </div>
                                <h3 className="font-semibold text-gray-700">{col.title}</h3>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                {pieces.filter(p => (p.estado || 'no_impreso') === col.id).length}
                            </span>
                        </div>

                        {/* Droppable Area */}
                        <SortableContext 
                            items={pieces.filter(p => (p.estado || 'no_impreso') === col.id).map(p => p.id)}
                            strategy={rectSortingStrategy}
                        >
                            <DroppableColumn id={col.id}>
                                {pieces
                                    .filter(p => (p.estado || 'no_impreso') === col.id)
                                    .map(piece => (
                                        <SortablePieceCard key={piece.id} piece={piece} />
                                    ))
                                }
                            </DroppableColumn>
                        </SortableContext>
                    </div>
                ))}
            </div>

            <DragOverlay>
                {activeId ? (
                    <PieceCardOverlay piece={pieces.find(p => p.id === activeId)!} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Droppable Container
function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
    const { setNodeRef } = useSortable({ id });
    return (
        <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]">
            {children}
        </div>
    );
}

// Helper for Priority
const getPriorityInfo = (deadline: string) => {
    const today = new Date();
    const dueDate = new Date(deadline);
    const diffTime = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft < 3) return { color: 'bg-red-500', borderColor: 'border-l-red-500', label: 'Crítico' };
    if (daysLeft < 7) return { color: 'bg-orange-500', borderColor: 'border-l-orange-500', label: 'Urgente' };
    return { color: 'bg-green-500', borderColor: 'border-l-green-500', label: 'Normal' };
};

// Sortable Card
function SortablePieceCard({ piece }: { piece: PieceWithJob }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: piece.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const priority = getPriorityInfo(piece.trabajo.fecha_entrega);

    if (isDragging) {
        return (
            <div 
                ref={setNodeRef} 
                style={style} 
                className="opacity-50 bg-gray-50 border border-dashed border-gray-200 rounded-lg h-[120px]"
            />
        );
    }

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            {...attributes} 
            {...listeners}
            className={`group relative bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing hover:border-naranja/30`}
        >
            {/* Priority Color Strip */}
            <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-lg ${priority.color}`}></div>
            
            <div className="pl-3">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {piece.nombre_pieza}
                    </h4>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        x{piece.cantidad}
                    </span>
                </div>
                
                <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Box className="h-3 w-3" />
                         <span className="truncate max-w-[180px]">{piece.trabajo.nombre_proyecto}</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                        {piece.trabajo.cliente?.nombre_cliente || 'Sin cliente'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                        {piece.filamento ? `${piece.filamento.material} ${piece.filamento.color_tipo_filamento}` : 'Filamento N/A'}
                    </p>
                </div>

                <div className="mt-3 flex justify-between items-center bg-gray-50 rounded px-2 py-1">
                    <span className="text-[10px] text-gray-500 font-medium">
                        {piece.gramos_usados}g
                    </span>
                    <span className={`text-[10px] font-bold ${
                        priority.label === 'Crítico' ? 'text-red-600' : 
                        priority.label === 'Urgente' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                        {format(new Date(piece.trabajo.fecha_entrega), 'dd MMM', { locale: es })}
                    </span>
                </div>
            </div>
        </div>
    );
}

// Overlay Card (Visual Copy)
function PieceCardOverlay({ piece }: { piece: PieceWithJob }) {
    const priority = getPriorityInfo(piece.trabajo.fecha_entrega);
    return (
        <div className="bg-white p-4 rounded-lg border-2 border-naranja shadow-xl rotate-2 w-[300px] cursor-grabbing">
             <div className={`absolute top-0 bottom-0 left-0 w-1.5 rounded-l-lg ${priority.color}`}></div>
            <div className="pl-3">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {piece.nombre_pieza}
                    </h4>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold">
                        x{piece.cantidad}
                    </span>
                </div>
                
                 <div className="space-y-1">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Box className="h-3 w-3" />
                         <span className="truncate">{piece.trabajo.nombre_proyecto}</span>
                    </p>
                     <p className="text-[10px] text-gray-400">
                        {piece.trabajo.cliente?.nombre_cliente || 'Sin cliente'}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                        {piece.filamento ? `${piece.filamento.material} ${piece.filamento.color_tipo_filamento}` : 'Filamento N/A'}
                    </p>
                </div>
                <div className="mt-3 flex justify-between items-center bg-gray-50 rounded px-2 py-1">
                    <span className="text-[10px] text-gray-500 font-medium">{piece.gramos_usados}g</span>
                    <span className="text-[10px] font-bold text-gray-700">
                        {format(new Date(piece.trabajo.fecha_entrega), 'dd MMM', { locale: es })}
                    </span>
                </div>
            </div>
        </div>
    );
}
