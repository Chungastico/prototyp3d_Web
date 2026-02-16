'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventarioFilamento } from '@/components/admin/jobs/types';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus } from "lucide-react";

interface PurchaseModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentInventory: InventarioFilamento[];
    onSaved: () => void;
}

export function PurchaseModal({ open, onOpenChange, currentInventory, onSaved }: PurchaseModalProps) {
    const [loading, setLoading] = useState(false);
    
    const [selectedFilamentId, setSelectedFilamentId] = useState<string>('');
    const [quantityToAdd, setQuantityToAdd] = useState<number>(1000);
    const [cost, setCost] = useState<number>(0);

    const selectedFilament = currentInventory.find(f => f.id === selectedFilamentId);

    // Auto-fill cost from previous price if available
    // Auto-fill cost from previous price if available
    useEffect(() => {
        if (selectedFilament && quantityToAdd > 0) {
            // Calculate cost based on existing price per gram
            const pricePerGram = selectedFilament.precio_por_gramo || 0;
            const calculatedCost = pricePerGram * quantityToAdd;
            setCost(calculatedCost);
        }
    }, [selectedFilament, quantityToAdd]);

    const handleSave = async () => {
        if (!selectedFilamentId || !quantityToAdd || cost < 0) return;
        setLoading(true);

        try {
            // 1. Insert into Purchase History
            const purchasePayload = {
                filamento_id: selectedFilamentId,
                cantidad_g: quantityToAdd,
                costo_total: cost,
                fecha_compra: new Date().toISOString(),
                proveedor_id: selectedFilament?.proveedor_id
            };

            const { error: purchaseError } = await supabase
                .from('compras_filamento')
                .insert([purchasePayload]);

            if (purchaseError) {
                console.error("Error creating purchase record:", purchaseError);
                throw new Error(`Error guardando historial: ${purchaseError.message}`);
            }

            // 1.5 Insert into Finance Transactions
            const transactionPayload = {
                tipo: 'gasto',
                categoria: 'Materia Prima',
                descripcion: `Compra Filamento: ${selectedFilament?.material} ${selectedFilament?.color_tipo_filamento} (${selectedFilament?.marca})`,
                monto: cost,
                fecha: new Date().toISOString(),
                notas: 'Generado automáticamente desde Inventario'
            };

            const { error: financeError } = await supabase
                .from('transacciones_financieras')
                .insert([transactionPayload]);

            if (financeError) {
                console.error("Error creating finance record:", financeError);
                throw new Error(`Error registrando gasto financiero: ${financeError.message}`);
            }

            // 2. Update Inventory Stock & Prices
            const newStock = (selectedFilament?.stock_gramos_disponibles || 0) + quantityToAdd;            
            const { error: updateError } = await supabase
                .from('inventario_filamento')
                .update({ 
                    stock_gramos_disponibles: newStock,
                    // precio_bobina: cost, // Removed per user request (cost is constant)
                    // precio_por_gramo: newPricePerGram // Removed per user request
                })
                .eq('id', selectedFilamentId);

            if (updateError) {
                 console.error("Error updating inventory:", updateError);
                 throw new Error(`Error actualizando stock: ${updateError.message}`);
            }

            onSaved();
            onOpenChange(false);
            // Reset fields
            setSelectedFilamentId('');
            setQuantityToAdd(1000);
            setCost(0);

        } catch (error: any) {
            console.error("Error registering purchase:", error);
            alert(error.message || "Error al registrar la compra.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Registrar Compra de Filamento</DialogTitle>
                    <DialogDescription>Añadir stock a un filamento existente.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Filamento</Label>
                        <Select value={selectedFilamentId} onValueChange={setSelectedFilamentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar material..." />
                            </SelectTrigger>
                            <SelectContent>
                                {currentInventory.map(f => (
                                    <SelectItem key={f.id} value={f.id}>
                                        {f.material} {f.color_tipo_filamento} ({f.marca})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedFilament && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Cantidad (gramos)</Label>
                                    <Input 
                                        type="number" 
                                        value={quantityToAdd} 
                                        onChange={e => setQuantityToAdd(parseFloat(e.target.value))} 
                                    />
                                    <p className="text-xs text-gray-500">Stock actual: {selectedFilament.stock_gramos_disponibles}g</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Costo Calculado ($)</Label>
                                    <div className="h-10 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-600 font-mono">
                                        ${cost.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-gray-500">Basado en precio actual (${selectedFilament.precio_bobina?.toFixed(2)}/rollo)</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading || !selectedFilamentId} className="bg-naranja text-white hover:bg-orange-600">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Plus className="mr-2 h-4 w-4" /> Registrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
