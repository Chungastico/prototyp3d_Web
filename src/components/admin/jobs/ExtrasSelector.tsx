'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CatalogoExtra, PiezaTrabajo } from './types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExtrasSelectorProps {
    jobId: string;
    pieces: PiezaTrabajo[]; // To allow selecting a piece if extra is per-piece
    onExtraApplied: () => void;
}

export function ExtrasSelector({ jobId, pieces, onExtraApplied }: ExtrasSelectorProps) {
    const [catalog, setCatalog] = useState<CatalogoExtra[]>([]);
    const [selectedExtraId, setSelectedExtraId] = useState<string>('');
    const [selectedPieceId, setSelectedPieceId] = useState<string>('none');
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCatalog = async () => {
            const { data } = await supabase.from('catalogo_extras').select('*').order('nombre');
            if (data) setCatalog(data);
        };
        fetchCatalog();
    }, []);

    const selectedExtra = catalog.find(e => e.id === selectedExtraId);

    const handleApply = async () => {
        if (!selectedExtra) return;
        setLoading(true);

        const subtotal = selectedExtra.precio_unitario * quantity;

        // Validation based on type
        const isPieceType = selectedExtra.tipo_aplicacion === 'pieza';
        const targetPieceId = isPieceType && selectedPieceId !== 'none' ? selectedPieceId : null;
        const targetJobId = !isPieceType ? jobId : null;

        // Constraint check: if type is 'pieza', must select a piece
        if (isPieceType && !targetPieceId) {
            alert("Este extra se aplica a una pieza. Por favor selecciona una.");
            setLoading(false);
            return;
        }

        const payload = {
            extra_id: selectedExtra.id,
            trabajo_id: targetJobId,
            pieza_id: targetPieceId,
            cantidad: quantity,
            precio_unitario_snapshot: selectedExtra.precio_unitario,
            subtotal: subtotal,
            es_costo: true, // Defaulting based on prompt logic
            es_venta: true
        };

        const { error } = await supabase.from('extras_aplicados').insert([payload]);

        if (error) {
            console.error("Error applying extra:", error);
        } else {
            onExtraApplied();
            // Reset
            setQuantity(1);
            setSelectedExtraId('');
            setSelectedPieceId('none');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-medium text-gray-900">Agregar Extras / Servicios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-2">
                    <Label>Concepto</Label>
                    <Select value={selectedExtraId} onValueChange={setSelectedExtraId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Seleccionar..." />
                        </SelectTrigger>
                        <SelectContent>
                            {catalog.map(extra => (
                                <SelectItem key={extra.id} value={extra.id}>
                                    {extra.nombre} (${extra.precio_unitario}) - {extra.tipo_aplicacion === 'pedido' ? 'Global' : 'Por Pieza'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedExtra?.tipo_aplicacion === 'pieza' && (
                     <div className="space-y-1.5">
                        <Label>Aplicar a Pieza</Label>
                        <Select value={selectedPieceId} onValueChange={setSelectedPieceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pieza..." />
                            </SelectTrigger>
                            <SelectContent>
                                {pieces.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre_pieza}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-1.5">
                    <Label>Cantidad</Label>
                    <Input 
                        type="number" 
                        min="1" 
                        value={quantity} 
                        onChange={e => setQuantity(parseInt(e.target.value) || 1)} 
                    />
                </div>

                <Button 
                    onClick={handleApply} 
                    disabled={loading || !selectedExtraId}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                >
                    Agregar
                </Button>
            </div>
        </div>
    );
}
