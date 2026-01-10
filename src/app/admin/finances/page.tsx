'use client';

import React from 'react';
import { FinancialOverview } from '@/components/admin/finances/FinancialOverview';

export default function FinancesPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">

            
            <FinancialOverview />
        </div>
    );
}
