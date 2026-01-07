import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Project } from './types';

interface SortableProjectCardProps {
    project: Project;
    onEdit: (p: Project) => void;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
}

export function SortableProjectCard({ project, onEdit, onDelete, isOverlay }: SortableProjectCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: project.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };
    
    // We don't want to apply sortable props if it's an overlay, just style
    const wrapperProps = isOverlay ? {} : { ...attributes, ...listeners, ref: setNodeRef, style };

    return (
        <div {...wrapperProps} className="touch-none">
            <Card className={cn("group hover:shadow-md transition-all border-l-4 border-l-naranja overflow-visible relative bg-white", isDragging && "shadow-lg scale-105 z-50")}>
                <CardContent className="p-4 relative">
                    {!isOverlay && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onPointerDown={(e) => e.stopPropagation()}> 
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-white">
                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => onEdit(project)}>Editar</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => onDelete(project.id)} className="text-red-600 focus:text-red-600">Eliminar</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    <div className="flex justify-between items-start mb-2 mr-6">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-azul-oscuro px-2 py-1 rounded">{project.tipo_proyecto || 'General'}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-2 leading-tight">{project.proyecto}</h4>
                    {project.entregable_esperado && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{project.entregable_esperado}</p>
                    )}
                    <div className="text-xs text-gray-500 flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                             <div className="flex items-center -space-x-1.5 overflow-hidden">
                                {project.responsables && project.responsables.length > 0 ? (
                                    project.responsables.map((resp) => (
                                        <div 
                                            key={resp} 
                                            className="w-5 h-5 rounded-full bg-naranja/10 text-naranja flex items-center justify-center text-[10px] font-bold border border-white ring-1 ring-white"
                                            title={resp}
                                        >
                                            {resp.charAt(0)}
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                                        ?
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-500 truncate max-w-[80px]">
                                {project.responsables && project.responsables.join(", ")}
                            </span>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded text-[10px]", project.fecha_objetivo && new Date(project.fecha_objetivo) < new Date() ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600")}>
                            {project.fecha_objetivo ? new Date(project.fecha_objetivo).toLocaleDateString() : 'Sin fecha'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
