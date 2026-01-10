'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Proveedor } from '@/components/admin/jobs/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Globe, MapPin, Tag } from "lucide-react";
import { SupplierModal } from './SupplierModal';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function SupplierList() {
    const [suppliers, setSuppliers] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Proveedor | null>(null);

    const fetchSuppliers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('proveedores')
            .select('*')
            .order('nombre_proveedor');
        
        if (error) {
            console.error("Error fetching suppliers:", error);
        } else {
            setSuppliers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleEdit = (supplier: Proveedor) => {
        setSelectedSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedSupplier(null);
        setIsModalOpen(true);
    };

    const filteredSuppliers = suppliers.filter(s => 
        s.nombre_proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.productos_suministra && s.productos_suministra.some(p => p.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Buscar proveedor o producto..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={handleCreate} className="bg-naranja hover:bg-orange-600 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre Empresa</TableHead>
                            <TableHead>Ubicación / Web</TableHead>
                            <TableHead>Productos</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Cargando proveedores...
                                </TableCell>
                            </TableRow>
                        ) : filteredSuppliers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                                    No se encontraron proveedores.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSuppliers.map((s) => (
                                <TableRow key={s.id} className="group">
                                    <TableCell className="font-medium align-top">
                                        <div className="text-base">{s.nombre_proveedor}</div>
                                        {s.notas && (
                                            <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{s.notas}</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex flex-col gap-1 text-sm">
                                            {s.ubicacion && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="h-3 w-3" /> {s.ubicacion}
                                                </div>
                                            )}
                                            {s.pagina_web && (
                                                <div className="flex items-center gap-2 text-naranja">
                                                    <Globe className="h-3 w-3" /> 
                                                    <a href={s.pagina_web} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        Web
                                                    </a>
                                                </div>
                                            )}
                                            {!s.ubicacion && !s.pagina_web && <span className="text-gray-400">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <div className="flex flex-wrap gap-1">
                                            {s.productos_suministra && s.productos_suministra.length > 0 ? (
                                                s.productos_suministra.map((prod, idx) => (
                                                    <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                                                        {prod}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="align-top">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                                            <Edit2 className="h-4 w-4 text-gray-500 group-hover:text-naranja transition-colors" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <SupplierModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                supplierToEdit={selectedSupplier}
                onSaved={fetchSuppliers}
            />
        </div>
    );
}
