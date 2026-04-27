'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventarioFilamento } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, ShoppingBag, Ban } from "lucide-react";
import { FilamentModal } from './FilamentModal';
import { PurchaseModal } from './PurchaseModal';
import { AdjustStockModal } from './AdjustStockModal';
import { UsageModal } from './UsageModal';
import { History as HistoryIcon, RefreshCw } from "lucide-react";
import { adjustInventoryForJob } from '@/lib/inventory-utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function InventoryList() {
    const [filaments, setFilaments] = useState<InventarioFilamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
    
    const [selectedFilament, setSelectedFilament] = useState<InventarioFilamento | null>(null);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('inventario_filamento')
            .select(`
                *,
                proveedor:proveedores(nombre_proveedor)
            `)
            .order('color_tipo_filamento');
        
        if (error) {
            console.error("Error fetching inventory:", error);
        } else {
            setFilaments((data as any) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleEdit = (filament: InventarioFilamento) => {
        setSelectedFilament(filament);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedFilament(null);
        setIsModalOpen(true);
    };

    const handleAdjust = (filament: InventarioFilamento) => {
        setSelectedFilament(filament);
        setIsAdjustModalOpen(true);
    }

    const handleViewUsage = (filament: InventarioFilamento) => {
        setSelectedFilament(filament);
        setIsUsageModalOpen(true);
    }

    const syncStockFromQuotes = async () => {
        if (!confirm('Esta acción buscará todas las cotizaciones y devolverá el material al inventario si ya fue descontado por error. ¿Deseas continuar?')) return;
        
        setLoading(true);
        try {
            const { data: cotizaciones } = await supabase
                .from('gestion_trabajos')
                .select('id')
                .eq('estado', 'cotizado');
            
            if (cotizaciones && cotizaciones.length > 0) {
                for (const job of cotizaciones) {
                    await adjustInventoryForJob(job.id, false);
                }
                alert(`Sincronización completada. Se procesaron ${cotizaciones.length} cotizaciones.`);
                fetchInventory();
            } else {
                alert('No se encontraron cotizaciones para sincronizar.');
            }
        } catch (error) {
            console.error("Error syncing inventory:", error);
            alert("Error durante la sincronización.");
        } finally {
            setLoading(false);
        }
    }

    const filteredFilaments = filaments.filter(f => 
        f.color_tipo_filamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.marca && f.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        f.material.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar por color, marca, material..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={syncStockFromQuotes} variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-50 group">
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> 
                        <span className="hidden md:inline">Sincronizar Stock</span>
                    </Button>
                    <Button onClick={() => setIsPurchaseModalOpen(true)} variant="outline" className="text-naranja border-naranja hover:bg-orange-50">
                        <ShoppingBag className="mr-2 h-4 w-4" /> Registrar Compra
                    </Button>
                    <Button onClick={handleCreate} className="bg-naranja hover:bg-orange-600 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Nuevo Filamento
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead>Color / Tipo</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Material</TableHead>
                            <TableHead>Diámetro</TableHead>
                            <TableHead className="text-right">Stock (g)</TableHead>
                            <TableHead className="text-right">Precio/Bobina</TableHead>
                            <TableHead className="text-right">$/g</TableHead>
                            <TableHead>Proveedor</TableHead>
                            <TableHead className="text-right w-[100px]">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-naranja"></div>
                                        Cargando inventario...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredFilaments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                                    No se encontraron filamentos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredFilaments.map((f) => (
                                <TableRow key={f.id} className="group hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium">{f.color_tipo_filamento}</TableCell>
                                    <TableCell>{f.marca || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-white">{f.material}</Badge>
                                    </TableCell>
                                    <TableCell>{f.diametro || '-'}</TableCell>
                                    <TableCell className="text-right font-mono">
                                        {f.stock_gramos_disponibles !== undefined && f.stock_gramos_disponibles !== null ? (
                                            <span className={f.stock_gramos_disponibles < 200 ? "text-red-500 font-bold" : ""}>
                                                {f.stock_gramos_disponibles}g
                                            </span>
                                        ) : <span className="text-gray-300">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right">${f.precio_bobina?.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-bold text-gray-700">${f.precio_por_gramo?.toFixed(3)}</TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {f.proveedor?.nombre_proveedor || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleAdjust(f)}>
                                                            <Ban className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Fin de Carrete (Registrar desperdicio)</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                             <TooltipProvider>
                                                 <Tooltip>
                                                     <TooltipTrigger asChild>
                                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50" onClick={() => handleViewUsage(f)}>
                                                             <HistoryIcon className="h-4 w-4" />
                                                         </Button>
                                                     </TooltipTrigger>
                                                     <TooltipContent>
                                                         <p>Ver historial de uso (Proyectos)</p>
                                                     </TooltipContent>
                                                 </Tooltip>
                                             </TooltipProvider>

                                             <TooltipProvider>
                                                 <Tooltip>
                                                     <TooltipTrigger asChild>
                                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(f)}>
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

            <FilamentModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                filamentToEdit={selectedFilament}
                onSaved={fetchInventory}
            />

            <PurchaseModal
                open={isPurchaseModalOpen}
                onOpenChange={setIsPurchaseModalOpen}
                currentInventory={filaments}
                onSaved={fetchInventory}
            />

            <AdjustStockModal
                open={isAdjustModalOpen}
                onOpenChange={setIsAdjustModalOpen}
                filament={selectedFilament}
                onSaved={fetchInventory}
            />

            <UsageModal
                open={isUsageModalOpen}
                onOpenChange={setIsUsageModalOpen}
                filamentId={selectedFilament?.id || null}
                filamentName={selectedFilament?.color_tipo_filamento || ''}
            />
        </div>
    );
}
