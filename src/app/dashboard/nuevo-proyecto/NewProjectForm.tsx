'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Package, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from 'next/navigation';

interface NewProjectFormProps {
    clientId: string;
}

interface FileEntry {
    id: string;
    file: File;
    name: string;
    comment: string;
    material: string;
    quantity: number;
}

export default function NewProjectForm({ clientId }: NewProjectFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [nombreProyecto, setNombreProyecto] = useState('');
    const [files, setFiles] = useState<FileEntry[]>([]);
    
    // To handle drag and drop
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files));
        }
    };

    const addFiles = (newFiles: File[]) => {
        const stlFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.stl') || f.name.toLowerCase().endsWith('.3mf'));
        const newEntries = stlFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            name: file.name.replace(/\.(stl|3mf)$/i, ''), // Default to filename without extension
            comment: '',
            material: 'PLA',
            quantity: 1
        }));
        setFiles(prev => [...prev, ...newEntries]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFileEntry = (id: string, field: 'name' | 'comment' | 'material' | 'quantity', value: any) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nombreProyecto || files.length === 0) return;
        setLoading(true);

        try {
            const uploadedFilesData = [];

            // 1. Upload all files to Supabase 'project-files' bucket
            for (const entry of files) {
                const safeName = entry.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                const path = `files/${clientId}/${Date.now()}_${safeName}`;
                
                const { data, error } = await supabase.storage
                    .from('project-files')
                    .upload(path, entry.file);

                if (error) {
                    console.error("Upload error:", error);
                    throw new Error(`Error al subir archivo: ${entry.file.name}`);
                }

                const { data: publicUrlData } = supabase.storage
                    .from('project-files')
                    .getPublicUrl(path);

                uploadedFilesData.push({
                    url: publicUrlData.publicUrl,
                    filename: entry.file.name,
                    name: entry.name,
                    comment: entry.comment,
                    material: entry.material,
                    quantity: entry.quantity,
                    size: entry.file.size
                });
            }

            // 2. Create standard 'gestion_trabajos' record
            const { error: dbError } = await supabase
                .from('gestion_trabajos')
                .insert([{
                    cliente_id: clientId,
                    nombre_proyecto: nombreProyecto,
                    estado: 'cotizado',
                    estado_pago: 'pendiente',
                    fecha_solicitado: new Date().toISOString().split('T')[0],
                    es_empresa: false,
                    // Store the array of objects directly in JSONB
                    files: uploadedFilesData 
                }]);

            if (dbError) throw dbError;

            // Success redirect
            router.push('/dashboard');
            router.refresh();

        } catch (error: any) {
            console.error("Submission error:", error);
            alert(error.message || "Ocurrió un error al enviar el proyecto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            {/* Project Name */}
            <div className="space-y-3">
                <Label htmlFor="nombreProyecto" className="text-lg font-semibold text-gray-900">1. Dale un nombre a tu proyecto</Label>
                <Input 
                    id="nombreProyecto"
                    placeholder="Ej. Piezas para Robot Sumo, Soportes de Monitor..."
                    className="text-lg p-6 bg-gray-50 border-gray-200 focus-visible:ring-naranja"
                    value={nombreProyecto}
                    onChange={(e) => setNombreProyecto(e.target.value)}
                    required
                />
            </div>

            {/* File Upload Area */}
            <div className="space-y-3">
                <Label className="text-lg font-semibold text-gray-900">2. Sube tus archivos 3D (.stl o .3mf)</Label>
                <div 
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${isDragging ? 'border-naranja bg-orange-50' : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-naranja' : 'text-gray-400'}`} />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Arrastra tus archivos aquí</h3>
                    <p className="text-gray-500 text-sm mb-6">o haz clic para explorar en tu computadora</p>
                    <div className="relative inline-block">
                        <Input 
                            type="file" 
                            accept=".stl,.3mf"
                            multiple
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Button type="button" variant="outline" className="bg-white pointer-events-none">
                            Seleccionar Archivos
                        </Button>
                    </div>
                </div>
            </div>

            {/* File List / Details */}
            {files.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Label className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Package className="h-5 w-5 text-naranja" />
                        3. Detalles de tus piezas ({files.length})
                    </Label>
                    
                    <div className="grid gap-4">
                        {files.map((fileEntry, index) => (
                            <div key={fileEntry.id} className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 pt-8 pl-12 shadow-sm transition-all hover:shadow-md">
                                <div className="absolute top-4 left-4 bg-azul-oscuro text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeFile(fileEntry.id)}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-xs font-semibold"
                                >
                                    <X className="h-3 w-3" /> Eliminar Pieza
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="space-y-4 md:col-span-7">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium text-gray-700">Nombre de la pieza</Label>
                                            <Input
                                                value={fileEntry.name}
                                                onChange={(e) => updateFileEntry(fileEntry.id, 'name', e.target.value)}
                                                className="bg-white border-gray-200"
                                                placeholder="¿Cómo quieres llamar a esta pieza?"
                                                required
                                            />
                                        </div>
                                        <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center gap-2">
                                            <span className="truncate max-w-[200px] text-gray-500 font-mono text-xs">{fileEntry.file.name}</span>
                                            <span className="text-xs text-gray-400">({(fileEntry.file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        
                                        <div className="space-y-1.5 mt-2">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-sm font-medium text-gray-700">Material Deseado</Label>
                                                <a href="/materiales-impresion-3d" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-naranja border border-orange-200 bg-orange-50 px-2 py-1 rounded-md hover:bg-orange-100 font-medium transition-colors">
                                                    Leer Guía de Filamentos
                                                </a>
                                            </div>
                                            <select 
                                                value={fileEntry.material}
                                                onChange={(e) => updateFileEntry(fileEntry.id, 'material', e.target.value)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja"
                                            >
                                                <option value="PLA">PLA (Básico, Modelos)</option>
                                                <option value="PETG">PETG (Resistente, Funcional)</option>
                                                <option value="ABS">ABS (Térmico, Industrial)</option>
                                                <option value="NS">No estoy seguro / Quiero recomendación</option>
                                            </select>
                                            <div className="space-y-1.5 mt-2">
                                                <Label className="text-sm font-medium text-gray-700">Cantidad (Piezas iguales)</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={fileEntry.quantity}
                                                    onChange={(e) => updateFileEntry(fileEntry.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="bg-white border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 md:col-span-5 h-full flex flex-col">
                                        <Label className="text-sm font-medium text-gray-700">Comentarios para Producción</Label>
                                        <Textarea
                                            value={fileEntry.comment}
                                            onChange={(e) => updateFileEntry(fileEntry.id, 'comment', e.target.value)}
                                            placeholder="Ej. Imprimir en color rojo, necesito que sea muy resistente, escala 1:1, etc."
                                            className="bg-white border-gray-200 resize-none flex-1 min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-6">
                        <div className="relative inline-block">
                            <Input 
                                type="file" 
                                accept=".stl,.3mf"
                                multiple
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                            />
                            <Button type="button" variant="outline" className="border-dashed border-gray-300 pointer-events-none text-gray-600">
                                + Agregar más archivos a este proyecto
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button 
                    type="submit" 
                    disabled={loading || files.length === 0 || !nombreProyecto}
                    className="bg-naranja hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-xl font-semibold shadow-lg shadow-orange-200 hover:-translate-y-1 transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                            Enviando Proyecto...
                        </>
                    ) : (
                        <>
                            Enviar para Cotización
                            <ArrowRight className="ml-2 h-6 w-6" />
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
