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
    const [concepto, setConcepto] = useState('');
    const [precioUnitario, setPrecioUnitario] = useState<string>('');
    const [selectedPieceId, setSelectedPieceId] = useState<string>('none');
    const [quantity, setQuantity] = useState(1);
    const [isPieceType, setIsPieceType] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        if (!concepto.trim()) {
            alert("El concepto no puede estar vacío.");
            return;
        }
        
        const price = parseFloat(precioUnitario);
        if (isNaN(price) || price < 0) {
            alert("Ingrese un precio válido.");
            return;
        }
        
        setLoading(true);

        const subtotal = price * quantity;
        const targetPieceId = isPieceType && selectedPieceId !== 'none' ? selectedPieceId : null;
        const targetJobId = !isPieceType ? jobId : null;

        if (isPieceType && !targetPieceId) {
            alert("Este extra se aplica a una pieza. Por favor selecciona una.");
            setLoading(false);
            return;
        }

        const payload = {
            extra_id: null,
            concepto: concepto.trim(), // new text column
            trabajo_id: targetJobId,
            pieza_id: targetPieceId,
            cantidad: quantity,
            precio_unitario_snapshot: price,
            subtotal: subtotal,
            es_costo: true, // Assuming default true based on old logic, but it's an extra...
            es_venta: true
        };

        const { error } = await supabase.from('extras_aplicados').insert([payload]);

        if (error) {
            console.error("Error applying extra:", error);
            alert("Error agregando el extra.");
        } else {
            onExtraApplied();
            setQuantity(1);
            setConcepto('');
            setPrecioUnitario('');
            setSelectedPieceId('none');
            setIsPieceType(false);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-100 space-y-4">
            <h3 className="font-medium text-gray-900">Agregar Extras / Servicios Manuales</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div className="space-y-1.5 md:col-span-2">
                    <Label>Concepto (Ej: Envío)</Label>
                    <Input 
                        placeholder="Escribe el nombre del extra..." 
                        value={concepto}
                        onChange={e => setConcepto(e.target.value)}
                    />
                </div>

                <div className="space-y-1.5">
                    <Label>Precio U.</Label>
                    <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={precioUnitario}
                        onChange={e => setPrecioUnitario(e.target.value)}
                    />
                </div>

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
                    disabled={loading || !concepto.trim() || !precioUnitario}
                    className="bg-gray-900 text-white hover:bg-gray-800"
                >
                    Agregar
                </Button>
            </div>
        </div>
    );
}

