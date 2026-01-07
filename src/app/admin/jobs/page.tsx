'use client';

import React from 'react';
import { JobsList } from '@/components/admin/jobs/JobsList';

export default function JobsPage() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h1>
          <p className="text-gray-500 mt-1">Administra cotizaciones, producción y entregas.</p>
        </div>
      </div>
      <JobsList />
    </div>
  );
}
