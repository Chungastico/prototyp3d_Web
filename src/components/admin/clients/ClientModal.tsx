'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/lib/supabase';
import { Cliente } from '@/components/admin/jobs/types';

interface ClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientToEdit: Cliente | null;
    onClientSaved: () => void;
}

export function ClientModal({ open, onOpenChange, clientToEdit, onClientSaved }: ClientModalProps) {
    const [loading, setLoading] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [frecuencia, setFrecuencia] = useState('');

    useEffect(() => {
        if (clientToEdit) {
            setNombre(clientToEdit.nombre_cliente);
            setEmail(clientToEdit.email || '');
            setTelefono(clientToEdit.telefono || '');
            setObservaciones(clientToEdit.observaciones || '');
            setFrecuencia(clientToEdit.frecuencia_compra || '');
        } else {
            setNombre('');
            setEmail('');
            setTelefono('');
            setObservaciones('');
            setFrecuencia('');
        }
    }, [clientToEdit, open]);

    const handleSave = async () => {
        if (!nombre.trim()) {
            alert('El nombre del cliente es obligatorio');
            return;
        }

        setLoading(true);
        const clientData = {
            nombre_cliente: nombre,
            email: email || null,
            telefono: telefono || null,
            observaciones: observaciones || null,
            frecuencia_compra: frecuencia || null,
        };

        let result;
        if (clientToEdit) {
            result = await supabase
                .from('clientes')
                .update(clientData)
                .eq('id', clientToEdit.id);
        } else {
            result = await supabase
                .from('clientes')
                .insert([clientData]);
        }

        const { error } = result;
        setLoading(false);

        if (error) {
            console.error('Error saving client:', error);
            alert('Error al guardar el cliente');
        } else {
            onClientSaved();
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Nombre *
                        </Label>
                        <Input
                            id="name"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="phone" className="text-right">
                            Teléfono
                        </Label>
                        <Input
                            id="phone"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="frequency" className="text-right">
                            Frecuencia
                        </Label>
                        <div className="col-span-3">
                            <Select value={frecuencia} onValueChange={setFrecuencia}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar frecuencia" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Recurrente">Recurrente</SelectItem>
                                    <SelectItem value="Ocasional">Ocasional</SelectItem>
                                    <SelectItem value="Nuevo">Nuevo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="notes" className="text-right pt-2">
                            Notas
                        </Label>
                        <Textarea
                            id="notes"
                            value={observaciones}
                            onChange={(e) => setObservaciones(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-naranja hover:bg-naranja/90">
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
