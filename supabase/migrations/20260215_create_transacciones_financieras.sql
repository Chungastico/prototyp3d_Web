-- Create transacciones_financieras table
CREATE TABLE IF NOT EXISTS transacciones_financieras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
    categoria TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    monto NUMERIC NOT NULL DEFAULT 0,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy for row level security (optional, but good practice if RLS is enabled)
-- ALTER TABLE transacciones_financieras ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Enable all access for authenticated users" ON transacciones_financieras FOR ALL USING (auth.role() = 'authenticated');
