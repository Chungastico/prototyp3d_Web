
export interface Cliente {
  id: string;
  nombre: string;
  // Add other client fields as needed
}

export interface GestionTrabajo {
  id: string;
  nombre_proyecto: string;
  cliente_id: string;
  // Status with 'en_produccion' (no accent in DB)
  estado: 'cotizado' | 'aprobado' | 'en_produccion' | 'listo' | 'entregado';
  estado_pago: 'pendiente' | 'pagado';
  metodo_pago: string | null;
  fecha_solicitado: string;
  fecha_entrega: string;
  thumbnail_url: string | null;
  fusion_project_url: string | null;
  files: any | null; 
  created_at?: string;
}

export interface PiezaTrabajo {
  id: string;
  trabajo_id: string;
  nombre_pieza: string;
  descripcion_pieza: string | null;
  cantidad: number;
  filamento_id: string;
  gramos_usados: number; // Consumption PER UNIT (as input by user)
  
  // Snapshots
  precio_por_gramo_snapshot: number;
  costo_filamento_snapshot: number; // (gramos_usados * precio_por_gramo_snapshot)
  
  // Times & Rates
  tiempo_impresora_h: number;
  tiempo_modelado_h: number;
  costo_impresora_h_rate: number;
  costo_modelado_h_rate: number;
  
  // Suggested Range
  venta_min_unit: number; 
  venta_max_unit: number;
  
  // Financials (Unit)
  costo_total_unit: number;
  precio_final_unit: number;
  ganancia_unit: number;
  
  // Totals (Line Item)
  total_venta: number;
  total_costo: number; // costo_total_unit * cantidad
  total_ganancia: number;
}

export interface ConsumoFilamento {
  id?: string;
  pieza_id: string;
  filamento_id: string;
  gramos_usados: number; // TOTAL Consumption (Unit * Quantity)
  precio_por_gramo: number;
  costo_filamento: number;
  fecha_registro?: string;
}

export interface CatalogoExtra {
  id: string;
  nombre: string;
  tipo_aplicacion: 'pedido' | 'pieza';
  precio_unitario: number;
}

export interface ExtraAplicado {
  id: string;
  extra_id: string; // FK to catalogo_extras.id
  trabajo_id: string | null;
  pieza_id: string | null;
  cantidad: number;
  precio_unitario_snapshot: number;
  subtotal: number;
  es_costo: boolean;
  es_venta: boolean;
}

export interface InventarioFilamento {
  id: string;
  nombre: string;
  color: string;
  material: string;
  precio_por_gramo: number;
  stock_gramos: number;
}
