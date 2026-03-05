'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QuotePDF } from '@/components/admin/jobs/QuotePDF';
import { PDFDownloadLink } from '@react-pdf/renderer';

export default function StudentQuoteAction({ job, pieces, extras, extraNames, filamentNames, filamentMaterials }: any) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <Button disabled className="w-full">Cargando PDF...</Button>;

    return (
        <div className="pt-4">
             <PDFDownloadLink
                document={
                    <QuotePDF 
                        job={job} 
                        pieces={pieces} 
                        extras={extras} 
                        client={job.cliente} 
                        extraNames={extraNames}
                        filamentNames={filamentNames}
                        filamentMaterials={filamentMaterials}
                    />
                }
                fileName={`Cotizacion_${(job.es_empresa && job.nombre_empresa 
                    ? job.nombre_empresa 
                    : job.cliente?.nombre_cliente || 'Prototyp3d'
                ).replace(/\s+/g, '_')}.pdf`}
                className="block w-full"
            >
                {({ loading }) => (
                    <Button 
                        disabled={loading}
                        className="w-full bg-naranja hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 h-12 text-lg rounded-xl shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <Download className="h-5 w-5" />
                        {loading ? 'Preparando Documento...' : 'Descargar Cotización (PDF)'}
                    </Button>
                )}
            </PDFDownloadLink>
        </div>
    );
}
