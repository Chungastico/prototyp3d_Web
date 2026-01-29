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

interface PieceFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    jobId: string;
    onPieceAdded: () => void;
}

export function PieceForm({ open, onOpenChange, jobId, onPieceAdded, pieceToEdit }: PieceFormProps & { pieceToEdit?: PiezaTrabajo | null }) {
    const [loading, setLoading] = useState(false);
    const [filaments, setFilaments] = useState<InventarioFilamento[]>([]);
    
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
    // Derived total hours for calculation
    const totalPrintingHours = printingHours + (printingMinutes / 60);

    const [tiempoMod, setTiempoMod] = useState(0); // hours
    
    // Financials (Manual)
    const [precioFinalUnit, setPrecioFinalUnit] = useState(0);

    // Derived
    const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
    const precioGramo = selectedFilament?.precio_por_gramo || 0;
    const costoFilamento = gramosUnit * precioGramo;
    const costoTotalUnit = costoFilamento + (totalPrintingHours * COSTO_IMPRESORA_H) + (tiempoMod * COSTO_MODELADO_H);
    
    const suggestedMin = totalPrintingHours * 1.0; 
    const suggestedMax = totalPrintingHours * 2.0;

    const gananciaUnit = precioFinalUnit - costoTotalUnit;

    useEffect(() => {
        if (open) {
            fetchFilaments();
            if (pieceToEdit) {
                setNombre(pieceToEdit.nombre_pieza);
                setDescripcion(pieceToEdit.descripcion_pieza || '');
                setCantidad(pieceToEdit.cantidad);
                setGramosUnit(pieceToEdit.gramos_usados);
                
                const hours = Math.floor(pieceToEdit.tiempo_impresora_h);
                const minutes = Math.round((pieceToEdit.tiempo_impresora_h - hours) * 60);
                setPrintingHours(hours);
                setPrintingMinutes(minutes);
                
                setTiempoMod(pieceToEdit.tiempo_modelado_h || 0);
                setPrecioFinalUnit(pieceToEdit.precio_final_unit);
                setSelectedFilamentId(pieceToEdit.filamento_id);
            } else {
                // Reset
                setNombre('');
                setDescripcion('');
                setCantidad(1);
                setGramosUnit(0);
                setPrintingHours(0);
                setPrintingMinutes(0);
                setTiempoMod(0);
                setPrecioFinalUnit(0);
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
                tiempo_modelado_h: tiempoMod,
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
            // Simple approach: Delete existing consumption for this piece and recreate it.
            // This handles changing filament type, quantity, etc. cleanly.
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
                // Calculate net change in consumption
                let gramsToDeduct = gramosTotales;

                if (pieceToEdit) {
                    // If editing, we only deduct the DIFFERENCE (New - Old)
                    // If we used MORE, gramsToDeduct is positive (Stock goes down)
                    // If we used LESS, gramsToDeduct is negative (Stock goes up)
                    
                    // Check if filament changed. If changed, we need to return stock to old filament and take from new.
                    if (pieceToEdit.filamento_id !== selectedFilamentId) {
                        // Complex case: Return stock to OLD filament
                        const oldTotal = pieceToEdit.gramos_usados * pieceToEdit.cantidad;
                        // We need to fetch the old filament's current stock to update it properly
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
                        
                        // Treat the new filament as a fresh deduction
                        gramsToDeduct = gramosTotales; 

                    } else {
                        // Same filament, just adjust amount
                        const oldTotal = pieceToEdit.gramos_usados * pieceToEdit.cantidad;
                        gramsToDeduct = gramosTotales - oldTotal;
                    }
                }

                // Fetch latest stock for the CURRENT target filament to ensure accuracy
                const { data: currentFilamentData } = await supabase
                    .from('inventario_filamento')
                    .select('stock_gramos_disponibles')
                    .eq('id', selectedFilamentId)
                    .single();

                if (currentFilamentData) {
                    const currentStock = currentFilamentData.stock_gramos_disponibles || 0;
                    const newStock = currentStock - gramsToDeduct;

                    const { error: stockError } = await supabase
                        .from('inventario_filamento')
                        .update({ stock_gramos_disponibles: newStock })
                        .eq('id', selectedFilamentId);
                    
                    if (stockError) console.error("Error updating stock:", stockError);
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
                            <div className="space-y-2">
                                <Label>Filamento</Label>
                                <Select value={selectedFilamentId} onValueChange={setSelectedFilamentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filaments.map(f => (
                                            <SelectItem key={f.id} value={f.id}>
                                                {f.color_tipo_filamento}
                                                {f.marca ? ` - ${f.marca}` : ''} ({f.material}) - ${f.precio_por_gramo.toFixed(2)}/g
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                            <div className="space-y-2">
                                <Label>Horas Mod.</Label>
                                <Input 
                                    type="number" 
                                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    value={tiempoMod === 0 ? '' : tiempoMod} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setTiempoMod(val === '' ? 0 : parseFloat(val));
                                    }} 
                                />
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
                                    <span>${(totalPrintingHours * COSTO_IMPRESORA_H).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Modelado ({tiempoMod}h * ${COSTO_MODELADO_H}):</span>
                                    <span>${(tiempoMod * COSTO_MODELADO_H).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                                    <span>Costo Total Unitario:</span>
                                    <span>${costoTotalUnit.toFixed(2)}</span>
                                </div>
                            </div>
                            
                             <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 space-y-1">
                                <p className="font-semibold">Rango Sugerido:</p>
                                <div className="flex justify-between">
                                    <span>Min: ${suggestedMin.toFixed(2)}</span>
                                    <span>Max: ${suggestedMax.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-200 mt-4">
                            <div className="space-y-2">
                                <Label className="text-naranja font-bold">Precio Final Unitario ($)</Label>
                                <Input 
                                    type="number" 
                                    className="text-lg font-bold"
                                    value={precioFinalUnit === 0 ? '' : precioFinalUnit} 
                                    onChange={e => {
                                        const val = e.target.value;
                                        setPrecioFinalUnit(val === '' ? 0 : parseFloat(val));
                                    }} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <span className="block text-xs text-gray-500">Ganancia Unit.</span>
                                    <span className={`block font-bold ${gananciaUnit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        ${gananciaUnit.toFixed(2)}
                                    </span>
                                </div>
                                <div className="bg-gray-900 p-2 rounded text-white">
                                    <span className="block text-xs text-gray-300">Total Venta ({cantidad})</span>
                                    <span className="block font-bold">
                                        ${(precioFinalUnit * cantidad).toFixed(2)}
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
