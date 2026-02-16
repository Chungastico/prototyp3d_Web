'use client';

import React, { useState } from 'react';
import { JobsList } from '@/components/admin/jobs/JobsList';
import { PiecesKanban } from '@/components/admin/jobs/PiecesKanban';
import { LayoutGrid, Puzzle, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { CreateJobModal } from '@/components/admin/jobs/CreateJobModal';
import { GestionTrabajo } from '@/components/admin/jobs/types';

export default function JobsPage() {
  const [currentView, setCurrentView] = useState<'projects' | 'pieces'>('projects');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<GestionTrabajo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Lifted state for project details view
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const handleJobCreated = (newJobId?: string) => {
    setRefreshKey(prev => prev + 1);
    if (newJobId) {
       setSelectedJobId(newJobId);
       // Ensure we are in projects view to show the details
       setCurrentView('projects');
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          <Button
            variant={currentView === 'projects' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
                setCurrentView('projects');
                setSelectedJobId(null);
            }}
            className={`gap-2 ${currentView === 'projects' ? 'bg-naranja hover:bg-orange-600 text-white' : 'text-gray-600'}`}
          >
            <LayoutGrid className="h-4 w-4" />
            Por Proyecto
          </Button>
          <Button
            variant={currentView === 'pieces' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
                setCurrentView('pieces');
                setSelectedJobId(null);
            }}
            className={`gap-2 ${currentView === 'pieces' ? 'bg-naranja hover:bg-orange-600 text-white' : 'text-gray-600'}`}
          >
            <Puzzle className="h-4 w-4" />
            Por Piezas
          </Button>
        </div>

        <Button 
          onClick={() => { setJobToEdit(null); setCreateModalOpen(true); }} 
          className="bg-naranja hover:bg-orange-600 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Pedido
        </Button>
      </div>

      {currentView === 'projects' ? (
        <JobsList 
            onEdit={(job) => {
                setJobToEdit(job);
                setCreateModalOpen(true);
            }} 
            refreshKey={refreshKey}
            selectedJobId={selectedJobId}
            onSelectJob={setSelectedJobId}
        />
      ) : (
        <PiecesKanban />
      )}

      <CreateJobModal 
        open={createModalOpen} 
        onOpenChange={(open) => {
            setCreateModalOpen(open);
            if (!open) setJobToEdit(null);
        }} 
        onJobCreated={handleJobCreated} 
        jobToEdit={jobToEdit}
      />
    </div>
  );
}
