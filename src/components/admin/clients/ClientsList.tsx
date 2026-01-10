'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Cliente } from '@/components/admin/jobs/types';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientModal } from './ClientModal';
import { Edit, Eye, Mail, Phone, Plus, Search, Trash2 } from "lucide-react";

interface ClientsListProps {
    onSelectClient: (client: Cliente) => void;
}

export function ClientsList({ onSelectClient }: ClientsListProps) {
    const [clients, setClients] = useState<Cliente[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clientToEdit, setClientToEdit] = useState<Cliente | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('nombre_cliente', { ascending: true });

        if (error) {
            console.error("Error fetching clients:", error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreate = () => {
        setClientToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (e: React.MouseEvent, client: Cliente) => {
        e.stopPropagation();
        setClientToEdit(client);
        setIsModalOpen(true);
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro que deseas eliminar este cliente? Esta acción no se puede deshacer.")) return;

        const { error } = await supabase
            .from('clientes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting client:", error);
            alert("Error al eliminar");
        } else {
            setClients(clients.filter(c => c.id !== id));
        }
    };

    const filteredClients = clients.filter(client => 
        client.nombre_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleCreate} className="bg-naranja hover:bg-naranja/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                </Button>
            </div>

            <ClientModal 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                clientToEdit={clientToEdit}
                onClientSaved={fetchClients}
            />

            {loading ? (
                <div className="flex justify-center py-12">
                     <div className="h-8 w-8 animate-spin rounded-full border-4 border-naranja border-t-transparent"></div>
                </div>
            ) : filteredClients.length === 0 ? (
                 <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No se encontraron clientes.</p>
                </div>
            ) : (
                <div className="bg-white rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Observaciones</TableHead>
                                <TableHead>Frecuencia</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow 
                                    key={client.id} 
                                    className="cursor-pointer hover:bg-gray-50"
                                    onClick={() => onSelectClient(client)}
                                >
                                    <TableCell className="font-medium">
                                        {client.nombre_cliente}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-gray-500">
                                            {client.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {client.email}
                                                </div>
                                            )}
                                            {client.telefono && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {client.telefono}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-gray-500">
                                        {client.observaciones || '—'}
                                    </TableCell>
                                    <TableCell>
                                        {client.frecuencia_compra && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {client.frecuencia_compra}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-naranja hover:bg-orange-50"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectClient(client);
                                                }}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                                                onClick={(e) => handleEdit(e, client)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                                                onClick={(e) => handleDelete(e, client.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
