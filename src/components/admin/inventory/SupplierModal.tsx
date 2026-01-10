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
import { Proveedor } from '@/components/admin/jobs/types';
import { supabase } from '@/lib/supabase';
import { Loader2 } from "lucide-react";

interface SupplierModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplierToEdit?: Proveedor | null;
    onSaved: () => void;
}

export function SupplierModal({ open, onOpenChange, supplierToEdit, onSaved }: SupplierModalProps) {
    const [loading, setLoading] = useState(false);

    // Form State
    const [nombre, setNombre] = useState('');
    const [ubicacion, setUbicacion] = useState('');
    const [paginaWeb, setPaginaWeb] = useState('');
    const [notas, setNotas] = useState('');
    const [productosSuministra, setProductosSuministra] = useState('');

    useEffect(() => {
        if (open) {
            if (supplierToEdit) {
                setNombre(supplierToEdit.nombre_proveedor);
                setUbicacion(supplierToEdit.ubicacion || '');
                setPaginaWeb(supplierToEdit.pagina_web || '');
                setNotas(supplierToEdit.notas || '');
                setProductosSuministra(supplierToEdit.productos_suministra?.join(', ') || '');
            } else {
                setNombre('');
                setUbicacion('');
                setPaginaWeb('');
                setNotas('');
                setProductosSuministra('');
            }
        }
    }, [open, supplierToEdit]);

    const handleSave = async () => {
        if (!nombre) return;
        setLoading(true);

        const productsArray = productosSuministra
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        const payload = {
            nombre_proveedor: nombre,
            ubicacion: ubicacion || null,
            pagina_web: paginaWeb || null,
            notas: notas || null,
            productos_suministra: productsArray
        };

        try {
            if (supplierToEdit) {
                const { error } = await supabase
                    .from('proveedores')
                    .update(payload)
                    .eq('id', supplierToEdit.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('proveedores')
                    .insert([payload]);
                if (error) throw error;
            }
            onSaved();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving supplier:", error);
            alert("Error al guardar proveedor. Revisa la consola.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{supplierToEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Nombre Empresa *</Label>
                        <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Polymaker Official" />
                    </div>

                    <div className="space-y-2">
                        <Label>Ubicación / Dirección</Label>
                        <Input value={ubicacion} onChange={e => setUbicacion(e.target.value)} placeholder="Ej. Shanghai, China" />
                    </div>

                    <div className="space-y-2">
                        <Label>Página Web</Label>
                        <Input value={paginaWeb} onChange={e => setPaginaWeb(e.target.value)} placeholder="https://..." />
                    </div>

                    <div className="space-y-2">
                        <Label>Productos que suministra</Label>
                        <Input value={productosSuministra} onChange={e => setProductosSuministra(e.target.value)} placeholder="PLA, PETG, Repuestos (separados por comas)" />
                    </div>

                    <div className="space-y-2">
                        <Label>Notas</Label>
                        <Textarea value={notas} onChange={e => setNotas(e.target.value)} placeholder="Información adicional..." />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading || !nombre} className="bg-naranja text-white hover:bg-orange-600">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
