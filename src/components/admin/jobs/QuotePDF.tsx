'use client';

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { GestionTrabajo, PiezaTrabajo, ExtraAplicado, Cliente } from './types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Register custom fonts
Font.register({
  family: 'Garet',
  fonts: [
    { src: '/fonts/Garet/Garet-Book.ttf', fontWeight: 'normal' },
    { src: '/fonts/Garet/Garet-Heavy.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Garet',
    fontSize: 10,
    color: '#111827',
    padding: 0, // Remove default padding to let background fill
  },
  // Container for content to simulate padding over the background
  contentContainer: {
    paddingTop: 180, // Reduced from 220 to move content up
    paddingBottom: 120,
    paddingHorizontal: 40,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height: '100%',
    width: '100%',
    zIndex: -1,
  },
  // New Header Row Container for alignment
  headerRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    width: '100%',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    fontSize: 9,
    color: '#000',
    fontFamily: 'Garet',
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    fontFamily: 'Garet',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#EA580C',
    marginBottom: 5,
    fontFamily: 'Garet',
  },
  table: {
    display: "flex",
    width: "auto",
    marginBottom: 10,
    fontFamily: 'Helvetica', // Requested Inter, using standard sans-serif fallback
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderStyle: 'solid',
    minHeight: 24,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#EA580C',
    color: '#ffffff',
    fontWeight: 'bold',
    borderBottomWidth: 0,
    fontFamily: 'Helvetica',
  },
  tableCol: {
    width: "15%",
    padding: 5,
  },
  tableColDesc: {
    width: "40%",
    padding: 5,
  },
  tableColQty: {
    width: "10%",
    textAlign: 'center',
    padding: 5,
  },
  tableColPrice: {
    width: "15%",
    textAlign: 'right',
    padding: 5,
  },
  tableCell: {
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  totalsSection: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: 0,
    fontFamily: 'Helvetica',
  },
  totalRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 5,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    fontWeight: 'bold',
    marginRight: 10,
    color: '#6b7280',
    fontFamily: 'Helvetica',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'Helvetica',
  },
  grandTotal: {
    color: '#EA580C',
    fontSize: 12,
  },
  notesSection: {
    position: 'absolute',
    bottom: 100, // Move up (was 80)
    left: 40,
    right: 40,
    fontSize: 10, // Increase size (was 8.4)
    color: '#374151',
    lineHeight: 1.5,
    fontFamily: 'Garet', // Keep Garet for notes as usually only table was requested to change
  },
  noteTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    fontSize: 10,
    fontFamily: 'Garet',
  }
});

interface QuotePDFProps {
  job: GestionTrabajo;
  pieces: PiezaTrabajo[];
  extras: ExtraAplicado[];
  client: Cliente | null;
  extraNames: Record<string, string>;
  filamentNames?: Record<string, string>;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ job, pieces, extras, client, extraNames, filamentNames = {} }) => {
  // Manual concatenation to avoid escaping issues
  const dateObj = new Date();
  const day = format(dateObj, 'dd', { locale: es });
  const month = format(dateObj, 'MMMM', { locale: es });
  const year = format(dateObj, 'yyyy', { locale: es });
  const formattedDate = `${day} de ${month} de ${year}`;
  
  // Calculate Totals
  const totalPiecesSale = pieces.reduce((sum, p) => sum + p.total_venta, 0);
  const totalExtrasSale = extras.reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
  const grandTotal = totalPiecesSale + totalExtrasSale;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Background Template */}
        <Image src="/quote-template.png" style={styles.background} fixed />

        {/* Content Container to manage padding */}
        <View style={styles.contentContainer}>
            {/* Header Row: Contains both Project Info (Left) and Contact Details (Right) */}
            <View style={styles.headerRow}>
                {/* Left: Title & Company/Client Name */}
                <View style={styles.clientInfo}>
                    <Text style={styles.title}>Cotización</Text>
                    <Text style={{ fontSize: 12 }}>
                        {job.es_empresa && job.nombre_empresa ? job.nombre_empresa : (client?.nombre_cliente || '')}
                    </Text>
                </View>

                {/* Right: Date, Contact Person, Location */}
                <View style={styles.headerInfo}>
                    <Text>Fecha: {formattedDate}</Text>
                    <Text>Contacto: {client?.nombre_cliente || 'N/A'}</Text>
                    <Text>Ubicación: El Salvador</Text>
                </View>
            </View>

            {/* Table */}
            <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableColDesc}><Text style={styles.tableCell}>Descripción</Text></View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>Color</Text></View>
                <View style={styles.tableColQty}><Text style={styles.tableCell}>Cant.</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>Precio U.</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>Total</Text></View>
            </View>

            {/* Pieces Rows */}
            {pieces.map((piece, index) => (
                <View style={styles.tableRow} key={`p-${index}`}>
                <View style={styles.tableColDesc}><Text style={styles.tableCell}>{piece.nombre_pieza}</Text></View>
                {/* Use filament name from prop map, fallback to '-' */}
                <View style={styles.tableCol}><Text style={styles.tableCell}>{filamentNames[piece.filamento_id || ''] || '-'}</Text></View>
                <View style={styles.tableColQty}><Text style={styles.tableCell}>{piece.cantidad}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>${piece.precio_final_unit.toFixed(2)}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>${piece.total_venta.toFixed(2)}</Text></View>
                </View>
            ))}

            {/* Extras Rows */}
            {extras.map((extra, index) => (
                <View style={styles.tableRow} key={`e-${index}`}>
                <View style={styles.tableColDesc}>
                    <Text style={styles.tableCell}>
                        {extraNames[extra.extra_id] || 'Servicio Adicional'} 
                        {extra.pieza_id ? ' (Pieza)' : ''}
                    </Text>
                </View>
                <View style={styles.tableCol}><Text style={styles.tableCell}>-</Text></View>
                <View style={styles.tableColQty}><Text style={styles.tableCell}>{extra.cantidad}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>${extra.precio_unitario_snapshot.toFixed(2)}</Text></View>
                <View style={styles.tableColPrice}><Text style={styles.tableCell}>${extra.subtotal.toFixed(2)}</Text></View>
                </View>
            ))}
            </View>

            {/* Totals */}
            <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
                <Text style={[styles.totalValue, styles.grandTotal]}>${grandTotal.toFixed(2)}</Text>
            </View>
            </View>

            {/* Notes (Absolute position at bottom) */}
            <View style={styles.notesSection} fixed>
                <Text style={styles.noteTitle}>Notas:</Text>
                <Text>• Tiempo estimado de entrega: 2 a 4 días hábiles (dependiendo de la cantidad y disponibilidad).</Text>
                <Text>• El diseño personalizado tiene un costo adicional en caso de requerir arte gráfico.</Text>
                <Text>• Precios en dólares estadounidenses (USD), válidos por 15 días a partir de la fecha de emisión.</Text>
                <Text>• Los precios no incluyen IVA. En caso de requerir crédito fiscal, por favor solicitarlo previamente.</Text>
                <Text>• Se requiere un anticipo del 50% para iniciar la producción.</Text>
                <Text>• Prototyp3D se compromete a mantener la confidencialidad de todos los archivos e información.</Text>
            </View>
        </View>
      </Page>
    </Document>
  );
};
