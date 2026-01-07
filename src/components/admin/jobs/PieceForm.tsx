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

export function PieceForm({ open, onOpenChange, jobId, onPieceAdded }: PieceFormProps) {
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
    const [tiempoImp, setTiempoImp] = useState(0); // hours
    const [tiempoMod, setTiempoMod] = useState(0); // hours
    
    // Financials (Manual)
    const [precioFinalUnit, setPrecioFinalUnit] = useState(0);

    // Derived
    const selectedFilament = filaments.find(f => f.id === selectedFilamentId);
    const precioGramo = selectedFilament?.precio_por_gramo || 0;
    const costoFilamento = gramosUnit * precioGramo;
    const costoTotalUnit = costoFilamento + (tiempoImp * COSTO_IMPRESORA_H) + (tiempoMod * COSTO_MODELADO_H);
    
    const suggestedMin = tiempoImp * 1.0; // Placeholder logic from prompt (tiempo * 1) ? Re-read prompt: "venta_min_unit = tiempo_impresora_h * 1"
    const suggestedMax = tiempoImp * 2.0;

    const gananciaUnit = precioFinalUnit - costoTotalUnit;

    useEffect(() => {
        if (open) {
            fetchFilaments();
            // Reset
            setNombre('');
            setDescripcion('');
            setCantidad(1);
            setGramosUnit(0);
            setTiempoImp(0);
            setTiempoMod(0);
            setPrecioFinalUnit(0);
            setSelectedFilamentId('');
        }
    }, [open]);

    const fetchFilaments = async () => {
        const { data } = await supabase
            .from('inventario_filamento')
            .select('*')
            .order('nombre');
        if (data)  setFilaments(data);
    };

    const handleSubmit = async () => {
        if (!nombre || !selectedFilamentId) return;
        setLoading(true);

        try {
            // 1. Insert Piece
            const piecePayload = {
                trabajo_id: jobId,
                nombre_pieza: nombre,
                descripcion_pieza: descripcion,
                cantidad: cantidad,
                filamento_id: selectedFilamentId,
                gramos_usados: gramosUnit,
                
                precio_por_gramo_snapshot: precioGramo,
                costo_filamento_snapshot: costoFilamento,
                
                tiempo_impresora_h: tiempoImp,
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

            const { data: pieceData, error: pieceError } = await supabase
                .from('piezas_trabajo')
                .insert([piecePayload])
                .select()
                .single();

            if (pieceError) throw pieceError;

            // 2. Insert Consumo Filamento
            // "Every piece must generate a related consumo_filamento row"
            // "gramos_usados must be GLOBAL (unit * qty)"
            if (pieceData) {
                const consumoPayload = {
                    pieza_id: pieceData.id,
                    filamento_id: selectedFilamentId,
                    gramos_usados: gramosUnit * cantidad, 
                    precio_por_gramo: precioGramo,
                    costo_filamento: (gramosUnit * cantidad) * precioGramo // Total cost of filament used
                };

                const { error: consumoError } = await supabase
                    .from('consumo_filamento')
                    .insert([consumoPayload]);
                
                if (consumoError) console.error("Error creating consumption:", consumoError);
            }

            onPieceAdded();
            onOpenChange(false);

        } catch (error) {
            console.error("Error creating piece:", error);
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
                                <Input type="number" min="1" value={cantidad} onChange={e => setCantidad(parseInt(e.target.value) || 1)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Filamento</Label>
                                <Select value={selectedFilamentId} onValueChange={setSelectedFilamentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filaments.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.nombre} ({f.color}) - ${f.precio_por_gramo}/g</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Gramos (Unit)</Label>
                                <Input type="number" value={gramosUnit} onChange={e => setGramosUnit(parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Horas Imp.</Label>
                                <Input type="number" value={tiempoImp} onChange={e => setTiempoImp(parseFloat(e.target.value) || 0)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Horas Mod.</Label>
                                <Input type="number" value={tiempoMod} onChange={e => setTiempoMod(parseFloat(e.target.value) || 0)} />
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
                                    <span>Impresión ({tiempoImp}h * ${COSTO_IMPRESORA_H}):</span>
                                    <span>${(tiempoImp * COSTO_IMPRESORA_H).toFixed(2)}</span>
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
                                    value={precioFinalUnit} 
                                    onChange={e => setPrecioFinalUnit(parseFloat(e.target.value) || 0)} 
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
