'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Cliente } from './types';
import { Search, Upload, X, Check, Loader2, UserPlus, Package } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface CreateJobModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJobCreated: () => void;
}

export function CreateJobModal({ open, onOpenChange, onJobCreated }: CreateJobModalProps) {
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [fechaSolicitado, setFechaSolicitado] = useState(new Date().toISOString().split('T')[0]);
    const [fechaEntrega, setFechaEntrega] = useState('');
    
    // File State
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [projectFile, setProjectFile] = useState<File | null>(null); // .3mf or other
    const [fusionUrl, setFusionUrl] = useState('');

    // Clients State
    const [clients, setClients] = useState<Cliente[]>([]);
    const [openClientCombo, setOpenClientCombo] = useState(false);
    const [searchClient, setSearchClient] = useState('');
    
    // New Client State
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');

    useEffect(() => {
        if (open) {
            fetchClients();
            // Reset form
            setNombreProyecto('');
            setSelectedClientId(null);
            setFechaSolicitado(new Date().toISOString().split('T')[0]);
            setFechaEntrega('');
            setThumbnailFile(null);
            setProjectFile(null);
            setFusionUrl('');
        }
    }, [open]);

    const fetchClients = async () => {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nombre');
        
        if (data) setClients(data);
    };

    const handleCreateClient = async () => {
        if (!newClientName.trim()) return;
        setLoading(true);
        
        const { data, error } = await supabase
            .from('clientes')
            .insert([{ nombre: newClientName }])
            .select()
            .single();

        if (error) {
            console.error("Error creating client:", error);
        } else if (data) {
            setClients([...clients, data]);
            setSelectedClientId(data.id);
            setIsCreatingClient(false);
            setNewClientName('');
            setOpenClientCombo(false);
        }
        setLoading(false);
    };

    const handleFileUpload = async (file: File, bucket: string, path: string) => {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file);
            
        if (error) {
            console.error(`Error uploading to ${bucket}:`, error);
            return null;
        }
        
        const { data: publicUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
            
        return publicUrlData.publicUrl;
    };

    const handleSubmit = async () => {
        if (!nombreProyecto || !selectedClientId || !fechaEntrega) return;
        setLoading(true);

        try {
            let thumbnailUrl = null;
            let projectFileUrl = null;

            // 1. Upload Thumbnail
            if (thumbnailFile) {
                const path = `thumbnails/${Date.now()}_${thumbnailFile.name}`;
                thumbnailUrl = await handleFileUpload(thumbnailFile, 'project-files', path);
            }

            // 2. Upload Project File (if any)
            if (projectFile) {
                const path = `files/${Date.now()}_${projectFile.name}`;
                projectFileUrl = await handleFileUpload(projectFile, 'project-files', path);
            }

            // 3. Create Job
            const { error } = await supabase
                .from('gestion_trabajos')
                .insert([{
                    nombre_proyecto: nombreProyecto,
                    cliente_id: selectedClientId,
                    fecha_solicitado: fechaSolicitado,
                    fecha_entrega: fechaEntrega,
                    estado: 'cotizado',
                    estado_pago: 'pendiente',
                    thumbnail_url: thumbnailUrl,
                    fusion_project_url: fusionUrl || null,
                    files: projectFileUrl ? { url: projectFileUrl, name: projectFile?.name } : null
                }]);

            if (error) throw error;

            onJobCreated();
            onOpenChange(false);
        } catch (error) {
            console.error("Error creating job:", error);
            alert("Error al crear el pedido. Revisa la consola para más detalles.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Pedido</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                    {/* Project Name */}
                    <div className="space-y-2">
                        <Label htmlFor="projectName">Nombre del Proyecto</Label>
                        <Input 
                            id="projectName" 
                            value={nombreProyecto} 
                            onChange={(e) => setNombreProyecto(e.target.value)} 
                            placeholder="Ej. Soportes Industriales Lote 1"
                        />
                    </div>

                    {/* Client Selector */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Cliente</Label>
                        <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openClientCombo}
                                    className="justify-between font-normal"
                                >
                                    {selectedClientId
                                        ? clients.find((c) => c.id === selectedClientId)?.nombre
                                        : "Seleccionar cliente..."}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar cliente..." onValueChange={setSearchClient} />
                                    <CommandList>
                                        <CommandEmpty>
                                            <div className="p-2 text-center">
                                                <p className="text-sm text-gray-500 mb-2">No encontrado</p>
                                                <Button 
                                                    size="sm" 
                                                    variant="secondary" 
                                                    className="w-full"
                                                    onClick={() => setIsCreatingClient(true)}
                                                >
                                                    <UserPlus className="h-3 w-3 mr-2" />
                                                    Crear "{searchClient}"
                                                </Button>
                                            </div>
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {clients.map((client) => (
                                                <CommandItem
                                                    key={client.id}
                                                    value={client.nombre}
                                                    onSelect={() => {
                                                        setSelectedClientId(client.id);
                                                        setOpenClientCombo(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {client.nombre}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        
                        {/* Inline Client Creation */}
                        {isCreatingClient && (
                            <div className="flex gap-2 mt-2 items-end animate-in fade-in slide-in-from-top-1">
                                <div className="flex-1 space-y-1">
                                    <Label htmlFor="newClient" className="text-xs">Nombre Nuevo Cliente</Label>
                                    <Input 
                                        id="newClient" 
                                        value={newClientName} 
                                        onChange={(e) => setNewClientName(e.target.value)}
                                        placeholder="Nombre del cliente"
                                    />
                                </div>
                                <Button size="sm" onClick={handleCreateClient} disabled={loading}>Guardar</Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsCreatingClient(false)}>Cancelar</Button>
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fechaSolicitado">Fecha Solicitud</Label>
                            <Input 
                                id="fechaSolicitado" 
                                type="date"
                                value={fechaSolicitado} 
                                onChange={(e) => setFechaSolicitado(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fechaEntrega">Fecha Entrega</Label>
                            <Input 
                                id="fechaEntrega" 
                                type="date"
                                value={fechaEntrega} 
                                onChange={(e) => setFechaEntrega(e.target.value)} 
                            />
                        </div>
                    </div>

                    {/* Files */}
                    <div className="space-y-4 pt-2 border-t">
                        <h4 className="text-sm font-medium text-gray-900">Archivos del Proyecto</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Imagen Miniatura (Opcional)</Label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <Input 
                                        type="file" 
                                        accept="image/*" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center gap-1">
                                        <Upload className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            {thumbnailFile ? thumbnailFile.name : "Subir Imagen"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs">Archivo 3D / .3mf (Opcional)</Label>
                                <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                    <Input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={(e) => setProjectFile(e.target.files?.[0] || null)}
                                    />
                                    <div className="flex flex-col items-center gap-1">
                                        <Package className="h-6 w-6 text-gray-400" />
                                        <span className="text-xs text-gray-500">
                                            {projectFile ? projectFile.name : "Subir Archivo"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="fusionUrl">Fusion 360 Link (Opcional)</Label>
                            <Input 
                                id="fusionUrl" 
                                value={fusionUrl} 
                                onChange={(e) => setFusionUrl(e.target.value)} 
                                placeholder="https://a360.co/..."
                            />
                        </div>
                    </div>

                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading || !nombreProyecto || !selectedClientId || !fechaEntrega}
                        className="bg-naranja hover:bg-orange-600 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Crear Pedido
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
