'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioFilamento } from '@/components/admin/jobs/types';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, RefreshCw, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


export default function CalculadoraPage() {
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
    
    // Split Time
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
    
    // PieceForm logic was:
    // const suggestedMin = totalPrintingHours * 1.0; 
    // const suggestedMax = totalPrintingHours * 2.0;

    // This looks like a specific business rule for labor-only pricing helper.
    // I will stick to the exact logic found in PieceForm lines 65-66.
    
    const suggestedMin = totalPrintingHours * 1.0; 
    const suggestedMax = totalPrintingHours * 2.0;

    const gananciaUnit = precioFinalUnit - costoTotalUnit;

    useEffect(() => {
        fetchFilaments();
    }, []);

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

    const handleReset = () => {
        setNombre('');
        setDescripcion('');
        setCantidad(1);
        setGramosUnit(0);
        setPrintingHours(0);
        setPrintingMinutes(0);
        setTiempoMod(0);
        setPrecioFinalUnit(0);
        setSelectedFilamentId('');
    };

    return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Column: Inputs */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-gray-700">Nombre Referencia (Opcional)</Label>
                                    <Input 
                                        value={nombre} 
                                        onChange={e => setNombre(e.target.value)} 
                                        placeholder="Ej. Engranaje Cliente X" 
                                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Cantidad</Label>
                                        <Input 
                                            type="number" 
                                            min="1" 
                                            className="bg-gray-50 border-gray-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={cantidad === 0 ? '' : cantidad} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setCantidad(val === '' ? 0 : parseInt(val));
                                            }} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Filamento</Label>
                                        <Select value={selectedFilamentId} onValueChange={setSelectedFilamentId}>
                                            <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white">
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
                                        <Label className="text-gray-700">Gramos (Unit)</Label>
                                        <Input 
                                            type="number" 
                                            className="bg-gray-50 border-gray-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={gramosUnit === 0 ? '' : gramosUnit} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setGramosUnit(val === '' ? 0 : parseFloat(val));
                                            }} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-gray-700">Horas Mod.</Label>
                                        <Input 
                                            type="number" 
                                            className="bg-gray-50 border-gray-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            value={tiempoMod === 0 ? '' : tiempoMod} 
                                            onChange={e => {
                                                const val = e.target.value;
                                                setTiempoMod(val === '' ? 0 : parseFloat(val));
                                            }} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-700">Tiempo Impresión (Unit)</Label>
                                    <div className="flex gap-4">
                                        <div className="flex-1 relative">
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                className="bg-gray-50 border-gray-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12"
                                                min="0"
                                                value={printingHours === 0 ? '' : printingHours} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setPrintingHours(val === '' ? 0 : parseInt(val));
                                                }} 
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm text-gray-400 pointer-events-none">H</span>
                                        </div>
                                        <div className="flex-1 relative">
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                className="bg-gray-50 border-gray-200 focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none pr-12"
                                                min="0"
                                                max="59"
                                                value={printingMinutes === 0 ? '' : printingMinutes} 
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    setPrintingMinutes(val === '' ? 0 : parseInt(val));
                                                }} 
                                            />
                                            <span className="absolute right-3 top-2.5 text-sm text-gray-400 pointer-events-none">M</span>
                                        </div>
                                    </div>
                                </div>

                                 <div className="space-y-2">
                                    <Label className="text-gray-700">Notas / Descripción</Label>
                                    <Textarea 
                                        value={descripcion} 
                                        onChange={e => setDescripcion(e.target.value)} 
                                        className="bg-gray-50 border-gray-200 focus:bg-white min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* Right Column: Calculations */}
                            <div className="flex flex-col h-full bg-azul-oscuro/5 rounded-xl p-6 border border-azul-oscuro/10">
                                <div className="space-y-6 flex-grow">
                                    <h4 className="font-bold text-azul-oscuro flex items-center gap-2 text-lg">
                                        <Calculator className="h-5 w-5" />
                                        Estructura de Costos
                                    </h4>
                                    
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/50">
                                            <span>Filamento ({gramosUnit}g * ${precioGramo.toFixed(2)}):</span>
                                            <span className="font-mono">${costoFilamento.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/50">
                                            <span>Impresión ({totalPrintingHours.toFixed(2)}h * ${COSTO_IMPRESORA_H}):</span>
                                            <span className="font-mono">${(totalPrintingHours * COSTO_IMPRESORA_H).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 pb-2 border-b border-gray-200/50">
                                            <span>Modelado ({tiempoMod}h * ${COSTO_MODELADO_H}):</span>
                                            <span className="font-mono">${(tiempoMod * COSTO_MODELADO_H).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-azul-oscuro pt-2 text-base">
                                            <span>Costo Total Unitario:</span>
                                            <span className="font-mono">${costoTotalUnit.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                     <div className="bg-white p-4 rounded-lg text-sm text-azul-oscuro space-y-2 shadow-sm border border-gray-100">
                                        <p className="font-bold text-naranja">Rango Sugerido (Base Tiempo)</p>
                                        <div className="flex justify-between font-mono">
                                            <span>Min: ${suggestedMin.toFixed(2)}</span>
                                            <span>Max: ${suggestedMax.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-gray-200/50 mt-6">
                                    <div className="space-y-2">
                                        <Label className="text-naranja font-extrabold text-lg">Precio Final Unitario ($)</Label>
                                        <Input 
                                            type="number" 
                                            className="text-2xl font-bold h-14 bg-white border-naranja/30 focus:border-naranja focus:ring-naranja"
                                            value={precioFinalUnit} 
                                            onChange={e => setPrecioFinalUnit(parseFloat(e.target.value) || 0)} 
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Ganancia Unit.</span>
                                            <span className={`block font-bold text-xl ${gananciaUnit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                ${gananciaUnit.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="bg-azul-oscuro p-3 rounded-lg text-white shadow-lg">
                                            <span className="block text-xs text-white/70 uppercase tracking-wider font-semibold">Total Venta ({cantidad})</span>
                                            <span className="block font-bold text-xl">
                                                ${(precioFinalUnit * cantidad).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end pt-6 border-t border-gray-100">
                            <Button 
                                variant="outline" 
                                onClick={handleReset}
                                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-gray-200 gap-2"
                            >
                                <Eraser className="w-4 h-4" />
                                Limpiar Calculadora
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
    );
}
