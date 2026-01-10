import React from 'react';
import { InventoryList } from '@/components/admin/inventory/InventoryList';
import { SupplierList } from '@/components/admin/inventory/SupplierList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function InventoryPage() {
    return (
        <div className="space-y-6">

            
            <Tabs defaultValue="inventory" className="w-full">
                <TabsList className="bg-white border">
                    <TabsTrigger value="inventory">Inventario de Filamentos</TabsTrigger>
                    <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
                </TabsList>
                
                <TabsContent value="inventory" className="mt-6">
                    <InventoryList />
                </TabsContent>
                
                <TabsContent value="suppliers" className="mt-6">
                    <SupplierList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
