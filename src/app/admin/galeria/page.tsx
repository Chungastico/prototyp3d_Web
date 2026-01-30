'use client';

import React, { useState } from 'react';
import { CatalogList } from '@/components/admin/galeria/CatalogList';
import { CreateCatalogItemModal } from '@/components/admin/galeria/CreateCatalogItemModal';
import { Plus, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function GalleryPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Package /> Galería de Proyectos
        </h1>
        <Button 
          onClick={() => { setItemToEdit(null); setCreateModalOpen(true); }} 
          className="bg-naranja hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proyecto
        </Button>
      </div>

      <CatalogList 
        onEdit={(item) => {
            setItemToEdit(item);
            setCreateModalOpen(true);
        }} 
        refreshKey={refreshKey}
      />

      <CreateCatalogItemModal 
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
