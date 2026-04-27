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
    padding: 0,
  },
  contentContainer: {
    paddingTop: 180,
    paddingBottom: 120, // Enough for notes buffer
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
    fontFamily: 'Helvetica', 
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
    width: "13%",
    padding: 5,
  },
  tableColMaterial: {
    width: "12%",
    padding: 5,
  },
  tableColDesc: {
    width: "33%",
    padding: 5,
  },
  tableColQty: {
    width: "8%",
    textAlign: 'center',
    padding: 5,
  },
  tableColPrice: {
    width: "17%",
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
    bottom: 80,
    left: 40,
    right: 40,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    fontFamily: 'Garet',
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
  filamentMaterials?: Record<string, string>;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({ job, pieces, extras, client, extraNames, filamentNames = {}, filamentMaterials = {} }) => {
  const dateObj = new Date();
  const day = format(dateObj, 'dd', { locale: es });
  const month = format(dateObj, 'MMMM', { locale: es });
  const year = format(dateObj, 'yyyy', { locale: es });
  const formattedDate = `${day} de ${month} de ${year}`;
  
  // Hide Empaquetado from PDF and distribute its cost to pieces
  const isEmpaquetado = (concepto: string | undefined | null) => concepto && concepto.toLowerCase().trim() === 'empaquetado';
  const totalEmpaquetado = extras.filter(e => isEmpaquetado(e.concepto)).reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
  const displayExtras = extras.filter(e => !isEmpaquetado(e.concepto));

  const totalQty = pieces.reduce((sum, p) => sum + p.cantidad, 0);
  const extraPerUnit = totalQty > 0 ? totalEmpaquetado / totalQty : 0;

  const displayPieces = pieces.map(p => ({
      ...p,
      precio_final_unit: p.precio_final_unit + extraPerUnit,
      total_venta: p.total_venta + (extraPerUnit * p.cantidad)
  }));

  const totalPiecesSale = displayPieces.reduce((sum, p) => sum + p.total_venta, 0);
  const totalExtrasSale = displayExtras.reduce((sum, e) => sum + (e.es_venta ? e.subtotal : 0), 0);
  const subtotal = totalPiecesSale + totalExtrasSale;
  const isCreditoFiscal = job.credito_fiscal === true;
  const ivaAmount = isCreditoFiscal ? subtotal * 0.13 : 0;
  const grandTotal = subtotal + ivaAmount;

  const ITEMS_PER_PAGE = 14;
  const allRows: { type: 'piece' | 'extra'; item: any }[] = [
    ...displayPieces.map(p => ({ type: 'piece' as const, item: p })),
    ...displayExtras.map(e => ({ type: 'extra' as const, item: e }))
  ];

  const totalPages = Math.ceil(allRows.length / ITEMS_PER_PAGE) || 1;
  const pageChunks = Array.from({ length: totalPages }, (_, i) => 
    allRows.slice(i * ITEMS_PER_PAGE, (i + 1) * ITEMS_PER_PAGE)
  );

  return (
    <Document>
      {pageChunks.map((chunk, pageIndex) => (
        <Page key={`page-${pageIndex}`} size="A4" style={styles.page}>
          <Image src="/quote-template.png" style={styles.background} fixed={true} />

          <View style={styles.contentContainer}>
              <View style={styles.headerRow}>
                  <View style={styles.clientInfo}>
                      <Text style={styles.title}>Cotización</Text>
                      {isCreditoFiscal && (
                          <Text style={{ fontSize: 9, color: '#262C4D', fontWeight: 'bold', marginBottom: 2 }}>CRÉDITO FISCAL</Text>
                      )}
                      <Text style={{ fontSize: 12 }}>
                          {job.es_empresa && job.nombre_empresa ? job.nombre_empresa : (client?.nombre_cliente || '')}
                      </Text>
                  </View>

                  <View style={styles.headerInfo}>
                      <Text>Fecha: {formattedDate}</Text>
                      <Text>Contacto: {client?.nombre_cliente || 'N/A'}</Text>
                      <Text>Ubicación: El Salvador</Text>
                      {totalPages > 1 && <Text>Página {pageIndex + 1} de {totalPages}</Text>}
                  </View>
              </View>

              <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                      <View style={styles.tableColDesc}><Text style={styles.tableCell}>Descripción</Text></View>
                      <View style={styles.tableCol}><Text style={styles.tableCell}>Color</Text></View>
                      <View style={styles.tableColMaterial}><Text style={styles.tableCell}>Material</Text></View>
                      <View style={styles.tableColQty}><Text style={styles.tableCell}>Cant.</Text></View>
                      <View style={styles.tableColPrice}><Text style={styles.tableCell}>Precio U.</Text></View>
                      <View style={styles.tableColPrice}><Text style={styles.tableCell}>Total</Text></View>
                  </View>

                  {chunk.map((row, index) => {
                      if (row.type === 'piece') {
                          const piece = row.item as PiezaTrabajo;
                          return (
                              <View style={styles.tableRow} key={`p-${pageIndex}-${index}`}>
                                  <View style={styles.tableColDesc}><Text style={styles.tableCell}>{piece.nombre_pieza}</Text></View>
                                  <View style={styles.tableCol}><Text style={styles.tableCell}>{filamentNames[piece.filamento_id || ''] || '-'}</Text></View>
                                  <View style={styles.tableColMaterial}><Text style={styles.tableCell}>{filamentMaterials[piece.filamento_id || ''] || '-'}</Text></View>
                                  <View style={styles.tableColQty}><Text style={styles.tableCell}>{piece.cantidad}</Text></View>
                                  <View style={styles.tableColPrice}><Text style={styles.tableCell}>${piece.precio_final_unit.toFixed(2)}</Text></View>
                                  <View style={styles.tableColPrice}><Text style={styles.tableCell}>${piece.total_venta.toFixed(2)}</Text></View>
                              </View>
                          );
                      } else {
                          const extra = row.item as ExtraAplicado;
                          return (
                              <View style={styles.tableRow} key={`e-${pageIndex}-${index}`}>
                                  <View style={styles.tableColDesc}>
                                      <Text style={styles.tableCell}>
                                          {extra.concepto || 'Servicio Adicional'} 
                                          {extra.pieza_id ? ' (Pieza)' : ''}
                                      </Text>
                                  </View>
                                  <View style={styles.tableCol}><Text style={styles.tableCell}>-</Text></View>

                                  <View style={styles.tableColMaterial}><Text style={styles.tableCell}>-</Text></View>
                                  <View style={styles.tableColQty}><Text style={styles.tableCell}>{extra.cantidad}</Text></View>
                                  <View style={styles.tableColPrice}><Text style={styles.tableCell}>${extra.precio_unitario_snapshot.toFixed(2)}</Text></View>
                                  <View style={styles.tableColPrice}><Text style={styles.tableCell}>${extra.subtotal.toFixed(2)}</Text></View>
                              </View>
                          );
                      }
                  })}
              </View>

              {/* Only show Totals on the very last page */}
              {pageIndex === totalPages - 1 && (
                  <View style={styles.totalsSection}>
                      {isCreditoFiscal ? (
                          <>
                          <View style={styles.totalRow}>
                              <Text style={styles.totalLabel}>Subtotal</Text>
                              <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                          </View>
                          <View style={styles.totalRow}>
                              <Text style={styles.totalLabel}>IVA 13%</Text>
                              <Text style={styles.totalValue}>${ivaAmount.toFixed(2)}</Text>
                          </View>
                          <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
                              <Text style={[styles.totalValue, styles.grandTotal]}>${grandTotal.toFixed(2)}</Text>
                          </View>
                          </>
                      ) : (
                          <View style={styles.totalRow}>
                              <Text style={[styles.totalLabel, styles.grandTotal]}>Total</Text>
                              <Text style={[styles.totalValue, styles.grandTotal]}>${grandTotal.toFixed(2)}</Text>
                          </View>
                      )}
                  </View>
              )}

              {/* Only show Notes strictly on the very last page */}
              {pageIndex === totalPages - 1 && (
                  <View style={styles.notesSection}>
                      <Text style={styles.noteTitle}>Notas:</Text>
                      <Text>• Tiempo estimado de entrega: 2 a 4 días hábiles (dependiendo de la cantidad y disponibilidad).</Text>
                      <Text>• El diseño personalizado tiene un costo adicional en caso de requerir arte gráfico.</Text>
                      <Text>• Precios en dólares estadounidenses (USD), válidos por 15 días a partir de la fecha de emisión.</Text>
                      {isCreditoFiscal ? (
                          <Text>• Los precios incluyen IVA (13%).</Text>
                      ) : (
                          <Text>• Los precios no incluyen IVA. En caso de requerir crédito fiscal, por favor solicitarlo previamente.</Text>
                      )}
                      <Text>• Se requiere un anticipo del 50% para iniciar la producción.</Text>
                      <Text>• Prototyp3D se compromete a mantener la confidencialidad de todos los archivos e información.</Text>
                  </View>
              )}
          </View>
        </Page>
      ))}
    </Document>
  );
};
