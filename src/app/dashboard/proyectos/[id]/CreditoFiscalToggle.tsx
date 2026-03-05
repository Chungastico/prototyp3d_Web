'use client';

import React, { useState } from 'react';
import { updateCreditoFiscal } from '@/app/actions/student';
import { Check, X, Loader2 } from 'lucide-react';

interface CreditoFiscalToggleProps {
    jobId: string;
    initialValue: boolean;
}

export default function CreditoFiscalToggle({ jobId, initialValue }: CreditoFiscalToggleProps) {
    const [enabled, setEnabled] = useState(initialValue);
    const [saving, setSaving] = useState(false);

    const toggle = async () => {
        setSaving(true);
        const newVal = !enabled;
        const result = await updateCreditoFiscal(jobId, newVal);
        if (!result.error) {
            setEnabled(newVal);
        }
        setSaving(false);
    };

    return (
        <button
            onClick={toggle}
            disabled={saving}
            className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all min-w-[130px] justify-center ${
                enabled
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-amber-400 hover:bg-amber-50'
            }`}
        >
            {saving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : enabled ? (
                <Check className="h-3 w-3" />
            ) : (
                <X className="h-3 w-3" />
            )}
            {saving ? 'Guardando...' : enabled ? 'Sí, necesito CF' : 'No requiero CF'}
        </button>
    );
}
