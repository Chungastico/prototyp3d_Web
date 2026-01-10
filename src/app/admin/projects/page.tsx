'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from "lucide-react";
import { differenceInDays } from "date-fns";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Button } from "@/components/ui/button";
import { SortableProjectCard } from '@/components/admin/projects/ProjectCard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// New Component Imports
import { Project, ProjectType, Priority } from '@/components/admin/projects/types';
import { ProjectColumn, StaticProjectColumn } from '@/components/admin/projects/ProjectColumn';
import { CalendarView } from '@/components/admin/projects/views/CalendarView';
import { ProjectsHeader } from '@/components/admin/projects/ProjectsHeader';
import { ProjectDialogs, ProjectFormData, DialogMode } from '@/components/admin/projects/ProjectDialogs';

function getPriority(fechaObjetivo: string | null): Priority {
    if (!fechaObjetivo) return "baja";

    const hoy = new Date();
    const objetivo = new Date(fechaObjetivo);

    const dias = differenceInDays(objetivo, hoy);

    if (dias <= 3) return "alta";
    if (dias <= 7) return "media";
    return "baja";
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectList, setProjectList] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'avances' | 'entregable' | 'calendario' | 'por_proyecto'>('avances');
    const [showCompleted, setShowCompleted] = useState(false);
    const [filterResponsible, setFilterResponsible] = useState<string | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Dialog State
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [dialogMode, setDialogMode] = useState<DialogMode>('create_task');
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'task' | 'project', id: string } | null>(null);
    
    // Initial data for dialog (reconstructs form state)
    const [dialogInitialData, setDialogInitialData] = useState<Partial<ProjectFormData>>({});

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            
            // 1. Fetch Project Types (Groups)
            const { data: dataTypes, error: errorTypes } = await supabase
                .from('proyectos')
                .select('*')
                .order('nombre', { ascending: true });
                
            if (errorTypes) console.error("Error fetching project types:", errorTypes);
            if (dataTypes) setProjectList(dataTypes);

            // 2. Fetch Tasks
            const { data, error } = await supabase
                .from('proyectos_internos_prototyp3d')
                .select('*')
                .order('id', { ascending: false }); 
            
            if (error) {
                console.error("Error fetching projects:", error);
            }

            if (data) {
                setProjects(data);
            }
            setLoading(false);
        };
        fetchProjects();
    }, []);

    const handleDialogSubmit = async (data: ProjectFormData) => {
        if (dialogMode === 'create_project') {
             // Create a new PROJECT TYPE
            if (!data.typeOrProjectId.trim()) return;

            const { data: newProj, error: errProj } = await supabase
                .from('proyectos')
                .insert([{ nombre: data.typeOrProjectId, descripcion: data.description }])
                .select()
                .single();

            if (errProj) {
                console.error('Error creating project type:', errProj);
                return;
            }

            if (newProj) {
                setProjectList([...projectList, newProj]);
                setOpen(false);
            }

        } else if (dialogMode === 'edit_project') {
             if (!currentProjectId) return;
             const { error } = await supabase
                .from('proyectos')
                .update({ nombre: data.typeOrProjectId, descripcion: data.description })
                .eq('id', currentProjectId);

             if (error) {
                 console.error('Error updating project column:', error);
                 return;
             }

             setProjectList(projectList.map(p => p.id === currentProjectId ? {
                 ...p,
                 nombre: data.typeOrProjectId,
                 descripcion: data.description
             } : p));
             
             setOpen(false);

        } else if (dialogMode === 'create_task') {
            if (!data.name.trim()) return;
            // Handle creating with NO project Type properly (legacy support or default)
            const selectedProject = projectList.find(p => p.id === data.typeOrProjectId);
            
            const insertPayload = { 
                proyecto: data.name,
                tipo_proyecto: selectedProject?.nombre || 'General',
                project_id: data.typeOrProjectId || null,
                fecha_objetivo: data.date ? data.date.toISOString() : null,
                entregable_esperado: data.entregable || null,
                estado: 'Por hacer',
                responsables: data.responsibles.length > 0 ? data.responsibles : ['Gabriel C.']
            };

            const { data: newTaskData, error } = await supabase
                .from('proyectos_internos_prototyp3d')
                .insert([insertPayload])
                .select();

            if (error) {
                console.error('Error creating task:', error);
                return;
            }

            if (newTaskData) {
                setProjects([newTaskData[0], ...projects]);
                setOpen(false);
            }
        
        } else if (dialogMode === 'edit_task') {
            if (!currentProjectId) return;
            const selectedProject = projectList.find(p => p.id === data.typeOrProjectId);

            const { error } = await supabase
                .from('proyectos_internos_prototyp3d')
                .update({ 
                    proyecto: data.name,
                    tipo_proyecto: selectedProject?.nombre || 'General',
                    project_id: data.typeOrProjectId || null,
                    fecha_objetivo: data.date ? data.date.toISOString() : null,
                    entregable_esperado: data.entregable,
                    responsables: data.responsibles.length > 0 ? data.responsibles : ['Gabriel C.']
                })
                .eq('id', currentProjectId);

            if (error) {
                console.error('Error updating project:', error);
                return;
            }

            setProjects(projects.map(p => p.id === currentProjectId ? { 
                ...p, 
                proyecto: data.name,
                tipo_proyecto: selectedProject?.nombre || 'General',
                project_id: data.typeOrProjectId || null,
                fecha_objetivo: data.date ? data.date.toISOString() : null,
                entregable_esperado: data.entregable || null,
                responsables: data.responsibles.length > 0 ? data.responsibles : ['Gabriel C.']
            } : p));
            setOpen(false);
        }
    };

    const handleOpenCreateProject = () => {
        setDialogMode('create_project');
        setDialogInitialData({});
        setCurrentProjectId(null);
        setOpen(true);
    };

    const handleOpenCreateTask = (preSelectedProjectId?: string) => {
        setDialogMode('create_task');
        setDialogInitialData({
            typeOrProjectId: preSelectedProjectId || "",
            // Use current known date if filtered? 
            // Better to default to empty/today inside dialog unless strictly required.
            // If user selected a date in calendar, it's in dialogInitialData.date already if we update it.
            // But here we are opening fresh.
        });
        
        // If we are in calendar view, pass the currently selected date (if we were tracking it).
        // BUT, I'm not tracking selectedDate in top level state except for what I pass to CalendarView...
        // Wait, I mapped `onDateSelect` to `setDialogInitialData`. So if user clicked a date in calendar, `dialogInitialData.date` is set!
        // So passing `...dialogInitialData` or similar is key if we want to preserve that selection.
        // However, `handleOpenCreateTask` overwrites `dialogInitialData`.
        
        // Let's refine:
        // If we want the calendar selected date to persist as default for new tasks, we need to store it separately or read it.
        // Let's add a state `selectedDate` just for the Calendar View tracking.
        setCurrentProjectId(null);
        setOpen(true);
    }
    
    // Additional state for Calendar View date selection persistence
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const editProject = (project: Project) => {
        setDialogMode('edit_task');
        setCurrentProjectId(project.id);
        const typeId = project.project_id || projectList.find(p => p.nombre === project.tipo_proyecto)?.id || "";
        
        setDialogInitialData({
            name: project.proyecto,
            typeOrProjectId: typeId,
            entregable: project.entregable_esperado || "",
            responsibles: project.responsables || [],
            date: project.fecha_objetivo ? new Date(project.fecha_objetivo) : undefined
        });
        setOpen(true);
    };

    const handleEditProjectColumn = (project: ProjectType) => {
        setDialogMode('edit_project');
        setCurrentProjectId(project.id);
        setDialogInitialData({
            typeOrProjectId: project.nombre,
            description: project.descripcion || ""
        });
        setOpen(true);
    };

    const handleDeleteProjectColumn = (id: string) => {
        setDeleteTarget({ type: 'project', id });
    };

    const handleDeleteClick = (id: string) => {
        setDeleteTarget({ type: 'task', id });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        
        if (deleteTarget.type === 'task') {
            const { error } = await supabase
                .from('proyectos_internos_prototyp3d')
                .delete()
                .eq('id', deleteTarget.id);

            if (error) {
                console.error('Error deleting task:', error);
            } else {
                setProjects(projects.filter(p => p.id !== deleteTarget.id));
            }
        } else {
            // Delete Project Column
            const { error } = await supabase
                .from('proyectos')
                .delete()
                .eq('id', deleteTarget.id);
            
            if (error) {
                console.error('Error deleting project column:', error);
            } else {
                setProjectList(projectList.filter(p => p.id !== deleteTarget.id));
            }
        }
        setDeleteTarget(null);
    };
    
    // Sortable logic
     const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeProject = projects.find(p => p.id === activeId);
        if (!activeProject) return;

        let newStatus = activeProject.estado;

        if (['todo', 'in-progress', 'done'].includes(overId as string)) {
            if (overId === 'todo') newStatus = 'Por hacer';
            if (overId === 'in-progress') newStatus = 'En progreso';
            if (overId === 'done') newStatus = 'Completado';
        } else if (currentView === 'por_proyecto') {
             let targetProjectId = "";
             let targetProjectName = "";

             const targetProject = projectList.find(p => p.id === overId);
             if (targetProject) {
                 targetProjectId = targetProject.id;
                 targetProjectName = targetProject.nombre;
             } else {
                 const overCard = projects.find(p => p.id === overId);
                 if (overCard && overCard.project_id) {
                     targetProjectId = overCard.project_id;
                     const p = projectList.find(proj => proj.id === targetProjectId);
                     if (p) targetProjectName = p.nombre;
                 }
             }

             if (targetProjectId && activeProject.project_id !== targetProjectId) {
                const updatedProjects = projects.map(p => 
                    p.id === activeId ? { ...p, project_id: targetProjectId, tipo_proyecto: targetProjectName } : p
                );
                setProjects(updatedProjects);

                const { error } = await supabase
                    .from('proyectos_internos_prototyp3d')
                    .update({ 
                        project_id: targetProjectId,
                        tipo_proyecto: targetProjectName
                    })
                    .eq('id', activeId);

                if (error) {
                    console.error("Error updating project link:", error);
                    setProjects(projects); 
                }
            }
            return; 
        } else {
            const overProject = projects.find(p => p.id === overId);
            if (overProject) {
                newStatus = overProject.estado;
            }
        }

        if (activeProject.estado !== newStatus) {
            const updatedProjects = projects.map(p => 
                p.id === activeId ? { ...p, estado: newStatus } : p
            );
            setProjects(updatedProjects);

            const { error } = await supabase
                .from('proyectos_internos_prototyp3d')
                .update({ estado: newStatus })
                .eq('id', activeId);

            if (error) {
                console.error("Error updating status:", error);
                setProjects(projects); 
            }
        }
    };
    
    const filteredProjects = filterResponsible 
        ? projects.filter(p => p.responsables && p.responsables.includes(filterResponsible))
        : projects;

    const columns = {
        todo: filteredProjects.filter(p => p.estado !== 'En progreso' && p.estado !== 'Completado'),
        inProgress: filteredProjects.filter(p => p.estado === 'En progreso'),
        done: filteredProjects.filter(p => p.estado === 'Completado' && showCompleted),
    };

    const priorityColumns = {
        alta: filteredProjects.filter(p => getPriority(p.fecha_objetivo) === 'alta'),
        media: filteredProjects.filter(p => getPriority(p.fecha_objetivo) === 'media'),
        baja: filteredProjects.filter(p => getPriority(p.fecha_objetivo) === 'baja'),
    };
    
    const projectTypeColumns = React.useMemo(() => {
        const cols: Record<string, Project[]> = {};
        projectList.forEach(proj => {
            cols[proj.id] = projects.filter(p => p.project_id === proj.id);
        });
        return cols;
    }, [projects, projectList]);

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            <ProjectsHeader 
                currentView={currentView}
                setCurrentView={setCurrentView}
                filterResponsible={filterResponsible}
                setFilterResponsible={setFilterResponsible}
                showCompleted={showCompleted}
                setShowCompleted={setShowCompleted}
                onOpenCreateProject={handleOpenCreateProject}
                onOpenCreateTask={() => {
                    // Inject selected date into initial data if coming from calendar
                    if (currentView === 'calendario') {
                        setDialogInitialData({ date: selectedDate });
                    }
                    handleOpenCreateTask();
                }}
            />

            {loading ? (
                 <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-naranja border-t-transparent"></div>
                        <p className="text-sm text-gray-500 font-medium">Cargando proyectos...</p>
                    </div>
                </div>
            ) : (
                <>
                    {currentView === 'avances' && (
						<DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragStart={(event) => setActiveId(event.active.id as string)}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                                <ProjectColumn 
                                    id="todo" 
                                    title="Por Hacer" 
                                    projects={columns.todo} 
                                    onEdit={editProject} 
                                    onDelete={handleDeleteClick} 
                                />
                                <ProjectColumn 
                                    id="in-progress" 
                                    title="En Progreso" 
                                    projects={columns.inProgress} 
                                    onEdit={editProject} 
                                    onDelete={handleDeleteClick} 
                                />
                                <ProjectColumn 
                                    id="done" 
                                    title="Completado" 
                                    projects={columns.done} 
                                    onEdit={editProject} 
                                    onDelete={handleDeleteClick} 
                                />
                            </div>
                            <DragOverlay>
                                {activeId ? (
                                    <div className="transform rotate-3 cursor-grabbing">
                                        <SortableProjectCard 
                                            project={projects.find(p => p.id === activeId)!} 
                                            onEdit={editProject} 
                                            onDelete={handleDeleteClick} 
                                            isOverlay
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}

                    {currentView === 'entregable' && (
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                             <StaticProjectColumn 
                                title="Prioridad Alta (< 3 días)" 
                                projects={priorityColumns.alta} 
                                onEdit={editProject} 
                                onDelete={handleDeleteClick} 
                                color="text-red-600"
                            />
                             <StaticProjectColumn 
                                title="Prioridad Media (< 1 Semana)" 
                                projects={priorityColumns.media} 
                                onEdit={editProject} 
                                onDelete={handleDeleteClick} 
                                color="text-yellow-600"
                            />
                             <StaticProjectColumn 
                                title="Prioridad Baja (> 1 Semana)" 
                                projects={priorityColumns.baja} 
                                onEdit={editProject} 
                                onDelete={handleDeleteClick} 
                                color="text-green-600"
                            />
                        </div>
                    )}

                    {currentView === 'calendario' && (
                        <CalendarView 
                            projects={filteredProjects} 
                            onEdit={editProject} 
                            onDelete={handleDeleteClick}
                            selectedDate={selectedDate}
                            onDateSelect={setSelectedDate}
                            onAddProject={() => {
                                setDialogInitialData({ date: selectedDate });
                                handleOpenCreateTask();
                            }}
                        />
                    )}

                    {currentView === 'por_proyecto' && (
                        <DndContext 
                            sensors={sensors} 
                            collisionDetection={closestCenter} 
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex gap-6 h-[calc(100vh-200px)] overflow-x-auto pb-4">
                                {Object.entries(projectTypeColumns).map(([projectId, typeProjects]) => {
                                    const projectInfo = projectList.find(p => p.id === projectId);
                                    const title = projectInfo ? projectInfo.nombre : "Desconocido";
                                    return (
                                        <div key={projectId} className="min-w-[350px] w-[350px]">
                                            <ProjectColumn 
                                                id={projectId} 
                                                title={title} 
                                                projects={typeProjects} 
                                                onEdit={editProject} 
                                                onDelete={handleDeleteClick} 
                                                projectInfo={projectInfo}
                                                onEditProject={handleEditProjectColumn}
                                                onDeleteProject={handleDeleteProjectColumn}
                                                onAddTask={handleOpenCreateTask}
                                            />
                                        </div>
                                    );
                                })}
                                <div className="min-w-[350px] w-[350px] bg-gray-50/50 rounded-xl border border-dashed border-gray-300 p-4 h-full flex items-center justify-center">
                                    <Button variant="ghost" className="text-gray-400 hover:text-naranja" onClick={handleOpenCreateProject}>
                                        <Plus className="h-6 w-6 mr-2" />
                                        Nuevo Proyecto
                                    </Button>
                                </div>
                            </div>
                             <DragOverlay>
                                {activeId ? (
                                    <div className="transform rotate-3 cursor-grabbing opacity-90 scale-105">
                                        <SortableProjectCard 
                                            project={projects.find(p => p.id === activeId)!} 
                                            onEdit={editProject} 
                                            onDelete={handleDeleteClick} 
                                            isOverlay
                                        />
                                    </div>
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </>
            )}

            <ProjectDialogs 
                open={open}
                onOpenChange={setOpen}
                mode={dialogMode}
                projectList={projectList}
                initialData={dialogInitialData}
                onSubmit={handleDialogSubmit}
            />

            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent className="bg-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está absolutamente seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Esto eliminará permanentemente {deleteTarget?.type === 'project' ? 'el proyecto (columna)' : 'la tarea'} y removerá sus datos.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white border-none focus:ring-red-600">Continuar y Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
