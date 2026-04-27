'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioObjeto } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, ShoppingBag } from "lucide-react";
import { ObjectModal } from './ObjectModal';
import { AdjustObjectStockModal } from './AdjustObjectStockModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function ObjectInventoryList() {
    const [objects, setObjects] = useState<InventarioObjeto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    
    const [selectedObject, setSelectedObject] = useState<InventarioObjeto | null>(null);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('inventario_objetos')
            .select(`
                *,
                proveedor:proveedores(nombre_proveedor)
            `)
            .order('nombre');
        
        if (error) {
            console.error("Error fetching object inventory:", error);
        } else {
            setObjects((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleEdit = (obj: InventarioObjeto) => {
        setSelectedObject(obj);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedObject(null);
        setIsModalOpen(true);
    };

    const handleAdjust = (obj: InventarioObjeto) => {
        setSelectedObject(obj);
        setIsAdjustModalOpen(true);
    }

    const filteredObjects = objects.filter(o => 
        o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.descripcion && o.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por nombre..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreate} className="bg-naranja hover:bg-orange-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Objeto/Extra
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Nombre / Concepto</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Stock Disp.</TableHead>
                            <TableHead className="text-right">Costo Unit.</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="text-right w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-naranja"></div>
                                        Cargando inventario...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredObjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No se encontraron objetos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredObjects.map((o) => (
                                <TableRow key={o.id} className="group hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium">{o.nombre}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{o.descripcion || '-'}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-gray-700">
                                        <span className={o.stock_disponible < 50 ? "text-red-500 font-bold" : ""}>
                                            {o.stock_disponible} unds.
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-naranja">${o.costo_unitario?.toFixed(2)}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {o.proveedor?.nombre_proveedor || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50" onClick={() => handleAdjust(o)}>
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Registrar Compra / Añadir Stock</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(o)}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Editar detalles</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <ObjectModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                objectToEdit={selectedObject}
                onSaved={fetchInventory}
            />

            <AdjustObjectStockModal
                open={isAdjustModalOpen}
                onOpenChange={setIsAdjustModalOpen}
                objectItem={selectedObject}
                onSaved={fetchInventory}
            />
        </div>
    );
}
