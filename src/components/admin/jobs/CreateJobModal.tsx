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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

interface CreateJobModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onJobCreated: (jobId?: string) => void;
    jobToEdit?: any; // Using any for simplicity as we map full object
}

export function CreateJobModal({ open, onOpenChange, onJobCreated, jobToEdit }: CreateJobModalProps) {
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
    const [newClientPhone, setNewClientPhone] = useState('');

    // Company State
    const [isCompany, setIsCompany] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [creditoFiscal, setCreditoFiscal] = useState(false);

    useEffect(() => {
        if (open) {
            fetchClients();
            
            if (jobToEdit) {
                setNombreProyecto(jobToEdit.nombre_proyecto);
                setSelectedClientId(jobToEdit.cliente_id);
                // Attempt to find client name if we have the list loaded? 
                // We might not have clients loaded yet. Effect dependency handles it?
                // Actually fetchClients is async. 
                // We'll trust that when clients load (or if they are already loaded), we can find the name.
                // But wait, initially 'clients' is empty.
                // We need to set searchClient when clients are loaded OR when jobToEdit is set.
                // Let's rely on a separate effect or just check if clients has data.
                
                setFechaSolicitado(jobToEdit.fecha_solicitado.split('T')[0]); // Ensure format
                setFechaEntrega(jobToEdit.fecha_entrega ? jobToEdit.fecha_entrega.split('T')[0] : '');
                setFusionUrl(jobToEdit.fusion_project_url || '');
                setIsCompany(jobToEdit.es_empresa || false);
                setCompanyName(jobToEdit.nombre_empresa || '');
                setCreditoFiscal(jobToEdit.credito_fiscal || false);
            } else {
                // Reset form
                setNombreProyecto('');
                setSelectedClientId(null);
                setSearchClient('');
                setFechaSolicitado(new Date().toISOString().split('T')[0]);
                setFechaEntrega('');
                setThumbnailFile(null);
                setProjectFile(null);
                setFusionUrl('');
                setIsCompany(false);
                setCompanyName('');
                setCreditoFiscal(false);
            }
        }
    }, [open, jobToEdit]);

    // Effect to sync searchClient with selectedClientId when opening or loading
    useEffect(() => {
        if (selectedClientId && clients.length > 0) {
            const client = clients.find(c => c.id === selectedClientId);
            if (client) setSearchClient(client.nombre_cliente);
        }
    }, [selectedClientId, clients]);

    const fetchClients = async () => {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nombre_cliente');
        if (error) {
            console.error("Error fetching clients:", error);
        }
        if (data) setClients(data);
    };

    const handleCreateClient = async () => {
        if (!newClientName.trim()) return;
        setLoading(true);
        
        const payload: any = { nombre_cliente: newClientName };
        if (newClientPhone.trim()) {
            payload.telefono = newClientPhone.trim();
        }

        const { data, error } = await supabase
            .from('clientes')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("Error creating client:", error);
        } else if (data) {
            setClients([...clients, data]);
            setSelectedClientId(data.id);
            setIsCreatingClient(false);
            setNewClientName('');
            setNewClientPhone('');
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
        if (!nombreProyecto || !fechaEntrega) return;
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

            // 3. Create or Update Job
            const payload: any = {
                nombre_proyecto: nombreProyecto,
                cliente_id: selectedClientId || null,
                fecha_solicitado: fechaSolicitado,
                fecha_entrega: fechaEntrega,
                // Only set status defaults on create
                ...(!jobToEdit && { 
                    estado: 'cotizado',
                    estado_pago: 'pendiente'
                 }),
                fusion_project_url: fusionUrl || null,
                es_empresa: isCompany,
                nombre_empresa: isCompany ? companyName : null,
                credito_fiscal: isCompany ? creditoFiscal : false,
            };

            if (thumbnailUrl) payload.thumbnail_url = thumbnailUrl;
            if (projectFileUrl) payload.files = { url: projectFileUrl, name: projectFile?.name };

            let error;
            let data;
            
            if (jobToEdit) {
                 const { error: updateError } = await supabase
                    .from('gestion_trabajos')
                    .update(payload)
                    .eq('id', jobToEdit.id);
                 error = updateError;
            } else {
                const { data: insertData, error: insertError } = await supabase
                    .from('gestion_trabajos')
                    .insert([payload])
                    .select(); // Capture returned data
                data = insertData;
                error = insertError;
            }

            if (error) throw error;
            
            // Get the ID of the job we just handled
            const finalJobId = jobToEdit ? jobToEdit.id : (data && data.length > 0 ? data[0].id : null);

            onJobCreated(finalJobId);
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
                    <DialogTitle>{jobToEdit ? 'Editar Pedido' : 'Crear Nuevo Pedido'}</DialogTitle>
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

                    {/* Company Switch */}
                    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="esEmpresa" className="cursor-pointer">¿Es compra de empresa?</Label>
                            <input
                                type="checkbox"
                                id="esEmpresa"
                                checked={isCompany}
                                onChange={(e) => setIsCompany(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-naranja focus:ring-naranja"
                            />
                        </div>
                        
                        {isCompany && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Nombre de la Empresa</Label>
                                    <Input 
                                        id="companyName" 
                                        value={companyName} 
                                        onChange={(e) => setCompanyName(e.target.value)} 
                                        placeholder="Ej. ESROBOTICA S.A. de C.V."
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                                    <div className="flex flex-col">
                                        <Label htmlFor="creditoFiscal" className="cursor-pointer text-sm">¿Requiere Crédito Fiscal?</Label>
                                        <span className="text-xs text-gray-500">Se agregará IVA 13% al precio final</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        id="creditoFiscal"
                                        checked={creditoFiscal}
                                        onChange={(e) => setCreditoFiscal(e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Client Selector */}
                    <div className="space-y-2 flex flex-col">
                        <Label>Cliente</Label>
                        
                        {isCreatingClient ? (
                            <div className="p-4 border rounded-lg bg-gray-50/80 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                    <span className="text-sm font-medium text-gray-700">Crear Nuevo Cliente</span>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsCreatingClient(false)}>
                                        <X className="h-4 w-4 text-gray-400" />
                                    </Button>
                                </div>
                                <div className="grid gap-3">
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="newClient" className="text-xs font-medium text-gray-600">Nombre Completo</Label>
                                        <Input 
                                            id="newClient" 
                                            value={newClientName} 
                                            onChange={(e) => setNewClientName(e.target.value)}
                                            placeholder="Nombre del cliente"
                                            className="bg-white"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateClient();
                                            }}
                                        />
                                    </div>
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="newClientPhone" className="text-xs font-medium text-gray-600">Teléfono (Opcional)</Label>
                                        <Input 
                                            id="newClientPhone" 
                                            value={newClientPhone} 
                                            onChange={(e) => setNewClientPhone(e.target.value)}
                                            placeholder="Ej. 7777-7777"
                                            className="bg-white"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleCreateClient();
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-1 gap-2">
                                    <Button size="sm" variant="outline" onClick={() => setIsCreatingClient(false)}>Cancelar</Button>
                                    <Button size="sm" onClick={handleCreateClient} disabled={loading || !newClientName.trim()}>
                                        {loading ? <Loader2 className="h-3 w-3 animate-spin mr-2"/> : null}
                                        Guardar Cliente
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <Popover open={openClientCombo} onOpenChange={setOpenClientCombo}>
                                <PopoverTrigger asChild>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar o crear cliente..."
                                            value={searchClient}
                                            onChange={(e) => {
                                                setSearchClient(e.target.value);
                                                setOpenClientCombo(true);
                                                if (selectedClientId) setSelectedClientId(null);
                                            }}
                                            onClick={() => setOpenClientCombo(true)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Tab' && searchClient.trim()) {
                                                    const matches = clients.filter(c => 
                                                        c.nombre_cliente.toLowerCase().includes(searchClient.toLowerCase())
                                                    );
                                                    if (matches.length > 0) {
                                                        e.preventDefault();
                                                        setSelectedClientId(matches[0].id);
                                                        setSearchClient(matches[0].nombre_cliente);
                                                        setOpenClientCombo(false);
                                                    }
                                                }
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (searchClient.trim()) {
                                                        const matches = clients.filter(c => 
                                                            c.nombre_cliente.toLowerCase().includes(searchClient.toLowerCase())
                                                        );
                                                        if (matches.length === 0) {
                                                            setNewClientName(searchClient);
                                                            setIsCreatingClient(true);
                                                            setOpenClientCombo(false);
                                                        } else {
                                                            setSelectedClientId(matches[0].id);
                                                            setSearchClient(matches[0].nombre_cliente);
                                                            setOpenClientCombo(false);
                                                        }
                                                    }
                                                }
                                            }}
                                            className={cn(
                                                "pl-8",
                                                !selectedClientId && "text-muted-foreground"
                                            )}
                                        />
                                    </div>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[400px]" align="start" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    <Command shouldFilter={false}>
                                        <CommandList>
                                            <CommandEmpty>
                                                <div className="p-4 text-center">
                                                    <p className="text-sm text-gray-500 mb-3">No se encontró el cliente "{searchClient}"</p>
                                                    <Button 
                                                        size="sm" 
                                                        className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200 shadow-sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setNewClientName(searchClient);
                                                            setIsCreatingClient(true);
                                                            setOpenClientCombo(false);
                                                        }}
                                                    >
                                                        <UserPlus className="h-3 w-3 mr-2" />
                                                        Crear nuevo cliente
                                                    </Button>
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup heading="Clientes Existentes">
                                                {clients
                                                    .filter(client => 
                                                        !searchClient || 
                                                        client.nombre_cliente.toLowerCase().includes(searchClient.toLowerCase())
                                                    )
                                                    .map((client) => (
                                                        <CommandItem
                                                            key={client.id}
                                                            value={client.nombre_cliente}
                                                            onSelect={() => {
                                                                setSelectedClientId(client.id);
                                                                setSearchClient(client.nombre_cliente);
                                                                setOpenClientCombo(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedClientId === client.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {client.nombre_cliente}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 flex flex-col">
                            <Label>Fecha Solicitud</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !fechaSolicitado && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaSolicitado ? format(new Date(new Date(fechaSolicitado).getUTCFullYear(), new Date(fechaSolicitado).getUTCMonth(), new Date(fechaSolicitado).getUTCDate()), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={fechaSolicitado ? new Date(new Date(fechaSolicitado).getUTCFullYear(), new Date(fechaSolicitado).getUTCMonth(), new Date(fechaSolicitado).getUTCDate()) : undefined}
                                        onSelect={(date) => date && setFechaSolicitado(format(date, 'yyyy-MM-dd'))}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label>Fecha Entrega</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "justify-start text-left font-normal",
                                            !fechaEntrega && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {fechaEntrega ? format(new Date(new Date(fechaEntrega).getUTCFullYear(), new Date(fechaEntrega).getUTCMonth(), new Date(fechaEntrega).getUTCDate()), "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="p-3 border-b border-gray-100 flex gap-2 overflow-x-auto">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-xs h-7 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
                                            onClick={() => setFechaEntrega(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                                        >
                                            Mañana
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-xs h-7 bg-naranja/10 text-naranja hover:bg-naranja/20 hover:text-orange-700"
                                            onClick={() => setFechaEntrega(format(addDays(new Date(), 3), 'yyyy-MM-dd'))}
                                        >
                                            3 Días
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-xs h-7 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                            onClick={() => setFechaEntrega(format(addDays(new Date(), 7), 'yyyy-MM-dd'))}
                                        >
                                            1 Sem
                                        </Button>
                                    </div>
                                    <Calendar
                                        mode="single"
                                        selected={fechaEntrega ? new Date(new Date(fechaEntrega).getUTCFullYear(), new Date(fechaEntrega).getUTCMonth(), new Date(fechaEntrega).getUTCDate()) : undefined}
                                        onSelect={(date) => date && setFechaEntrega(format(date, 'yyyy-MM-dd'))}
                                        initialFocus
                                        disabled={(date) => date < new Date(fechaSolicitado)}
                                    />
                                </PopoverContent>
                            </Popover>
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
                        disabled={loading || !nombreProyecto || !fechaEntrega}
                        className="bg-naranja hover:bg-orange-600 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {jobToEdit ? 'Guardar Cambios' : 'Crear Pedido'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
