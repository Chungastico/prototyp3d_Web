import React from 'react';
import { Layout, Flag, CalendarIcon, FolderKanban, ChevronDown, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectsHeaderProps {
    currentView: 'avances' | 'entregable' | 'calendario' | 'por_proyecto';
    setCurrentView: (view: 'avances' | 'entregable' | 'calendario' | 'por_proyecto') => void;
    filterResponsible: string | null;
    setFilterResponsible: (resp: string | null) => void;
    showCompleted: boolean;
    setShowCompleted: (show: boolean) => void;
    onOpenCreateProject: () => void;
    onOpenCreateTask: () => void;
}

export function ProjectsHeader({
    currentView,
    setCurrentView,
    filterResponsible,
    setFilterResponsible,
    showCompleted,
    setShowCompleted,
    onOpenCreateProject,
    onOpenCreateTask
}: ProjectsHeaderProps) {

    const getViewTitle = () => {
        switch (currentView) {
            case 'avances': return 'Avances';
            case 'entregable': return 'Entregable';
            case 'calendario': return 'Calendario';
            case 'por_proyecto': return 'Por Proyecto';
            default: return 'Proyectos';
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                            <span className="sr-only">Cambiar vista</span>
                            {currentView === 'avances' && <Layout className="h-4 w-4" />}
                            {currentView === 'entregable' && <Flag className="h-4 w-4" />}
                            {currentView === 'calendario' && <CalendarIcon className="h-4 w-4" />}
                            {currentView === 'por_proyecto' && <FolderKanban className="h-4 w-4" />}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => setCurrentView('avances')}>
                            <Layout className="mr-2 h-4 w-4" /> Avances
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView('entregable')}>
                            <Flag className="mr-2 h-4 w-4" /> Entregable
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView('calendario')}>
                            <CalendarIcon className="mr-2 h-4 w-4" /> Calendario
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCurrentView('por_proyecto')}>
                            <FolderKanban className="mr-2 h-4 w-4" /> Por Proyecto
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-2">
                            <Filter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                {filterResponsible ? `Filtro: ${filterResponsible}` : "Todos los responsables"}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 bg-white">
                        <DropdownMenuLabel>Filtrar por Responsable</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setFilterResponsible(null)}>
                            Todos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterResponsible("Gabriel C.")}>
                            Gabriel C.
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilterResponsible("Melanie")}>
                            Melanie
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={showCompleted}
                            onCheckedChange={setShowCompleted}
                        >
                            Mostrar Completados
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex gap-2">
                <Button onClick={onOpenCreateProject} className="bg-naranja hover:bg-naranja/90 text-white shadow-lg shadow-naranja/20 transition-all hover:scale-105 active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Crear Proyecto
                </Button>
                <Button onClick={onOpenCreateTask} variant="outline" className="border-naranja text-naranja hover:bg-naranja/10 hover:text-naranja shadow-sm transition-all hover:scale-105 active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Crear Tarea
                </Button>
            </div>
        </div>
    );
}
