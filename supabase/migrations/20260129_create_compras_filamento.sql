-- Create table for tracking filament purchases
create table if not exists compras_filamento (
  id uuid default gen_random_uuid() primary key,
  filamento_id uuid references inventario_filamento(id) not null,
  cantidad_g numeric not null,
  costo_total numeric not null,
  fecha_compra timestamptz default now(),
  proveedor_id uuid references proveedores(id),
  notes text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table compras_filamento enable row level security;

-- Policies (Adjust based on your actual roles, using 'true' for now to allow admin access if no roles defined)
create policy "Enable all access for admins" on compras_filamento for all using (true) with check (true);
