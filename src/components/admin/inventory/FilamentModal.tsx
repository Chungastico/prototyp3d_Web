'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventarioFilamento, Proveedor } from '@/components/admin/jobs/types';
import { supabase } from '@/lib/supabase';
import { Loader2 } from "lucide-react";

interface FilamentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filamentToEdit?: InventarioFilamento | null;
    onSaved: () => void;
}

export function FilamentModal({ open, onOpenChange, filamentToEdit, onSaved }: FilamentModalProps) {
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState<Proveedor[]>([]);

    // Form State
    const [colorTipo, setColorTipo] = useState('');
    const [marca, setMarca] = useState('');
    const [material, setMaterial] = useState('');
    const [diametro, setDiametro] = useState('1.75mm');
    const [proveedorId, setProveedorId] = useState<string>('none'); // "none" handles unselected
    const [cantidadBobina, setCantidadBobina] = useState<number>(1000);
    const [precioBobina, setPrecioBobina] = useState<number>(0);
    const [notas, setNotas] = useState('');
    
    // Read-only calculated
    const precioPorGramo = cantidadBobina > 0 ? precioBobina / cantidadBobina : 0;

    useEffect(() => {
        if (open) {
            fetchProviders();
            if (filamentToEdit) {
                setColorTipo(filamentToEdit.color_tipo_filamento);
                setMarca(filamentToEdit.marca || '');
                setMaterial(filamentToEdit.material);
                setDiametro(filamentToEdit.diametro || '1.75mm');
                setProveedorId(filamentToEdit.proveedor_id || 'none');
                setCantidadBobina(filamentToEdit.cantidad_bobina_gramos || 1000);
                setPrecioBobina(filamentToEdit.precio_bobina || 0);
                setNotas(filamentToEdit.notas || '');
            } else {
                // Reset for new
                setColorTipo('');
                setMarca('');
                setMaterial('PLA');
                setDiametro('1.75mm');
                setProveedorId('none');
                setCantidadBobina(1000);
                setPrecioBobina(0);
                setNotas('');
            }
        }
    }, [open, filamentToEdit]);

    const fetchProviders = async () => {
        const { data } = await supabase.from('proveedores').select('*').order('nombre_proveedor');
        if (data) setProviders(data);
    };

    const handleSave = async () => {
        if (!colorTipo || !material || !cantidadBobina || !precioBobina) return;
        setLoading(true);

        const payload = {
            color_tipo_filamento: colorTipo,
            marca: marca || null,
            material: material,
            diametro: diametro || null,
            proveedor_id: proveedorId === 'none' ? null : proveedorId,
            cantidad_bobina_gramos: cantidadBobina,
            precio_bobina: precioBobina,
            notas: notas || null
        };

        try {
            if (filamentToEdit) {
                const { error } = await supabase
                    .from('inventario_filamento')
                    .update(payload)
                    .eq('id', filamentToEdit.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('inventario_filamento')
                    .insert([payload]);
                if (error) throw error;
            }
            onSaved();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving filament:", error);
            alert("Error al guardar filamento. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{filamentToEdit ? 'Editar Filamento' : 'Nuevo Filamento'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Color / Tipo *</Label>
                            <Input value={colorTipo} onChange={e => setColorTipo(e.target.value)} placeholder="Ej. PLA Rojo Mate" />
                        </div>
                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Input value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ej. Polymaker" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Material *</Label>
                            <Input value={material} onChange={e => setMaterial(e.target.value)} placeholder="PLA, PETG, ABS..." />
                        </div>
                        <div className="space-y-2">
                            <Label>Diámetro</Label>
                            <Input value={diametro} onChange={e => setDiametro(e.target.value)} placeholder="1.75mm" />
                        </div>
                    </div>

                    <div className="space-y-2">
                         <Label>Proveedor</Label>
                         <Select value={proveedorId} onValueChange={setProveedorId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar proveedor..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">-- Ninguno --</SelectItem>
                                {providers.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.nombre_proveedor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                         <div className="space-y-2">
                            <Label>Peso Bobina (g) *</Label>
                            <Input type="number" value={cantidadBobina} onChange={e => setCantidadBobina(parseFloat(e.target.value))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Precio Bobina ($) *</Label>
                            <Input type="number" value={precioBobina} onChange={e => setPrecioBobina(parseFloat(e.target.value))} />
                        </div>
                        <div className="space-y-2 text-right">
                            <Label className="text-gray-500 text-xs">Precio / gramo</Label>
                            <div className="text-xl font-bold text-naranja">
                                ${precioPorGramo.toFixed(4)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Notas</Label>
                        <Textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Temp. recomendada, flujo, etc." />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading || !colorTipo || !material} className="bg-naranja text-white hover:bg-orange-600">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
