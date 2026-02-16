'use client';

import React from 'react';
import { FinancialOverview } from '@/components/admin/finances/FinancialOverview';
import { TransactionsPanel } from '@/components/admin/finances/TransactionsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FinancesPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
                <p className="text-gray-500">Resumen financiero y gestión de transacciones</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border">
                    <TabsTrigger value="overview">Resumen General</TabsTrigger>
                    <TabsTrigger value="transactions">Transacciones Manuales</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <FinancialOverview />
                </TabsContent>
                
                <TabsContent value="transactions" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <TransactionsPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}
