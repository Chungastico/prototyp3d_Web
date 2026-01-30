'use client';

import React, { useState } from 'react';
import { SalesCatalogList } from '@/components/admin/catalog/SalesCatalogList';
import { CreateSalesCatalogItemModal } from '@/components/admin/catalog/CreateSalesCatalogItemModal';
import { Plus, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function SalesCatalogPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
        
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-naranja p-2 rounded-lg text-white">
                    <ShoppingBag size={24} />
                </div>
                Catálogo de Ventas
            </h1>
            <p className="text-gray-500 mt-1 ml-14">Gestiona los productos visibles en la página pública /catalogo</p>
        </div>
        
        <Button 
          onClick={() => { setItemToEdit(null); setCreateModalOpen(true); }} 
          className="bg-naranja hover:bg-orange-600 text-white shadow-md shadow-orange-200"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Item de Venta
        </Button>
      </div>

      <SalesCatalogList 
        onEdit={(item) => {
            setItemToEdit(item);
            setCreateModalOpen(true);
        }} 
        refreshKey={refreshKey}
      />

      <CreateSalesCatalogItemModal 
        open={createModalOpen} 
        onOpenChange={(open) => {
            setCreateModalOpen(open);
            if (!open) setItemToEdit(null);
        }} 
        onItemSaved={() => setRefreshKey(prev => prev + 1)} 
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
