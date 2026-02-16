'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioFilamento, PiezaTrabajo } from './types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Calculator } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface PieceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string;
    onPieceAdded: () => void;
}

export function PieceForm({ open, onOpenChange, jobId, onPieceAdded, pieceToEdit }: PieceFormProps & { pieceToEdit?: PiezaTrabajo | null }) {
    const [loading, setLoading] = useState(false);
    const [filaments, setFilaments] = useState<InventarioFilamento[]>([]);
    const [openFilamentCombo, setOpenFilamentCombo] = useState(false);
    
    // Form Factors
    const COSTO_IMPRESORA_H = 0.50;
    const COSTO_MODELADO_H = 8.00;

    // State
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [selectedFilamentId, setSelectedFilamentId] = useState('');
    const [gramosUnit, setGramosUnit] = useState(0);
    
    // New State for Split Time
    const [printingHours, setPrintingHours] = useState(0);
    const [printingMinutes, setPrintingMinutes] = useState(0);


    const [tiempoMod, setTotalModelingHours] = useState(0); // This will now be derived or unused if we split state
    
    // Split Modeling Time State
    const [modelingHours, setModelingHours] = useState(0);
    const [modelingMinutes, setModelingMinutes] = useState(0);

    // Derived total hours for calculation
    const totalPrintingHours = printingHours + (printingMinutes / 60);
    const totalModelingHoursInput = modelingHours + (modelingMinutes / 60);

    // Financials (Manual) - Now representing BASE Price (Hardware/Print only)
    const [basePrice, setBasePrice] = useState(0);

    // Derived
    const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
    const precioGramo = selectedFilament?.precio_por_gramo || 0;
    const costoFilamento = gramosUnit * precioGramo;
    const costoImpresion = totalPrintingHours * COSTO_IMPRESORA_H;
    
    // Amortize modeling cost per unit
    const totalModelingCost = totalModelingHoursInput * COSTO_MODELADO_H;
    const amortizedModelingCost = cantidad > 0 ? totalModelingCost / cantidad : 0;
    const amortizedModelingHours = cantidad > 0 ? totalModelingHoursInput / cantidad : 0;

    // Total Production Cost (Unit) = Mat + PrintTime + AmortizedModeling
    const costoTotalUnit = costoFilamento + costoImpresion + amortizedModelingCost;
    
    // Suggested Pricing (just for printing part)
    const suggestedMin = totalPrintingHours * 1.0; 
    const suggestedMax = totalPrintingHours * 2.0;

    // Final Price to Customer (Unit) = Base Price (for print) + Amortized Modeling Cost
    const precioFinalUnit = basePrice + amortizedModelingCost;

    // Profit (Unit) = Base Price - (Material + PrintTime)
    // We exclude modeling cost from profit calc because it's effectively "paid" by the extra charge
    const gananciaUnit = basePrice - (costoFilamento + costoImpresion);

    useEffect(() => {
        if (open) {
            fetchFilaments();
            if (pieceToEdit) {
                setNombre(pieceToEdit.nombre_pieza);
                setDescripcion(pieceToEdit.descripcion_pieza || '');
                setCantidad(pieceToEdit.cantidad);
                setGramosUnit(pieceToEdit.gramos_usados);
                
                const pHours = Math.floor(pieceToEdit.tiempo_impresora_h);
                const pMinutes = Math.round((pieceToEdit.tiempo_impresora_h - pHours) * 60);
                setPrintingHours(pHours);
                setPrintingMinutes(pMinutes);
                
                // Load TOTAL modeling hours (Unit hours * Qty)
                const totalModHours = (pieceToEdit.tiempo_modelado_h || 0) * pieceToEdit.cantidad;
                const mHours = Math.floor(totalModHours);
                const mMinutes = Math.round((totalModHours - mHours) * 60);
                setModelingHours(mHours);
                setModelingMinutes(mMinutes);
                
                // Reverse engineer base price: Final Unit Price - Amortized Modeling Cost
                const unitModelCost = (pieceToEdit.tiempo_modelado_h || 0) * COSTO_MODELADO_H;
                setBasePrice(pieceToEdit.precio_final_unit - unitModelCost);
                
                setSelectedFilamentId(pieceToEdit.filamento_id);
            } else {
                // Reset
                setNombre('');
                setDescripcion('');
                setCantidad(1);
                setGramosUnit(0);
                setPrintingHours(0);
                setPrintingMinutes(0);
                setModelingHours(0);
                setModelingMinutes(0);
                setBasePrice(0);
                setSelectedFilamentId('');
            }
        }
    }, [open, pieceToEdit]);

    const fetchFilaments = async () => {
        const { data, error } = await supabase
            .from('inventario_filamento')
            .select('*')
            .order('color_tipo_filamento');
        if (error) {
            console.error("Error fetching filaments:", error);
        }
        if (data) setFilaments(data);
    };

    const handleSubmit = async () => {
        if (!nombre || !selectedFilamentId) return;
        setLoading(true);

        try {
            // 1. Prepare Payload
            const piecePayload = {
                trabajo_id: jobId,
                nombre_pieza: nombre,
                descripcion_pieza: descripcion,
                cantidad: cantidad,
                filamento_id: selectedFilamentId,
                gramos_usados: gramosUnit,
                
                precio_por_gramo_snapshot: precioGramo,
                costo_filamento_snapshot: costoFilamento,
                
                tiempo_impresora_h: totalPrintingHours,
                tiempo_modelado_h: amortizedModelingHours, // Save per-unit (amortized)
                costo_impresora_h_rate: COSTO_IMPRESORA_H,
                costo_modelado_h_rate: COSTO_MODELADO_H,
                
                venta_min_unit: suggestedMin,
                venta_max_unit: suggestedMax,
                
                costo_total_unit: costoTotalUnit,
                precio_final_unit: precioFinalUnit,
                ganancia_unit: gananciaUnit,
                
                total_venta: precioFinalUnit * cantidad,
                total_costo: costoTotalUnit * cantidad,
                total_ganancia: gananciaUnit * cantidad
            };

            let pieceId = pieceToEdit?.id;

            if (pieceToEdit) {
                 // Update
                 const { error: updateError } = await supabase
                    .from('piezas_trabajo')
                    .update(piecePayload)
                    .eq('id', pieceToEdit.id);

                 if (updateError) throw updateError;
            } else {
                 // Insert
                 const { data: pieceData, error: pieceError } = await supabase
                    .from('piezas_trabajo')
                    .insert([piecePayload])
                    .select()
                    .single();

                 if (pieceError) throw pieceError;
                 pieceId = pieceData.id;
            }

            // 2. Update/Insert Consumo Filamento
            if (pieceId) {
                // Delete old consumption
                await supabase
                    .from('consumo_filamento')
                    .delete()
                    .eq('pieza_id', pieceId);

                // Create new consumption
                const gramosTotales = gramosUnit * cantidad;
                const consumoPayload = {
                    pieza_id: pieceId,
                    filamento_id: selectedFilamentId,
                    gramos_usados: gramosTotales,
                    precio_por_gramo: precioGramo,
                    costo_filamento: gramosTotales * precioGramo
                };

                const { error: consumoError } = await supabase
                    .from('consumo_filamento')
                    .insert([consumoPayload]);

                if (consumoError) console.error("Error creating/updating consumption:", consumoError);
                
                // 3. Update Inventory Stock (Deduct Usage)
                let gramsToDeduct = gramosTotales;

                if (pieceToEdit) {
                    if (pieceToEdit.filamento_id !== selectedFilamentId) {
                        // Return stock to OLD filament
                        const oldTotal = pieceToEdit.gramos_usados * pieceToEdit.cantidad;
                        const { data: oldFilamentData } = await supabase
                            .from('inventario_filamento')
                            .select('stock_gramos_disponibles')
                            .eq('id', pieceToEdit.filamento_id)
                            .single();
                        
                        if (oldFilamentData) {
                             const restoredStock = (oldFilamentData.stock_gramos_disponibles || 0) + oldTotal;
                             await supabase
                                .from('inventario_filamento')
                                .update({ stock_gramos_disponibles: restoredStock })
                                .eq('id', pieceToEdit.filamento_id);
                        }
                        gramsToDeduct = gramosTotales; 

                    } else {
                        // Same filament, just adjust amount
                        const oldTotal = pieceToEdit.gramos_usados * pieceToEdit.cantidad;
                        gramsToDeduct = gramosTotales - oldTotal;
                    }
                }

                const { data: currentFilamentData } = await supabase
                    .from('inventario_filamento')
                    .select('stock_gramos_disponibles')
                    .eq('id', selectedFilamentId)
                    .single();

                if (currentFilamentData) {
                    const currentStock = currentFilamentData.stock_gramos_disponibles || 0;
                    const newStock = currentStock - gramsToDeduct;

                    await supabase
                        .from('inventario_filamento')
                        .update({ stock_gramos_disponibles: newStock })
                        .eq('id', selectedFilamentId);
                }
            }

            onPieceAdded();
            onOpenChange(false);

        } catch (error) {
            console.error("Error saving piece:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
         <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agregar Pieza al Pedido</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Left Column: Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nombre Pieza</Label>
                            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Engranaje Principal" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cantidad</Label>
                                <Input 
                                    type="number" 
                                    min="1" 
                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={cantidad === 0 ? '' : cantidad} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setCantidad(val === '' ? 0 : parseInt(val));
                                    }} 
                                />
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <Label className="mb-2">Filamento</Label>
                                <Popover open={openFilamentCombo} onOpenChange={setOpenFilamentCombo}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openFilamentCombo}
                                            className="w-full justify-between font-normal"
                                        >
                                            {selectedFilamentId
                                                ? filaments.find((f) => f.id === selectedFilamentId)?.color_tipo_filamento + ` (${filaments.find((f) => f.id === selectedFilamentId)?.material})`
                                                : "Seleccionar..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Buscar filamento..." />
                                            <CommandList>
                                                <CommandEmpty>No se encontró filamento.</CommandEmpty>
                                                <CommandGroup>
                                                    {filaments.map((f) => (
                                                        <CommandItem
                                                            key={f.id}
                                                            value={`${f.color_tipo_filamento} ${f.material} ${f.marca}`}
                                                            onSelect={() => {
                                                                setSelectedFilamentId(f.id);
                                                                setOpenFilamentCombo(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    selectedFilamentId === f.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span>{f.color_tipo_filamento} - {f.marca}</span>
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

                        <div className="space-y-2">
                             <Label>Tiempo Impresión</Label>
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Input 
                                        type="number" 
                                        placeholder="0" 
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12"
                                        min="0"
                                        value={printingHours === 0 ? '' : printingHours} 
                                        onChange={e => {
                                            const val = e.target.value;
                                            setPrintingHours(val === '' ? 0 : parseInt(val));
                                        }} 
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm text-gray-500 pointer-events-none">Horas</span>
                                </div>
                                <div className="flex-1 relative">
                                    <Input 
                                        type="number" 
                                        placeholder="0" 
                                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-14"
                                        min="0"
                                        max="59"
                                        value={printingMinutes === 0 ? '' : printingMinutes} 
                                        onChange={e => {
                                             const val = e.target.value;
                                             setPrintingMinutes(val === '' ? 0 : parseInt(val));
                                        }} 
                                    />
                                    <span className="absolute right-3 top-2.5 text-sm text-gray-500 pointer-events-none">Minutos</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Gramos (Unit)</Label>
                                <Input 
                                    type="number" 
                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={gramosUnit === 0 ? '' : gramosUnit} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setGramosUnit(val === '' ? 0 : parseFloat(val));
                                    }} 
                                />
                            </div>
                            <div className="space-y-2 col-span-1">
                                <Label>Tiempo Mod. (Total)</Label>
                                <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0" 
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-8"
                                            min="0"
                                            value={modelingHours === 0 ? '' : modelingHours} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setModelingHours(val === '' ? 0 : parseInt(val));
                                            }} 
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">h</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <Input 
                                            type="number" 
                                            placeholder="0" 
                                            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-8"
                                            min="0"
                                            max="59"
                                            value={modelingMinutes === 0 ? '' : modelingMinutes} 
                                            onChange={e => {
                                                 const val = e.target.value;
                                                 setModelingMinutes(val === '' ? 0 : parseInt(val));
                                            }} 
                                        />
                                        <span className="absolute right-2 top-2.5 text-xs text-gray-500 pointer-events-none">m</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <Label>Descripción (Opcional)</Label>
                            <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                        </div>
                    </div>

                    {/* Right Column: Calculations */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col justify-between">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Calculator className="h-4 w-4" />
                                Estructura de Costos (Unitario)
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Filamento ({gramosUnit}g * ${precioGramo.toFixed(2)}):</span>
                                    <span>${costoFilamento.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Impresión ({totalPrintingHours.toFixed(2)}h * ${COSTO_IMPRESORA_H}):</span>
                                    <span>${costoImpresion.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-blue-600 bg-blue-50 p-1 rounded font-medium">
                                    <span>+ Modelado ({totalModelingHoursInput.toFixed(2)}h total):</span>
                                    <span>${totalModelingCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                                    <span>Costo Prod. Unitario:</span>
                                    <span>${costoTotalUnit.toFixed(2)}</span>
                                </div>
                            </div>
                            
                             <div className="bg-naranja/5 p-3 rounded-lg text-xs text-naranja space-y-1">
                                <p className="font-semibold">Rango Sugerido (Impresión):</p>
                                <div className="flex justify-between">
                                    <span>Min: ${suggestedMin.toFixed(2)}</span>
                                    <span>Max: ${suggestedMax.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200 mt-4">
                            <div className="space-y-2">
                                <Label className="text-gray-900 font-semibold flex justify-between">
                                    <span>Precio Base (Impresión + Material)</span>
                                    <span className="text-xs font-normal text-gray-500 self-center">Sin incluir modelado</span>
                                </Label>
                                <Input 
                                    type="number" 
                                    className="text-lg"
                                    value={basePrice === 0 ? '' : basePrice} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setBasePrice(val === '' ? 0 : parseFloat(val));
                                    }} 
                                />
                            </div>
                            
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center text-lg font-bold text-naranja">
                                    <span>Total Venta:</span>
                                    <span>${((basePrice * cantidad) + totalModelingCost).toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="block text-xs text-gray-500">Ganancia Unit.</span>
                                    <span className={`block font-bold ${gananciaUnit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        ${gananciaUnit.toFixed(2)}
                                    </span>
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-white">
                                    <span className="block text-xs text-gray-300">Precio Unit. Final</span>
                                    <span className="block font-bold">
                                        ${precioFinalUnit.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={loading || !nombre || !selectedFilamentId}
                        className="bg-naranja hover:bg-orange-600 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Pieza
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

}
