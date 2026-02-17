'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import { InventarioFilamento } from '@/components/admin/jobs/types';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
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
    
    // Promo / Discount State
    const [isPromo, setIsPromo] = useState(false);
    const [actualCost, setActualCost] = useState<number>(0); // Price actually paid

    // Combobox State
    const [openFilamentCombo, setOpenFilamentCombo] = useState(false);

    const selectedFilament = currentInventory.find(f => f.id === selectedFilamentId);

    // Auto-fill cost from previous price if available
    useEffect(() => {
        if (selectedFilament && quantityToAdd > 0) {
            // Calculate cost based on existing price per gram
            const pricePerGram = selectedFilament.precio_por_gramo || 0;
            const calculatedCost = pricePerGram * quantityToAdd;
            setCost(calculatedCost);
            if (!isPromo) {
                setActualCost(calculatedCost);
            }
        }
    }, [selectedFilament, quantityToAdd, isPromo]);

    const handleSave = async () => {
        if (!selectedFilamentId || !quantityToAdd || cost < 0) return;
        setLoading(true);

        try {
            // 1. Insert into Purchase History
            const purchasePayload = {
                filamento_id: selectedFilamentId,
                cantidad_g: quantityToAdd,
                costo_total: isPromo ? actualCost : cost, 
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
            // STANDARD EXPENSE PAYLOAD
            const expensePayload = {
                tipo: 'gasto',
                categoria: 'Materia Prima',
                descripcion: `Compra Filamento: ${selectedFilament?.material} ${selectedFilament?.color_tipo_filamento} (${selectedFilament?.marca})`,
                monto: cost, // Standard Cost
                fecha: new Date().toISOString(),
                notas: isPromo ? 'Precio Estándar (Compra con Descuento)' : 'Generado automáticamente desde Inventario'
            };

            const { error: financeError } = await supabase
                .from('transacciones_financieras')
                .insert([expensePayload]);

            if (financeError) {
                console.error("Error creating finance record:", financeError);
                throw new Error(`Error registrando gasto financiero: ${financeError.message}`);
            }

            // IF PROMO: Register Income for the difference
            if (isPromo && (cost - actualCost) > 0) {
                const savings = cost - actualCost;
                const incomePayload = {
                    tipo: 'ingreso',
                    categoria: 'Otros Ingresos', 
                    descripcion: `Ahorro Promo Filamento: ${selectedFilament?.material} ${selectedFilament?.color_tipo_filamento}`,
                    monto: savings,
                    fecha: new Date().toISOString(),
                    notas: `Ahorro por compra en promoción (Estándar: $${cost}, Pagado: $${actualCost})`
                };

                 const { error: incomeError } = await supabase
                    .from('transacciones_financieras')
                    .insert([incomePayload]);

                if (incomeError) {
                    console.error("Error creating income record:", incomeError);
                    alert(`Advertencia: No se pudo registrar el ingreso por ahorro: ${incomeError.message}`);
                }
            }

            // 2. Update Inventory Stock (Price remains standard)
            const newStock = (selectedFilament?.stock_gramos_disponibles || 0) + quantityToAdd;            
            const { error: updateError } = await supabase
                .from('inventario_filamento')
                .update({ 
                    stock_gramos_disponibles: newStock,
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
            setIsPromo(false);
            setActualCost(0);

        } catch (error: any) {
            console.error("Error registering purchase:", error);
            alert(error.message || "Error al registrar la compra.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Registrar Compra de Filamento</DialogTitle>
                    <DialogDescription>Añadir stock a un filamento existente.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2 flex flex-col">
                        <Label className="mb-2">Filamento</Label>
                        <Popover open={openFilamentCombo} onOpenChange={setOpenFilamentCombo} modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openFilamentCombo}
                                    className={cn(
                                        "w-full justify-between font-normal",
                                        !selectedFilamentId && "text-muted-foreground" // Make it look like a placeholder
                                    )}
                                >
                                    {selectedFilamentId
                                        ? (() => {
                                            const f = currentInventory.find((item) => item.id === selectedFilamentId);
                                            return f ? `${f.color_tipo_filamento} (${f.material})` : "Buscar filamento...";
                                        })()
                                        : <span className="flex items-center gap-2"><Search className="h-4 w-4 opacity-50"/> Buscar filamento...</span>}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command shouldFilter={false}>
                                    <CommandInput placeholder="Escribe para buscar..." />
                                    <CommandList className="max-h-[300px] overflow-y-auto">
                                        <CommandEmpty>No se encontró filamento.</CommandEmpty>
                                        <CommandGroup>
                                            {currentInventory.map((f) => (
                                                <CommandItem
                                                    key={f.id}
                                                    value={`${f.color_tipo_filamento} ${f.material} ${f.marca}`}
                                                    onSelect={() => {
                                                        setSelectedFilamentId(f.id);
                                                        setOpenFilamentCombo(false);
                                                    }}
                                                    className="cursor-pointer" // Ensure mouse cursor shows clickability
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedFilamentId === f.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{f.color_tipo_filamento} - {f.marca}</span>
                                                        <span className="text-xs text-gray-500">{f.material} • ${f.precio_por_gramo?.toFixed(3)}/g</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
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
                                    <Label>Costo Estándar ($)</Label>
                                    <div className="h-10 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-600 font-mono">
                                        ${cost.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-gray-500">Normalmente: ${selectedFilament.precio_bobina?.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 py-2 border-t pt-4 mt-2">
                                <Switch 
                                    id="promo-mode" 
                                    checked={isPromo} 
                                    onCheckedChange={setIsPromo} 
                                />
                                <Label htmlFor="promo-mode" className="cursor-pointer">¿Compra en Promoción / Descuento?</Label>
                            </div>

                            {isPromo && (
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-3 animation-all duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-green-800 font-medium">Precio Real Pagado ($)</Label>
                                            <Input 
                                                type="number" 
                                                value={actualCost} 
                                                onChange={e => setActualCost(parseFloat(e.target.value))}
                                                className="border-green-200 focus:ring-green-500 bg-white" 
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-green-800 font-medium">Ahorro (Ganancia)</Label>
                                            <div className="h-10 flex items-center justify-between px-3 rounded-md border border-green-200 bg-white text-green-600 font-bold">
                                                <span>${(cost - actualCost).toFixed(2)}</span>
                                                <ArrowRight className="h-4 w-4 text-green-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-green-700 italic">
                                        Se registrará un gasto de ${cost.toFixed(2)} y un ingreso de ${(cost - actualCost).toFixed(2)}.
                                    </p>
                                </div>
                            )}
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
