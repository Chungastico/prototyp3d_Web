'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioObjeto } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";

interface AdjustObjectStockModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    objectItem: InventarioObjeto | null;
    onSaved: () => void;
}

export function AdjustObjectStockModal({ open, onOpenChange, objectItem, onSaved }: AdjustObjectStockModalProps) {
    const [loading, setLoading] = useState(false);
    const [cantidadAgregada, setCantidadAgregada] = useState(0);

    useEffect(() => {
        if (open) {
            setCantidadAgregada(0);
        }
    }, [open]);

    const handleSave = async () => {
        if (!objectItem || cantidadAgregada <= 0) return;
        setLoading(true);

        const newStock = (objectItem.stock_disponible || 0) + cantidadAgregada;
        const totalCosto = cantidadAgregada * (objectItem.costo_unitario || 0);

        try {
            // 1. Update Stock
            const { error: updateError } = await supabase
                .from('inventario_objetos')
                .update({ stock_disponible: newStock })
                .eq('id', objectItem.id);

            if (updateError) throw updateError;

            // 2. Automatically register Expense
            if (totalCosto > 0) {
                const gastoPayload = {
                    tipo: 'gasto',
                    categoria: 'Inventario Objetos',
                    descripcion: `Compra de inventario: ${objectItem.nombre} (${cantidadAgregada} unds)`,
                    monto: totalCosto,
                    fecha: new Date().toISOString().split('T')[0],
                    notas: `Proveedor ID: ${objectItem.proveedor_id || 'N/A'}`
                };

                const { error: gastoError } = await supabase
                    .from('transacciones_financieras')
                    .insert([gastoPayload]);
                
                if (gastoError) {
                    console.error("Error registrando gasto:", gastoError);
                }
            }

            onSaved();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating stock:", error);
            alert("Ocurrió un error al actualizar el stock.");
        } finally {
            setLoading(false);
        }
    };

    if (!objectItem) return null;

    const totalCosto = cantidadAgregada * (objectItem.costo_unitario || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Añadir Stock: {objectItem.nombre}</DialogTitle>
                    <DialogDescription>
                        Registra la entrada de nuevas unidades al stock.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-600 mb-2">
                        <div className="flex justify-between">
                            <span>Stock Actual:</span>
                            <span className="font-bold">{objectItem.stock_disponible} unds.</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Costo Unitario Ref:</span>
                            <span>${(objectItem.costo_unitario || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Unidades a Añadir al Stock</Label>
                        <Input 
                            type="number" 
                            min="1" 
                            value={cantidadAgregada === 0 ? '' : cantidadAgregada} 
                            onChange={e => setCantidadAgregada(parseInt(e.target.value) || 0)} 
                        />
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-gray-200 mt-2">
                        <div className="flex justify-between items-center text-sm font-bold text-naranja mb-3">
                            <span>Costo de Compra Estimado:</span>
                            <span>${totalCosto.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2 bg-naranja/10 p-2 rounded border border-naranja/20 text-naranja">
                            <Label className="text-xs font-semibold leading-tight">
                                Este monto se registrará automáticamente como "Gasto de Producción" en Finanzas.
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading || cantidadAgregada <= 0}
                        className="bg-naranja hover:bg-orange-600 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar y Registrar Gasto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
