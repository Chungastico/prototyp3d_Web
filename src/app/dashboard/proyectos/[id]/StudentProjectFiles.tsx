'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { updateStudentProjectFiles, updateCreditoFiscal } from '@/app/actions/student';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Package, Loader2, Save, FileBox, ExternalLink, ChevronDown, ChevronUp, Trash2, Lock, CheckCircle2, Receipt, Check } from "lucide-react";
import { useRouter } from 'next/navigation';

interface PiezaSimple {
    id: string;
    nombre_pieza: string;
    cantidad: number;
    precio_final_unit: number;
    total_venta: number;
    filamento_id: string;
}

interface StudentProjectFilesProps {
    jobId: string;
    clientId: string;
    initialFiles: any[];
    estado: string;
    grandTotal?: number;
    creditoFiscal?: boolean;
    pieces?: PiezaSimple[];
    filamentNames?: Record<string, string>;
    isActiveStudent?: boolean;
}

export default function StudentProjectFiles({ jobId, clientId, initialFiles, estado, grandTotal, creditoFiscal: initialCF, pieces = [], filamentNames = {}, isActiveStudent = false }: StudentProjectFilesProps) {
    const router = useRouter();
    // Can edit only if in 'cotizado' state AND not all files have been quoted by admin yet
    const allFilesQuoted = Array.isArray(initialFiles) && initialFiles.length > 0 && initialFiles.every((f: any) => f.quoted);
    const canEdit = estado === 'cotizado' && !allFilesQuoted;
    const [cfEnabled, setCfEnabled] = useState(initialCF ?? false);
    const [cfSaving, setCfSaving] = useState(false);

    const [files, setFiles] = useState<any[]>(Array.isArray(initialFiles) ? initialFiles.map(f => ({
        ...f,
        id: crypto.randomUUID(),
        isExisting: true,
        file: null,
        expanded: false,
    })) : []);

    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const toggleCF = async () => {
        setCfSaving(true);
        const newVal = !cfEnabled;
        const result = await updateCreditoFiscal(jobId, newVal);
        if (!result.error) setCfEnabled(newVal);
        setCfSaving(false);
    };

    const toggleExpanded = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addFiles(Array.from(e.target.files));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
    };

    const addFiles = (newFiles: File[]) => {
        const stlFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.stl') || f.name.toLowerCase().endsWith('.3mf'));
        const newEntries = stlFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            filename: file.name,
            name: file.name.replace(/\.(stl|3mf)$/i, ''),
            comment: '',
            material: 'PLA',
            quantity: 1,
            size: file.size,
            isExisting: false,
            expanded: true,
        }));
        setFiles(prev => [...prev, ...newEntries]);
    };

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
        setConfirmDeleteId(null);
    };

    const updateFileEntry = (id: string, field: string, value: any) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
    };

    const handleSave = async () => {
        if (files.length === 0) {
            alert("No puedes dejar el proyecto sin archivos.");
            return;
        }
        setSaving(true);
        try {
            const finalFilesData = [];
            for (const entry of files) {
                if (entry.isExisting) {
                    finalFilesData.push({
                        url: entry.url, filename: entry.filename, name: entry.name,
                        comment: entry.comment, material: entry.material, quantity: entry.quantity, size: entry.size
                    });
                } else {
                    const safeName = entry.file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
                    const path = `files/${clientId}/${Date.now()}_${safeName}`;
                    const { error: uploadError } = await supabase.storage.from('project-files').upload(path, entry.file);
                    if (uploadError) throw new Error(`Error al subir archivo: ${entry.file.name}`);
                    const { data: publicUrlData } = supabase.storage.from('project-files').getPublicUrl(path);
                    finalFilesData.push({
                        url: publicUrlData.publicUrl, filename: entry.filename, name: entry.name,
                        comment: entry.comment, material: entry.material, quantity: entry.quantity, size: entry.size
                    });
                }
            }
            const result = await updateStudentProjectFiles(jobId, finalFilesData);
            if (result.error) throw new Error(result.error);
            alert("¡Archivos actualizados correctamente!");
            router.refresh();
        } catch (error: any) {
            alert(error.message || "Ocurrió un error al guardar los cambios.");
        } finally {
            setSaving(false);
        }
    };

    // ─── READ-ONLY VIEW ──────────────────────────────────────────────────────────
    if (!canEdit) {
        const quotedFiles = files.filter(f => f.quoted);
        const pendingFiles = files.filter(f => !f.quoted);
        const partialTotal = quotedFiles.reduce((sum: number, f: any) => sum + (f.quoted_total || 0), 0);

        return (
            <div className="space-y-4">
                {/* Crédito Fiscal Banner — only for non-verified students */}
                {!isActiveStudent && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <Receipt className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800">¿Necesitas Crédito Fiscal?</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            Factura con IVA desglosado (+13%). Activa si tu institución lo requiere.
                        </p>
                    </div>
                    <button
                        onClick={toggleCF}
                        disabled={cfSaving}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-w-[120px] justify-center ${
                            cfEnabled ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                        }`}
                    >
                        {cfSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : cfEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {cfSaving ? 'Guardando...' : cfEnabled ? 'Sí, necesito CF' : 'No requiero CF'}
                    </button>
                </div>
                )}

                {/* Quoted files — show with price */}
                {quotedFiles.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Piezas Cotizadas</h3>
                        <div className="space-y-2">
                            {quotedFiles.map((file: any, idx: number) => (
                                <div key={idx} className="rounded-xl border border-green-200 bg-green-50/40 overflow-hidden">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{file.quoted_name || file.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{file.filename}</p>
                                                {file.material && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-medium mt-0.5 inline-block">{file.material}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">×{file.quoted_qty || file.quantity || 1} unidad(es)</p>
                                            {isActiveStudent ? (
                                                <>
                                                    <div className="flex items-baseline justify-end gap-1.5">
                                                        <span className="text-xs text-red-400 line-through">${((file.quoted_price_unit || 0) / 0.8).toFixed(2)}</span>
                                                        <span className="font-bold text-gray-900">${(file.quoted_price_unit || 0).toFixed(2)} c/u</span>
                                                    </div>
                                                    <div className="flex items-baseline justify-end gap-1.5">
                                                        <span className="text-xs text-red-400 line-through">${((file.quoted_total || 0) / 0.8).toFixed(2)}</span>
                                                        <span className="text-sm font-semibold text-naranja">Total: ${(file.quoted_total || 0).toFixed(2)}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="font-bold text-gray-900">${(file.quoted_price_unit || 0).toFixed(2)} c/u</p>
                                                    <p className="text-sm font-semibold text-naranja">Total: ${(file.quoted_total || 0).toFixed(2)}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending files */}
                {pendingFiles.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Archivos Pendientes ({pendingFiles.length})
                        </h3>
                        <div className="space-y-2">
                            {pendingFiles.map((file: any, idx: number) => (
                                <div key={idx} className="rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="flex items-center justify-between p-3 bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-gray-300 text-gray-600 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                                            <div>
                                                <p className="font-semibold text-gray-700 text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{file.filename}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">×{file.quantity || 1}</span>
                                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">⏳ Pendiente</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {files.length === 0 && <p className="text-gray-500 text-sm">Sin archivos.</p>}

                {/* Price block */}
                <div className={`mt-2 rounded-xl border p-5 flex items-center gap-4 ${
                    grandTotal && grandTotal > 0
                        ? 'border-green-200 bg-green-50'
                        : quotedFiles.length > 0
                            ? 'border-naranja/30 bg-orange-50/30'
                            : 'border-dashed border-gray-300 bg-gray-50'
                }`}>
                    <div className={`rounded-full p-3 ${
                        grandTotal && grandTotal > 0 ? 'bg-green-100' : quotedFiles.length > 0 ? 'bg-naranja/10' : 'bg-gray-200'
                    }`}>
                        {grandTotal && grandTotal > 0
                            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                            : <Lock className="h-5 w-5 text-gray-500" />
                        }
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">Total de Cotización</p>
                        {grandTotal && grandTotal > 0 ? (
                            <>
                                <p className="text-xs text-green-600 mt-0.5">Cotización finalizada por el taller</p>
                                {isActiveStudent ? (
                                    // ── Student discount — marketing design ──
                                    <div className="mt-3 -mx-1">
                                        {/* Deal banner */}
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 mb-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-xl shrink-0">🎓</span>
                                                <div className="min-w-0">
                                                    <p className="text-white font-black text-sm leading-tight">Descuento Estudiante</p>
                                                    <p className="text-green-100 text-xs">Precio exclusivo para ti</p>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-lg px-2.5 py-1 shadow shrink-0">
                                                <span className="text-green-600 font-black text-base whitespace-nowrap">20% OFF</span>
                                            </div>
                                        </div>
                                        {/* Prices */}
                                        <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                                            <div>
                                                <p className="text-xs text-gray-400 mb-0.5">Precio regular</p>
                                                <span className="text-lg font-semibold text-red-400 line-through decoration-2">${(grandTotal / 0.8).toFixed(2)}</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-green-600 font-semibold mb-0.5">Tu precio</p>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-4xl font-black text-gray-900">${grandTotal.toFixed(2)}</span>
                                                    <span className="text-sm text-gray-500">USD</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Savings pill */}
                                        <div className="mt-2 flex items-start gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 w-fit max-w-full">
                                            <span className="text-green-600 text-sm shrink-0">✦</span>
                                            <span className="text-green-700 text-xs font-bold">¡Ahorras ${(grandTotal / 0.8 - grandTotal).toFixed(2)} gracias a que eres estudiante!</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-3xl font-bold text-gray-900">${grandTotal.toFixed(2)}</span>
                                        <span className="text-xs text-gray-500">USD</span>
                                    </div>
                                )}
                            </>
                        ) : quotedFiles.length > 0 ? (
                            <>
                                <p className="text-xs text-naranja mt-0.5">En progreso — {quotedFiles.length} de {files.length} pieza(s) cotizadas</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-xl font-bold text-gray-700">${partialTotal.toFixed(2)}</span>
                                    <span className="text-xs text-gray-400">parcial (+ {pendingFiles.length} pendiente{pendingFiles.length !== 1 ? 's' : ''})</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-xs text-gray-400 mt-0.5">
                                El taller está analizando tus archivos. Te notificaremos cuando esté listo.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }


    // ─── EDIT VIEW ───────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 mt-4 border-t pt-4 border-gray-100">
            {/* Crédito Fiscal Banner — only for non-verified students */}
            {!isActiveStudent && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <Receipt className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-800">¿Necesitas Crédito Fiscal?</p>
                    <p className="text-xs text-amber-700 mt-0.5">
                        Factura con IVA desglosado (+13%). Activa si tu institución lo requiere.
                    </p>
                </div>
                <button
                    onClick={toggleCF}
                    disabled={cfSaving}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-w-[120px] justify-center ${
                        cfEnabled ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400'
                    }`}
                >
                    {cfSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : cfEnabled ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    {cfSaving ? 'Guardando...' : cfEnabled ? 'Sí, necesito CF' : 'No requiero CF'}
                </button>
            </div>
            )}

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-naranja" />
                    Editar Piezas del Proyecto
                </h3>
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1 rounded-full font-medium">
                    {files.length} pieza{files.length !== 1 ? 's' : ''}
                </span>
            </div>

            <p className="text-sm text-gray-500 -mt-2">
                Puedes hacer modificaciones mientras tu proyecto siga en estado "Esperando Aprobación". Si agregas nuevos archivos o modificas cantidades, el costo de cotización se ajustará.
            </p>

            <div className="space-y-3">
                {files.map((fileEntry, index) => (
                    <div key={fileEntry.id} className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">

                        {/* ── Accordion Header ── */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <button
                                type="button"
                                className="flex items-center gap-3 flex-1 text-left"
                                onClick={() => toggleExpanded(fileEntry.id)}
                            >
                                <span className="bg-azul-oscuro text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{index + 1}</span>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{fileEntry.name || fileEntry.filename}</p>
                                    <p className="text-xs text-gray-400 font-mono">{fileEntry.filename}</p>
                                </div>
                            </button>
                            <div className="flex items-center gap-2 ml-2 shrink-0">
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">×{fileEntry.quantity || 1}</span>
                                {fileEntry.material && <span className="hidden sm:inline text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">{fileEntry.material}</span>}

                                {/* Delete trigger */}
                                {confirmDeleteId === fileEntry.id ? (
                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
                                        <span className="text-xs text-red-700 font-medium">¿Eliminar?</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(fileEntry.id)}
                                            className="text-xs font-bold text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded transition-colors"
                                        >Sí</button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmDeleteId(null)}
                                            className="text-xs font-bold text-gray-500 hover:text-gray-700 px-1 py-0.5 transition-colors"
                                        >No</button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteId(fileEntry.id)}
                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                        title="Eliminar pieza"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    onClick={() => toggleExpanded(fileEntry.id)}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    {fileEntry.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* ── Accordion Body ── */}
                        {fileEntry.expanded && (
                            <div className="p-5 border-t border-gray-100 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    {/* Left column */}
                                    <div className="space-y-4 md:col-span-7">
                                        <div className="space-y-1.5">
                                            <Label className="text-sm font-medium text-gray-700">Nombre de la pieza</Label>
                                            <Input
                                                value={fileEntry.name}
                                                onChange={(e) => updateFileEntry(fileEntry.id, 'name', e.target.value)}
                                                className="bg-gray-50 border-gray-200"
                                                placeholder="Nombre identificador"
                                            />
                                        </div>
                                        <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-sm flex items-center gap-2">
                                            <span className="truncate max-w-[200px] text-gray-500 font-mono text-xs">{fileEntry.filename}</span>
                                            {fileEntry.size && <span className="text-xs text-gray-400 shrink-0">({(fileEntry.size / 1024 / 1024).toFixed(2)} MB)</span>}
                                            {fileEntry.isExisting && (
                                                <a href={fileEntry.url} target="_blank" rel="noreferrer" className="ml-auto text-blue-500 hover:text-blue-700" title="Ver archivo original">
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center">
                                                    <Label className="text-sm font-medium text-gray-700">Material</Label>
                                                    <a href="/materiales-impresion-3d" target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-naranja border border-orange-200 bg-orange-50 px-2 py-0.5 rounded-md hover:bg-orange-100 font-medium transition-colors">
                                                        Guía
                                                    </a>
                                                </div>
                                                <select
                                                    value={fileEntry.material || 'PLA'}
                                                    onChange={(e) => updateFileEntry(fileEntry.id, 'material', e.target.value)}
                                                    className="flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-naranja"
                                                >
                                                    <option value="PLA">PLA (Básico)</option>
                                                    <option value="PETG">PETG (Funcional)</option>
                                                    <option value="ABS">ABS (Industrial)</option>
                                                    <option value="NS">No estoy seguro</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-sm font-medium text-gray-700">Cantidad</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={fileEntry.quantity || 1}
                                                    onChange={(e) => updateFileEntry(fileEntry.id, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="bg-gray-50 border-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column - comments */}
                                    <div className="space-y-1.5 md:col-span-5 flex flex-col">
                                        <Label className="text-sm font-medium text-gray-700">Comentarios para Producción</Label>
                                        <Textarea
                                            value={fileEntry.comment || ''}
                                            onChange={(e) => updateFileEntry(fileEntry.id, 'comment', e.target.value)}
                                            placeholder="Ej. Color rojo, escala 1:1, necesito alta resistencia..."
                                            className="bg-gray-50 border-gray-200 resize-none flex-1 min-h-[120px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add more files */}
            <div
                className={`flex flex-col items-center gap-3 bg-white p-6 rounded-xl border-2 border-dashed transition-colors ${isDragging ? 'border-naranja bg-orange-50' : 'border-gray-200'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <p className="text-sm text-gray-500 font-medium">¿Necesitas agregar más piezas?</p>
                <div className="relative inline-block">
                    <Input
                        type="file"
                        accept=".stl,.3mf"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                    <Button type="button" variant="outline" className="bg-gray-50 hover:bg-gray-100 text-gray-700 pointer-events-none">
                        <Upload className="h-4 w-4 mr-2" />
                        Subir nuevos archivos (.stl, .3mf)
                    </Button>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-azul-oscuro hover:bg-blue-900 text-white px-6 font-semibold"
                >
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
