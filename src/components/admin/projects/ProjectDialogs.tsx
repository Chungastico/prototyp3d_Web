import React, { useEffect } from 'react';
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProjectType } from './types';

// Define the shape of the form data
export interface ProjectFormData {
    name: string;
    typeOrProjectId: string; // Creates Type Name OR Project ID
    description?: string;
    entregable?: string;
    responsibles: string[];
    date?: Date;
}

export type DialogMode = 'create_project' | 'create_task' | 'edit_project' | 'edit_task';

interface ProjectDialogsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: DialogMode;
    projectList: ProjectType[];
    initialData?: Partial<ProjectFormData>;
    onSubmit: (data: ProjectFormData) => void;
}

export function ProjectDialogs({
    open,
    onOpenChange,
    mode,
    projectList,
    initialData,
    onSubmit
}: ProjectDialogsProps) {
    // Form State
    const [name, setName] = React.useState("");
    const [typeOrProjectId, setTypeOrProjectId] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [entregable, setEntregable] = React.useState("");
    const [responsibles, setResponsibles] = React.useState<string[]>([]);
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    // Reset or Load data when dialog opens or data changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setName(initialData.name || "");
                setTypeOrProjectId(initialData.typeOrProjectId || "");
                setDescription(initialData.description || "");
                setEntregable(initialData.entregable || "");
                setResponsibles(initialData.responsibles || []);
                setDate(initialData.date || new Date());
            } else {
                // Reset for creation if no initial data provided (though parent usually handles this)
                // We rely on parent passing correct initialData even for creates (empty strings)
            }
        }
    }, [open, initialData]);

    const handleSave = () => {
        onSubmit({
            name,
            typeOrProjectId,
            description,
            entregable,
            responsibles,
            date
        });
    };

    const isProjectMode = mode === 'create_project' || mode === 'edit_project';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">
                        {mode === 'create_project' && 'Crear Nuevo Tipo de Proyecto'}
                        {mode === 'edit_project' && 'Editar Tipo de Proyecto'}
                        {mode === 'create_task' && 'Crear Nueva Tarea'}
                        {mode === 'edit_task' && 'Editar Tarea'}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* PROJECT CREATION / EDIT MODE */}
                    {isProjectMode && (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="type" className="text-base font-medium text-gray-700">
                                    Nombre del Proyecto
                                </Label>
                                <Input
                                    id="type"
                                    value={typeOrProjectId}
                                    onChange={(e) => setTypeOrProjectId(e.target.value)}
                                    className="h-11 border-gray-200 focus:border-naranja focus:ring-naranja text-base"
                                    placeholder="Ingresa el nombre del proyecto..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc" className="text-base font-medium text-gray-700">
                                    Descripción
                                </Label>
                                <Textarea
                                    id="desc"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[120px] border-gray-200 focus:border-naranja focus:ring-naranja text-base resize-none"
                                    placeholder="Describe el propósito o detalles del proyecto option (opcional)..."
                                />
                            </div>
                            <div className="pt-2">
                                <span className="text-sm font-medium text-gray-500 mb-2 block">Proyectos existentes:</span>
                                <div className="flex flex-wrap gap-2">
                                {projectList.map(proj => (
                                    <span
                                        key={proj.id}
                                        className="text-sm px-3 py-1.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200"
                                    >
                                        {proj.nombre}
                                    </span>
                                ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TASK CREATION / EDIT MODE */}
                    {!isProjectMode && (
                        <div className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="taskName" className="text-base font-medium text-gray-700">
                                    Tarea
                                </Label>
                                <Input
                                    id="taskName"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-11 border-gray-200 focus:border-naranja focus:ring-naranja"
                                    placeholder="Nombre de la tarea"
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="projectSelect" className="text-base font-medium text-gray-700">
                                    Proyecto
                                </Label>
                                <select 
                                    id="projectSelect"
                                    value={typeOrProjectId}
                                    onChange={(e) => setTypeOrProjectId(e.target.value)}
                                    className="w-full flex h-11 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="" disabled>Seleccionar proyecto...</option>
                                    {projectList.map(proj => (
                                        <option key={proj.id} value={proj.id}>{proj.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="entregable" className="text-base font-medium text-gray-700">
                                    Entregable Esperado
                                </Label>
                                <Textarea 
                                    id="entregable"
                                    value={entregable}
                                    onChange={(e) => setEntregable(e.target.value)}
                                    className="min-h-[100px] border-gray-200 focus:border-naranja focus:ring-naranja"
                                    placeholder="¿Qué se espera entregar al finalizar esta tarea?"
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label className="text-base font-medium text-gray-700">
                                        Fecha Objetivo
                                    </Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-11 justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 bg-white" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid gap-2">
                                    <Label className="text-base font-medium text-gray-700">
                                        Responsables
                                    </Label>
                                    <div className="flex gap-4 p-2 border rounded-md border-gray-100 bg-gray-50/50 h-11 items-center">
                                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="form-checkbox h-4 w-4 text-naranja rounded border-gray-300 focus:ring-naranja"
                                                checked={responsibles.includes("Gabriel C.")}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setResponsibles([...responsibles, "Gabriel C."]);
                                                    } else {
                                                        setResponsibles(responsibles.filter(r => r !== "Gabriel C."));
                                                    }
                                                }}
                                            />
                                            <span>Gabriel C.</span>
                                        </label>
                                        <label className="flex items-center space-x-2 text-sm cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="form-checkbox h-4 w-4 text-naranja rounded border-gray-300 focus:ring-naranja"
                                                checked={responsibles.includes("Melanie")}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setResponsibles([...responsibles, "Melanie"]);
                                                    } else {
                                                        setResponsibles(responsibles.filter(r => r !== "Melanie"));
                                                    }
                                                }}
                                            />
                                            <span>Melanie</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button 
                        type="submit" 
                        onClick={handleSave} 
                        className="bg-naranja hover:bg-naranja/90 text-white w-full h-11 text-base font-medium shadow-lg shadow-naranja/20"
                        disabled={
                            mode === 'create_project' 
                                ? !typeOrProjectId.trim() 
                                : responsibles.length === 0
                        }
                    >
                        {mode === 'edit_task' ? 'Actualizar Tarea' : mode === 'edit_project' ? 'Actualizar Proyecto' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
