'use client';

import React from 'react';
import { DashboardOverview } from '@/components/admin/dashboard/DashboardOverview';

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen bg-gray-50/30">
            <DashboardOverview />
        </div>
    );
}
