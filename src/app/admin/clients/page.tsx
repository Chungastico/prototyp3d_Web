'use client';

import React, { useState } from 'react';
import ProtectedPage from '@/components/ProtectedPage';
import { ClientsList } from '@/components/admin/clients/ClientsList';
import { ClientDetails } from '@/components/admin/clients/ClientDetails';
import { Cliente } from '@/components/admin/jobs/types';
import { Users } from 'lucide-react';

export default function ClientsPage() {
    const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

    return (
        <ProtectedPage allowedRoles={['admin', 'editor']}>
            <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
                {!selectedClient ? (
                    <>


                        <ClientsList onSelectClient={setSelectedClient} />
                    </>
                ) : (
                    <ClientDetails 
                        client={selectedClient} 
                        onBack={() => setSelectedClient(null)} 
                    />
                )}
            </div>
        </ProtectedPage>
    );
}
