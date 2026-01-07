-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_cliente TEXT NOT NULL,
    telefono TEXT,
    email TEXT,
    observaciones TEXT,
    frecuencia_compra TEXT,
    estado_verificacion TEXT
);

-- Proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_proveedor TEXT NOT NULL,
    contacto TEXT,
    productos_suministra TEXT[],  -- Array de textos
    ubicacion TEXT,
    pagina_web TEXT,
    notas TEXT
);

-- Inventario de Filamento
CREATE TABLE IF NOT EXISTS inventario_filamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    color_tipo_filamento TEXT NOT NULL,
    marca TEXT,
    material TEXT,
    diametro TEXT,
    proveedor_id UUID REFERENCES proveedores(id),
    cantidad_bobina_gramos NUMERIC,
    precio_bobina NUMERIC,
    notas TEXT,
    -- Calcula el precio por gramo dividiendo el precio de la bobina por el peso de la bobina.
    precio_por_gramo NUMERIC GENERATED ALWAYS AS 
        (precio_bobina / NULLIF(cantidad_bobina_gramos, 0)) STORED
);

-- Catálogo de Productos 3D
CREATE TABLE IF NOT EXISTS catalogo_productos_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_producto TEXT NOT NULL,
    categoria TEXT,
    descripcion_breve TEXT,
    material TEXT,
    dimensiones_cm TEXT,
    peso_g NUMERIC,
    tiempo_promedio_impresion_h NUMERIC,
    precio_bruto NUMERIC,
    precio_por_unidad NUMERIC,
    disponibilidad_actual TEXT
);

-- Gastos del Negocio
CREATE TABLE IF NOT EXISTS gastos_negocio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descripcion TEXT NOT NULL,
    categoria TEXT,
    subcategoria TEXT,
    monto NUMERIC,
    fecha DATE,
    proveedor_id UUID REFERENCES proveedores(id),
    metodo_pago TEXT,
    comprobante TEXT
);

-- Proyectos Internos Prototyp3D
CREATE TABLE IF NOT EXISTS proyectos_internos_prototyp3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proyecto TEXT NOT NULL,
    tipo_proyecto TEXT,
    responsables TEXT[],  -- Array de responsables
    fecha_objetivo DATE,
    estado TEXT,
    entregable_esperado TEXT,
    archivos_links TEXT,
    notas TEXT
);

-- Gestión de Trabajos
CREATE TABLE IF NOT EXISTS gestion_trabajos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_proyecto TEXT NOT NULL,
    cliente_id UUID REFERENCES clientes(id),
    tipo_producto TEXT,
    estado TEXT,
    estado_pago TEXT,
    metodo_pago TEXT,
    fecha_solicitado DATE,
    fecha_entrega DATE,
    envio_domicilio TEXT,
    cantidad_piezas INTEGER,
    filamento_total_usado NUMERIC,
    tiempo_impresora_h NUMERIC,
    tiempo_gabriel_h NUMERIC,
    precio_final NUMERIC,
    archivos TEXT,
    notas_adicionales TEXT,
    place TEXT,
    costo_produccion NUMERIC,
    costo_total_filamento NUMERIC,
    venta_min NUMERIC,
    venta_max NUMERIC
);

-- Consumo de Filamento
CREATE TABLE IF NOT EXISTS consumo_filamento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filamento_id UUID REFERENCES inventario_filamento(id),
    gramos_usados NUMERIC,
    trabajo_id UUID REFERENCES gestion_trabajos(id),
    -- Estas dos columnas podrían ser calculadas en vistas,
    -- pero las incluimos por simplicidad:
    precio_por_gramo NUMERIC,
    costo_filamento NUMERIC
);

-- Contenido para Redes Sociales
CREATE TABLE IF NOT EXISTS contenido_redes_sociales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    idea_contenido TEXT NOT NULL,
    estado_contenido TEXT,
    fecha DATE,
    fecha_publicacion DATE,
    objetivo TEXT,
    tipo_contenido TEXT,
    categoria TEXT[],        -- Etiquetas múltiples
    plataforma TEXT[],       -- Etiquetas múltiples
    copy_guion TEXT,
    archivo_link TEXT,
    cta_link_contacto TEXT,
    notas TEXT,
    responsable TEXT,
    proyecto_interno_id UUID REFERENCES proyectos_internos_prototyp3d(id),
    trabajo_id UUID REFERENCES gestion_trabajos(id)
);

-- Vistas
CREATE OR REPLACE VIEW consumo_filamento_view AS
SELECT
    c.id,
    c.filamento_id,
    c.gramos_usados,
    c.trabajo_id,
    f.precio_por_gramo,
    (c.gramos_usados * f.precio_por_gramo) AS costo_filamento
FROM consumo_filamento c
JOIN inventario_filamento f ON c.filamento_id = f.id;
