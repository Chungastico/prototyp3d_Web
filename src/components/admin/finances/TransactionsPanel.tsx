'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { 
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2, Edit, Search, Filter, Loader2, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Tipos
export type TransactionType = 'ingreso' | 'gasto';

export interface Transaction {
    id: string;
    tipo: TransactionType;
    categoria: string;
    descripcion: string;
    monto: number;
    fecha: string;
    notas?: string;
    created_at?: string;
}

const CATEGORIAS_INGRESO = [
    "Inversión / Capital Personal",
    "Préstamo",
    "Venta Activo",
    "Otro Ingreso"
];

const CATEGORIAS_GASTO = [
    "Marketing / Publicidad",
    "Herramientas / Equipo",
    "Envíos / Logística",
    "Servicios (Internet, Software)",
    "Materiales Oficina",
    "Mantenimiento",
    "Salarios / Nómina",
    "Impuestos",
    "Pago a Mel",
    "Materia Prima",
    "Otro Gasto"
];

export function TransactionsPanel() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<{
        tipo: TransactionType;
        categoria: string;
        descripcion: string;
        monto: string;
        fecha: string;
        notas: string;
    }>({
        tipo: 'gasto',
        categoria: '',
        descripcion: '',
        monto: '',
        fecha: new Date().toISOString().split('T')[0],
        notas: ''
    });

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('transacciones_financieras')
            .select('*')
            .order('fecha', { ascending: false });
        
        if (error) {
            console.error("Error fetching transactions:", error);
        } else {
            setTransactions(data || []);
        }
        setLoading(false);
    };

    const handleOpenModal = (transaction?: Transaction) => {
        if (transaction) {
            setEditingId(transaction.id);
            setFormData({
                tipo: transaction.tipo,
                categoria: transaction.categoria,
                descripcion: transaction.descripcion,
                monto: transaction.monto.toString(),
                fecha: transaction.fecha,
                notas: transaction.notas || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                tipo: 'gasto',
                categoria: '',
                descripcion: '',
                monto: '',
                fecha: new Date().toISOString().split('T')[0],
                notas: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.categoria || !formData.descripcion || !formData.monto) return;
        
        setIsSubmitting(true);
        
        const payload = {
            tipo: formData.tipo,
            categoria: formData.categoria,
            descripcion: formData.descripcion,
            monto: parseFloat(formData.monto),
            fecha: formData.fecha,
            notas: formData.notas
        };

        let error;

        if (editingId) {
            const { error: updateError } = await supabase
                .from('transacciones_financieras')
                .update(payload)
                .eq('id', editingId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('transacciones_financieras')
                .insert([payload]);
            error = insertError;
        }

        setIsSubmitting(false);

        if (error) {
            console.error("Error saving transaction:", error);
            alert("Error al guardar la transacción. Revisa la consola.");
        } else {
            setIsModalOpen(false);
            fetchTransactions();
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        
        const { error } = await supabase
            .from('transacciones_financieras')
            .delete()
            .eq('id', deleteId);
            
        if (error) {
            console.error("Error deleting transaction:", error);
            alert("Error al eliminar.");
        } else {
            fetchTransactions();
        }
        setDeleteId(null);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.categoria.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.tipo === typeFilter;
        return matchesSearch && matchesType;
    });

    const totalIngresos = filteredTransactions
        .filter(t => t.tipo === 'ingreso')
        .reduce((sum, t) => sum + t.monto, 0);

    const totalGastos = filteredTransactions
        .filter(t => t.tipo === 'gasto')
        .reduce((sum, t) => sum + t.monto, 0);

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Buscar transacción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-white"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={(val: any) => setTypeFilter(val)}>
                        <SelectTrigger className="w-[180px] bg-white">
                            <SelectValue placeholder="Filtrar por tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los tipos</SelectItem>
                            <SelectItem value="ingreso">Ingresos</SelectItem>
                            <SelectItem value="gasto">Gastos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-naranja hover:bg-orange-600 text-white w-full md:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Registrar Transacción
                </Button>
            </div>

            {/* Summary Cards (Mini) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50/50 border border-green-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Ingresos Registrados</p>
                        <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIngresos)}</p>
                    </div>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                </div>
                <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Gastos Registrados</p>
                        <p className="text-2xl font-bold text-red-700">{formatCurrency(totalGastos)}</p>
                    </div>
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-naranja" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredTransactions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No hay transacciones registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTransactions.map((t) => (
                                <TableRow key={t.id}>
                                    <TableCell className="font-medium">
                                        {format(new Date(t.fecha), "dd MMM yyyy", { locale: es })}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                            t.tipo === 'ingreso' 
                                                ? "bg-green-100 text-green-800" 
                                                : "bg-red-100 text-red-800"
                                        )}>
                                            {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-600">{t.categoria}</TableCell>
                                    <TableCell>{t.descripcion}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        <span className={t.tipo === 'ingreso' ? "text-green-600" : "text-red-600"}>
                                            {t.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(t.monto)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleOpenModal(t)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" onClick={() => setDeleteId(t.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Editar Transacción' : 'Registrar Transacción'}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Tipo</Label>
                                <Select 
                                    value={formData.tipo} 
                                    onValueChange={(val: TransactionType) => setFormData({...formData, tipo: val, categoria: ''})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ingreso">Ingreso</SelectItem>
                                        <SelectItem value="gasto">Gasto</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <Input 
                                    type="date" 
                                    value={formData.fecha}
                                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Select 
                                value={formData.categoria} 
                                onValueChange={(val) => setFormData({...formData, categoria: val})}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {(formData.tipo === 'ingreso' ? CATEGORIAS_INGRESO : CATEGORIAS_GASTO).map((cat) => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Monto</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <Input 
                                    type="number" 
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    className="pl-9"
                                    value={formData.monto}
                                    onChange={(e) => setFormData({...formData, monto: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descripción</Label>
                            <Input 
                                placeholder="Ej. Pago de publicidad Facebook Ads"
                                value={formData.descripcion}
                                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Notas (Opcional)</Label>
                            <Input 
                                placeholder="Detalles adicionales..."
                                value={formData.notas}
                                onChange={(e) => setFormData({...formData, notas: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !formData.monto || !formData.categoria}
                            className={cn("text-white", formData.tipo === 'ingreso' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingId ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente la transacción.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
