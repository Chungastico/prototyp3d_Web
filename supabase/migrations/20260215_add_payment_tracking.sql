-- Add total_pagado column to gestion_trabajos
ALTER TABLE gestion_trabajos 
ADD COLUMN IF NOT EXISTS total_pagado NUMERIC NOT NULL DEFAULT 0;

-- Optional: Update existing records if monto_cobrado was used as payment
-- UPDATE gestion_trabajos SET total_pagado = monto_cobrado WHERE monto_cobrado IS NOT NULL AND total_pagado = 0;
