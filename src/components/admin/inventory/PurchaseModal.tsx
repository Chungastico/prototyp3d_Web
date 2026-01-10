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
    useEffect(() => {
        if (selectedFilament) {
            // Estimate cost based on previous price/g or bobina price? 
            // Better to let user input the *new* cost of this purchase.
            // But we can default to the stored `precio_bobina` if the quantity matches standard size.
            // Let's just default to stored price for convenience.
            setCost(selectedFilament.precio_bobina || 0);
        }
    }, [selectedFilament]);

    const handleSave = async () => {
        if (!selectedFilamentId || !quantityToAdd || cost < 0) return;
        setLoading(true);

        try {
            // 1. Update Inventory Stock
            const newStock = (selectedFilament?.stock_gramos_disponibles || 0) + quantityToAdd;
            
            // Optionally update the 'current price' if it changed?
            // The user might want the system to reflect the LATEST price.
            // Let's update `precio_bobina` and `precio_por_gramo` to the new values if provided.
            const newPricePerGram = quantityToAdd > 0 ? (cost / quantityToAdd) : (selectedFilament?.precio_por_gramo || 0);

            const { error: updateError } = await supabase
                .from('inventario_filamento')
                .update({ 
                    stock_gramos_disponibles: newStock,
                    precio_bobina: cost, // Updating to latest purchase price
                    precio_por_gramo: newPricePerGram 
                })
                .eq('id', selectedFilamentId);

            if (updateError) throw updateError;

            // 2. Future: Log purchase in a `movimientos` table if/when created.

            onSaved();
            onOpenChange(false);
            // Reset fields
            setSelectedFilamentId('');
            setQuantityToAdd(1000);
            setCost(0);

        } catch (error) {
            console.error("Error registering purchase:", error);
            alert("Error al registrar la compra.");
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
                                    <Label>Costo Total ($)</Label>
                                    <Input 
                                        type="number" 
                                        value={cost} 
                                        onChange={e => setCost(parseFloat(e.target.value))} 
                                    />
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
