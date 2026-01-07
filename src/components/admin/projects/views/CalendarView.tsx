import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, MoreHorizontal, CalendarIcon } from "lucide-react";
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
import { Project } from '../types';

interface CalendarViewProps {
    projects: Project[];
    onEdit: (p: Project) => void;
    onDelete: (id: string) => void;
    selectedDate: Date;
    onDateSelect: (d: Date) => void;
    onAddProject: () => void;
}

export function CalendarView({ 
    projects, 
    onEdit, 
    onDelete,
    selectedDate, 
    onDateSelect,
    onAddProject
}: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const getProjectsForDay = (day: Date) => {
        return projects.filter(p => p.fecha_objetivo && isSameDay(new Date(p.fecha_objetivo), day));
    };

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const selectedProjects = getProjectsForDay(selectedDate);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-250px)]">
            <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={prevMonth}>Anterior</Button>
                        <Button variant="outline" size="sm" onClick={nextMonth}>Siguiente</Button>
                    </div>
                    <h3 className="text-lg font-bold capitalize text-gray-800">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h3>
                </div>
                
                <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden flex-1">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                        <div key={day} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase h-8 flex items-center justify-center">
                            {day}
                        </div>
                    ))}
                    
                    {/* Pad start of month */}
                    {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
                        <div key={`pad-${i}`} className="bg-white" />
                    ))}

                    {daysInMonth.map((day) => {
                        const dayProjects = getProjectsForDay(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        
                        return (
                            <div 
                                key={day.toString()} 
                                onClick={() => onDateSelect(day)}
                                className={cn(
                                    "bg-white p-2 hover:bg-gray-50 transition-colors group relative cursor-pointer flex flex-col items-center justify-start gap-1", 
                                    isSelected && "bg-blue-50 ring-2 ring-inset ring-naranja"
                                )}
                            >
                                <span className={cn(
                                    "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all", 
                                    isToday ? "bg-naranja text-white" : "text-gray-500",
                                    isSelected && !isToday && "text-naranja font-bold"
                                )}>
                                    {format(day, 'd')}
                                </span>
                                <div className="flex gap-1 flex-wrap justify-center">
                                    {dayProjects.slice(0, 4).map((project, i) => (
                                        <div 
                                            key={i} 
                                            className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                project.estado === "Completado" ? "bg-green-500" :
                                                project.estado === "En progreso" ? "bg-blue-500" : "bg-gray-400"
                                            )} 
                                        />
                                    ))}
                                    {dayProjects.length > 4 && (
                                        <span className="text-[8px] text-gray-400 text-center leading-none">+</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-xl border border-gray-100 p-6 flex flex-col h-full shadow-sm overflow-hidden">
                <div className="mb-4 pb-4 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg text-gray-800 capitalize">
                            {format(selectedDate, "EEEE d", { locale: es })}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">
                            {format(selectedDate, "MMMM yyyy", { locale: es })}
                        </p>
                    </div>
                     <Button size="icon" variant="ghost" className="h-8 w-8 text-naranja hover:text-naranja/80 hover:bg-naranja/10" onClick={onAddProject}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {selectedProjects.length > 0 ? (
                        selectedProjects.map(project => (
                             <Card key={project.id} className="group hover:shadow-md transition-all border-l-4 border-l-naranja overflow-visible relative bg-gray-50/50">
                                <CardContent className="p-3 relative">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10" onPointerDown={(e) => e.stopPropagation()}> 
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                     <MoreHorizontal className="h-3 w-3" />
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

                                    <div className="flex justify-between items-start mb-1 mr-4">
                                            <span className="text-[9px] uppercase font-bold tracking-wider bg-blue-50 text-azul-oscuro px-1.5 py-0.5 rounded">{project.tipo_proyecto || 'General'}</span>
                                    </div>
                                    <h4 className="font-bold text-sm text-gray-800 mb-1 leading-tight">{project.proyecto}</h4>
                                    
                                    <div className="text-[10px] text-gray-500 flex justify-between items-center pt-2 border-t border-gray-100/50 mt-2">
                                        <div className="flex items-center gap-1">
                                             <div className="flex items-center -space-x-1 overflow-hidden">
                                                {project.responsables && project.responsables.length > 0 ? (
                                                    project.responsables.map((resp) => (
                                                        <div 
                                                            key={resp} 
                                                            className="w-4 h-4 rounded-full bg-naranja/10 text-naranja flex items-center justify-center text-[8px] font-bold border border-white ring-1 ring-white"
                                                            title={resp}
                                                        >
                                                            {resp.charAt(0)}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[8px] font-bold">?</div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={cn("px-1.5 py-0.5 rounded", project.estado === "Completado" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                                            {project.estado || 'Por hacer'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                         <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center h-full">
                            <CalendarIcon className="h-8 w-8 mb-2 opacity-20" />
                            <p>No hay eventos</p>
                            <p className="text-xs opacity-70">Añade uno nuevo</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
