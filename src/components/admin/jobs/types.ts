
/**
 * Representa a un cliente en la base de datos. Para ajustarse al esquema
 * real de Supabase, usamos los nombres de columna exactos. Si se añaden
 * campos adicionales en el futuro, añádalos aquí como opcionales.
 */
export interface Cliente {
    id: string;
    /** Nombre completo del cliente. Corresponde a la columna `nombre_cliente` */
    nombre_cliente: string;
    /** Teléfono de contacto del cliente (opcional). */
    telefono?: string | null;
    /** Correo electrónico del cliente (opcional). */
    email?: string | null;
    /** Observaciones adicionales sobre el cliente (opcional). */
    observaciones?: string | null;
    /** Frecuencia de compra del cliente (opcional). */
    frecuencia_compra?: string | null;
    /** Estado de verificación del cliente (opcional). */
    estado_verificacion?: string | null;
}

export interface GestionTrabajo {
  id: string;
  nombre_proyecto: string;
  cliente_id: string;
  // Status with 'en_produccion' (no accent in DB)
  estado: 'cotizado' | 'aprobado' | 'en_produccion' | 'listo' | 'entregado' | 'cancelado' | 'parcialmente_cancelado';
  estado_pago: 'pendiente' | 'pagado';
  metodo_pago: string | null;
  fecha_solicitado: string;
  fecha_entrega: string;
  monto_cobrado?: number | null; // Amount actually collected if cancelled/partial
  thumbnail_url: string | null;
  fusion_project_url: string | null;
  files: any | null; 
  created_at?: string;
  // Empresa Info
  es_empresa?: boolean;
  nombre_empresa?: string | null;
}

export interface PiezaTrabajo {
  id: string;
  trabajo_id: string;
  nombre_pieza: string;
  descripcion_pieza: string | null;
  cantidad: number;
  filamento_id: string;
  gramos_usados: number; // Consumption PER UNIT (as input by user)
  estado?: 'no_impreso' | 'impreso' | 'empaquetado';
  
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

/**
 * Representa un proveedor en la base de datos `proveedores`.
 */
export interface Proveedor {
    id: string;
    nombre_proveedor: string;
    contacto?: string; // Contact person
    ubicacion?: string; // Location/Address
    pagina_web?: string;
    notas?: string;
    productos_suministra?: string[]; // Array of strings
    // email and phone do not exist in the screenshot schema
}

/**
 * Representa un registro de inventario de filamento. Refleja las columnas
 * definidas en la tabla `inventario_filamento` de Supabase. Algunos
 * campos son opcionales porque pueden no estar presentes en todas las
 * bobinas registradas.
 */
export interface InventarioFilamento {
    id: string;
    /** Color y tipo del filamento, por ejemplo "PLA Rojo". */
    color_tipo_filamento: string;
    /** Marca del filamento (opcional). */
    marca?: string | null;
    /** Material principal del filamento, por ejemplo "PLA", "PETG". */
    material: string;
    /** Diámetro del filamento (opcional), por ejemplo "1.75mm". */
    diametro?: string | null;
    
    // --- Supply Info ---
    proveedor_id?: string | null;
    /** Cantidad inicial de la bobina en gramos (ej. 1000). */
    cantidad_bobina_gramos: number;
    /** Costo de la bobina completa. */
    precio_bobina: number;
    /** Notas adicionales sobre el filamento. */
    notas?: string | null;

    /** Precio por gramo calculado en la BD (precio_bobina / cantidad_bobina_gramos). */
    precio_por_gramo: number;
    /** Stock disponible en gramos, mantenido manualmente (opcional). */
    stock_gramos_disponibles?: number | null;
    
    // --- Joined Fields ---
    proveedor?: Proveedor | null;
}
