import React from 'react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus } from "lucide-react";
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
import { Project, ProjectType } from './types';
import { SortableProjectCard } from './ProjectCard';

interface ProjectColumnProps {
    id: string;
    title: string;
    projects: Project[];
    projectInfo?: ProjectType;
    onEdit: (p: Project) => void;
    onDelete: (id: string) => void;
    onEditProject?: (p: ProjectType) => void;
    onDeleteProject?: (id: string) => void;
    onAddTask?: (projectId: string) => void;
}

export function ProjectColumn({ 
    id, 
    title, 
    projects, 
    projectInfo,
    onEdit, 
    onDelete,
    onEditProject,
    onDeleteProject,
    onAddTask
}: ProjectColumnProps) {
    const { setNodeRef } = useSortable({
        id: id,
        data: {
             type: 'Column',
             id: id,
        }
    });

    const hasTasks = projects.length > 0;

    return (
        <div ref={setNodeRef} className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 h-full flex flex-col group/column">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm uppercase text-gray-500 tracking-wider flex items-center gap-2">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <span className="bg-white text-xs font-bold px-2.5 py-1 rounded-full border text-gray-600 shadow-sm">{projects.length}</span>
                    
                    {projectInfo && onEditProject && onDeleteProject && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 opacity-0 group-hover/column:opacity-100 transition-opacity">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white">
                                <DropdownMenuLabel>Acciones de Proyecto</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onEditProject(projectInfo)}>
                                    Editar Proyecto
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => !hasTasks && onDeleteProject(id)} 
                                    disabled={hasTasks}
                                    className={hasTasks ? "opacity-50 cursor-not-allowed" : "text-red-600 focus:text-red-600"}
                                >
                                    Eliminar {hasTasks && "(Vaciar primero)"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>
             <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-[100px]">
                    {projects.map((project) => (
                        <SortableProjectCard 
                            key={project.id} 
                            project={project} 
                            onEdit={onEdit} 
                            onDelete={onDelete} 
                        />
                    ))}
                    
                    {/* Add Task Button at bottom of list */}
                    {onAddTask && (
                        <Button 
                            variant="ghost" 
                            className="w-full justify-start text-gray-400 hover:text-naranja hover:bg-white border border-transparent hover:border-dashed hover:border-naranja/50 h-auto py-2 px-3 text-sm transition-all"
                            onClick={() => onAddTask(id)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Tarea
                        </Button>
                    )}
                </div>
            </SortableContext>
        </div>
    )
}

interface StaticProjectColumnProps {
    title: string;
    projects: Project[];
    onEdit: (p: Project) => void;
    onDelete: (id: string) => void;
    color?: string;
}

export function StaticProjectColumn({ title, projects, onEdit, onDelete, color }: StaticProjectColumnProps) {
    return (
        <div className="bg-gray-50/50 rounded-xl border border-gray-100 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className={cn("font-bold text-sm uppercase tracking-wider", color || "text-gray-500")}>{title}</h3>
                <span className="bg-white text-xs font-bold px-2.5 py-1 rounded-full border text-gray-600 shadow-sm">{projects.length}</span>
            </div>
             <div className="space-y-3 overflow-y-auto pr-1 scrollbar-thin flex-1 min-h-[100px]">
                {projects.map((project) => (
                     <Card key={project.id} className="group hover:shadow-md transition-all border-l-4 border-l-naranja overflow-visible relative bg-white">
                        <CardContent className="p-4 relative">
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
                ))}
            </div>
        </div>
    )
}
