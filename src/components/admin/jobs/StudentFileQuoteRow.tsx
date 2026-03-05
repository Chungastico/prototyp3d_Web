'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { InventarioFilamento } from './types';
import { ChevronDown, ChevronUp, Download, Plus, Check, ChevronsUpDown, Calculator, Loader2, ExternalLink } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface StudentFile {
    url?: string;
    filename: string;
    name?: string;
    comment?: string;
    material?: string;
    quantity?: number;
    size?: number;
    // Set by admin after quoting
    quoted?: boolean;
    pieza_id?: string;
    quoted_name?: string;
    quoted_price_unit?: number;
    quoted_total?: number;
    quoted_qty?: number;
}

interface StudentFileQuoteRowProps {
    file: StudentFile;
    index: number;
    jobId: string;
    onPieceAdded: () => void;
}

const COSTO_IMPRESORA_H = 0.50;
const COSTO_MODELADO_H = 8.00;

export default function StudentFileQuoteRow({ file, index, jobId, onPieceAdded }: StudentFileQuoteRowProps) {
    const [expanded, setExpanded] = useState(false);
    const [filaments, setFilaments] = useState<InventarioFilamento[]>([]);
    const [openFilamentCombo, setOpenFilamentCombo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(!!file.quoted);

    // Form state
    const [nombre, setNombre] = useState(file.name || file.filename.replace(/\.(stl|3mf)$/i, ''));
    const [cantidad, setCantidad] = useState(file.quantity || 1);
    const [selectedFilamentId, setSelectedFilamentId] = useState('');
    const [gramosUnit, setGramosUnit] = useState(0);
    const [printingHours, setPrintingHours] = useState(0);
    const [printingMinutes, setPrintingMinutes] = useState(0);
    const [modelingHours, setModelingHours] = useState(0);
    const [modelingMinutes, setModelingMinutes] = useState(0);
    const [basePrice, setBasePrice] = useState(0);

    // Derived
    const totalPrintingHours = printingHours + (printingMinutes / 60);
    const totalModelingHoursInput = modelingHours + (modelingMinutes / 60);
    const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
    const precioGramo = selectedFilament?.precio_por_gramo || 0;
    const costoFilamento = gramosUnit * precioGramo;
    const costoImpresion = totalPrintingHours * COSTO_IMPRESORA_H;
    const totalModelingCost = totalModelingHoursInput * COSTO_MODELADO_H;
    const amortizedModelingCost = cantidad > 0 ? totalModelingCost / cantidad : 0;
    const amortizedModelingHours = cantidad > 0 ? totalModelingHoursInput / cantidad : 0;
    const costoTotalUnit = costoFilamento + costoImpresion + amortizedModelingCost;
    const suggestedMin = totalPrintingHours * 1.0 + costoFilamento;
    const suggestedMax = totalPrintingHours * 2.0 + costoFilamento;
    const precioFinalUnit = basePrice + amortizedModelingCost;
    const gananciaUnit = basePrice - (costoFilamento + costoImpresion);

    useEffect(() => {
        if (expanded && filaments.length === 0) {
            supabase
                .from('inventario_filamento')
                .select('*')
                .order('color_tipo_filamento')
                .then(({ data }) => { if (data) setFilaments(data); });
        }
    }, [expanded]);

    const handleSave = async () => {
        if (!selectedFilamentId) {
            alert('Selecciona un filamento');
            return;
        }
        setLoading(true);
        try {
            const piecePayload = {
                trabajo_id: jobId,
                nombre_pieza: nombre,
                descripcion_pieza: file.comment || '',
                cantidad,
                filamento_id: selectedFilamentId,
                gramos_usados: gramosUnit,
                precio_por_gramo_snapshot: precioGramo,
                costo_filamento_snapshot: costoFilamento,
                tiempo_impresora_h: totalPrintingHours,
                tiempo_modelado_h: amortizedModelingHours,
                costo_impresora_h_rate: COSTO_IMPRESORA_H,
                costo_modelado_h_rate: COSTO_MODELADO_H,
                venta_min_unit: suggestedMin,
                venta_max_unit: suggestedMax,
                costo_total_unit: costoTotalUnit,
                precio_final_unit: precioFinalUnit,
                ganancia_unit: gananciaUnit,
                total_venta: precioFinalUnit * cantidad,
                total_costo: costoTotalUnit * cantidad,
                total_ganancia: gananciaUnit * cantidad,
            };

            const { data: pieceData, error: pieceError } = await supabase
                .from('piezas_trabajo')
                .insert([piecePayload])
                .select()
                .single();

            if (pieceError) throw pieceError;

            // Register filament consumption
            const gramosTotales = gramosUnit * cantidad;
            await supabase.from('consumo_filamento').insert([{
                pieza_id: pieceData.id,
                filamento_id: selectedFilamentId,
                gramos_usados: gramosTotales,
                precio_por_gramo: precioGramo,
                costo_filamento: gramosTotales * precioGramo,
            }]);

            // Deduct from inventory
            const { data: stockData } = await supabase
                .from('inventario_filamento')
                .select('stock_gramos_disponibles')
                .eq('id', selectedFilamentId)
                .single();
            if (stockData) {
                await supabase
                    .from('inventario_filamento')
                    .update({ stock_gramos_disponibles: (stockData.stock_gramos_disponibles || 0) - gramosTotales })
                    .eq('id', selectedFilamentId);
            }

            setSaved(true);
            setExpanded(false);

            // Mark this file as quoted with embedded price — do NOT delete it (student dashboard still counts it)
            const { data: jobData } = await supabase
                .from('gestion_trabajos')
                .select('files')
                .eq('id', jobId)
                .single();
            if (jobData?.files && Array.isArray(jobData.files)) {
                const updatedFiles = jobData.files.map((f: any, i: number) =>
                    i === index
                        ? {
                            ...f,
                            quoted: true,
                            pieza_id: pieceData.id,
                            quoted_name: nombre,
                            quoted_price_unit: precioFinalUnit,
                            quoted_total: precioFinalUnit * cantidad + totalModelingCost,
                            quoted_qty: cantidad,
                        }
                        : f
                );
                await supabase
                    .from('gestion_trabajos')
                    .update({ files: updatedFiles })
                    .eq('id', jobId);
            }

            onPieceAdded();
        } catch (err: any) {
            alert(err.message || 'Error al guardar la pieza');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`rounded-xl border overflow-hidden transition-all ${saved ? 'border-green-200 bg-green-50/30' : 'border-blue-100 bg-white'}`}>
            {/* Header row */}
            <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => !saved && setExpanded(e => !e)}
            >
                <div className="bg-blue-100 text-blue-700 rounded-lg p-1.5 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{file.name || file.filename}</p>
                        {file.material && (
                            <span className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-100 font-medium">{file.material}</span>
                        )}
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded font-medium">×{file.quantity || 1}</span>
                        {saved && <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">✓ Agregado</span>}
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate">{file.filename}</p>
                    {file.comment && (
                        <p className="text-xs text-gray-500 italic border-l-2 border-naranja pl-2 mt-0.5">"{file.comment}"</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {file.url && (
                        <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-xs text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md font-medium flex items-center gap-1 transition-colors"
                        >
                            <Download className="h-3 w-3" />
                            Descargar
                        </a>
                    )}
                    {!saved && (
                        <button
                            className={`text-xs border px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all ${
                                expanded ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                            }`}
                        >
                            {expanded ? <ChevronUp className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                            {expanded ? 'Cerrar' : 'Cotizar'}
                        </button>
                    )}
                </div>
            </div>

            {/* Expanded form */}
            {expanded && (
                <div className="border-t border-blue-100 p-5 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Inputs */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Nombre Pieza</Label>
                                <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la pieza" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Cantidad</Label>
                                    <Input
                                        type="number" min="1"
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={cantidad === 0 ? '' : cantidad}
                                        onChange={e => setCantidad(e.target.value === '' ? 0 : parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Filamento</Label>
                                    <Popover open={openFilamentCombo} onOpenChange={setOpenFilamentCombo}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" role="combobox" className="w-full justify-between font-normal text-xs h-10">
                                                {selectedFilamentId
                                                    ? filaments.find(f => f.id === selectedFilamentId)?.color_tipo_filamento
                                                    : 'Seleccionar...'}
                                                <ChevronsUpDown className="ml-1 h-3 w-3 opacity-50 shrink-0" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[280px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Buscar..." />
                                                <CommandList>
                                                    <CommandEmpty>No encontrado.</CommandEmpty>
                                                    <CommandGroup>
                                                        {filaments.map(f => (
                                                            <CommandItem
                                                                key={f.id}
                                                                value={`${f.color_tipo_filamento} ${f.material} ${f.marca}`}
                                                                onSelect={() => { setSelectedFilamentId(f.id); setOpenFilamentCombo(false); }}
                                                            >
                                                                <Check className={cn("mr-2 h-3 w-3", selectedFilamentId === f.id ? "opacity-100" : "opacity-0")} />
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm">{f.color_tipo_filamento} - {f.marca}</span>
                                                                    <span className="text-xs text-gray-500">{f.material} • ${f.precio_por_gramo.toFixed(2)}/g</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-sm font-medium">Tiempo Impresión</Label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <Input type="number" placeholder="0" min="0"
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12"
                                            value={printingHours === 0 ? '' : printingHours}
                                            onChange={e => setPrintingHours(e.target.value === '' ? 0 : parseInt(e.target.value))} />
                                        <span className="absolute right-3 top-2.5 text-xs text-gray-400 pointer-events-none">Horas</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Input type="number" placeholder="0" min="0" max="59"
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-14"
                                            value={printingMinutes === 0 ? '' : printingMinutes}
                                            onChange={e => setPrintingMinutes(e.target.value === '' ? 0 : parseInt(e.target.value))} />
                                        <span className="absolute right-3 top-2.5 text-xs text-gray-400 pointer-events-none">Minutos</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Gramos (Unitario)</Label>
                                    <Input type="number" placeholder="0"
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={gramosUnit === 0 ? '' : gramosUnit}
                                        onChange={e => setGramosUnit(e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-medium">Modelado (Total)</Label>
                                    <div className="flex gap-1">
                                        <div className="flex-1 relative">
                                            <Input type="number" placeholder="0" min="0"
                                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-6"
                                                value={modelingHours === 0 ? '' : modelingHours}
                                                onChange={e => setModelingHours(e.target.value === '' ? 0 : parseInt(e.target.value))} />
                                            <span className="absolute right-2 top-2.5 text-xs text-gray-400">h</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <Input type="number" placeholder="0" min="0" max="59"
                                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-6"
                                                value={modelingMinutes === 0 ? '' : modelingMinutes}
                                                onChange={e => setModelingMinutes(e.target.value === '' ? 0 : parseInt(e.target.value))} />
                                            <span className="absolute right-2 top-2.5 text-xs text-gray-400">m</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Cost Calculator */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-between gap-4">
                            <div className="space-y-3">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-sm">
                                    <Calculator className="h-4 w-4" />
                                    Costos Unitarios
                                </h4>
                                <div className="space-y-1.5 text-xs">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Filamento ({gramosUnit}g × ${precioGramo.toFixed(2)}):</span>
                                        <span>${costoFilamento.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Impresión ({totalPrintingHours.toFixed(2)}h × ${COSTO_IMPRESORA_H}):</span>
                                        <span>${costoImpresion.toFixed(2)}</span>
                                    </div>
                                    {totalModelingCost > 0 && (
                                        <div className="flex justify-between text-blue-600 bg-blue-50 p-1 rounded font-medium">
                                            <span>+ Modelado ({totalModelingHoursInput.toFixed(2)}h total):</span>
                                            <span>${totalModelingCost.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t">
                                        <span>Costo Prod. Unit.:</span>
                                        <span>${costoTotalUnit.toFixed(2)}</span>
                                    </div>
                                </div>
                                {totalPrintingHours > 0 && (
                                    <div className="bg-naranja/5 p-2 rounded text-xs text-naranja">
                                        <p className="font-semibold mb-0.5">Rango sugerido: ${suggestedMin.toFixed(2)} – ${suggestedMax.toFixed(2)}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 border-t pt-3">
                                <div className="space-y-1.5">
                                    <Label className="text-sm font-semibold">Precio Base (sin modelado)</Label>
                                    <Input type="number" className="text-base"
                                        value={basePrice === 0 ? '' : basePrice}
                                        onChange={e => setBasePrice(e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                                </div>
                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center font-bold text-naranja text-base">
                                        <span>Total Venta:</span>
                                        <span>${((basePrice * cantidad) + totalModelingCost).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                                    <div className="bg-white p-2 rounded border border-gray-200">
                                        <span className="block text-xs text-gray-500">Ganancia Unit.</span>
                                        <span className={`block font-bold ${gananciaUnit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            ${gananciaUnit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="bg-gray-900 p-2 rounded text-white">
                                        <span className="block text-xs text-gray-300">Precio Unit. Final</span>
                                        <span className="block font-bold">${precioFinalUnit.toFixed(2)}</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSave}
                                    disabled={loading || !selectedFilamentId}
                                    className="w-full bg-naranja hover:bg-orange-600 text-white font-semibold"
                                >
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    Agregar como Pieza
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
