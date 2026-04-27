'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioObjeto, Proveedor } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ObjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    objectToEdit?: InventarioObjeto | null;
    onSaved: () => void;
}

export function ObjectModal({ open, onOpenChange, objectToEdit, onSaved }: ObjectModalProps) {
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState<Proveedor[]>([]);

    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [proveedorId, setProveedorId] = useState<string>('none');
    const [costoUnitario, setCostoUnitario] = useState(0);
    const [stockDisponible, setStockDisponible] = useState(0);

    useEffect(() => {
        if (open) {
            fetchProviders();
            if (objectToEdit) {
                setNombre(objectToEdit.nombre || '');
                setDescripcion(objectToEdit.descripcion || '');
                setProveedorId(objectToEdit.proveedor_id || 'none');
                setCostoUnitario(objectToEdit.costo_unitario || 0);
                setStockDisponible(objectToEdit.stock_disponible || 0);
            } else {
                setNombre('');
                setDescripcion('');
                setProveedorId('none');
                setCostoUnitario(0);
                setStockDisponible(0);
            }
        }
    }, [open, objectToEdit]);

    const fetchProviders = async () => {
        const { data } = await supabase.from('proveedores').select('*').order('nombre_proveedor');
        if (data) setProviders(data);
    };

    const handleSave = async () => {
        if (!nombre.trim()) return;
        setLoading(true);

        const payload = {
            nombre,
            descripcion: descripcion || null,
            proveedor_id: proveedorId === 'none' ? null : proveedorId,
            costo_unitario: costoUnitario,
            precio_venta: costoUnitario, // Always keep it equal to cost internally for DB compat
            stock_disponible: stockDisponible,
        };

        let resultError = null;

        if (objectToEdit) {
            const { error } = await supabase
                .from('inventario_objetos')
                .update(payload)
                .eq('id', objectToEdit.id);
            resultError = error;
        } else {
            const { error } = await supabase
                .from('inventario_objetos')
                .insert([payload]);
            resultError = error;
        }

        setLoading(false);
        if (resultError) {
            console.error("Error saving object:", resultError);
            alert("Error al guardar. Verifica la consola.");
        } else {
            onSaved();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{objectToEdit ? 'Editar Objeto/Extra' : 'Nuevo Objeto/Extra'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Nombre / Concepto (Ej. Argolla de Llavero)</Label>
                        <Input value={nombre} onChange={e => setNombre(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Descripción (Opcional)</Label>
                        <Textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                        <Label>Proveedor</Label>
                        <Select value={proveedorId} onValueChange={setProveedorId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin Proveedor</SelectItem>
                                {providers.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre_proveedor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Costo de Compra ($)</Label>
                        <Input 
                            type="number" 
                            min="0" step="0.01"
                            value={costoUnitario === 0 ? '' : costoUnitario} 
                            onChange={e => setCostoUnitario(parseFloat(e.target.value) || 0)} 
                        />
                    </div>

                    {!objectToEdit && (
                        <div className="space-y-2 pt-2 border-t mt-2">
                            <Label>Stock Inicial (Opcional)</Label>
                            <Input 
                                type="number" 
                                min="0" 
                                value={stockDisponible === 0 ? '' : stockDisponible} 
                                onChange={e => setStockDisponible(parseInt(e.target.value) || 0)} 
                                placeholder="0"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={loading || !nombre.trim()}
                        className="bg-naranja hover:bg-orange-600 text-white"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar Objeto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
