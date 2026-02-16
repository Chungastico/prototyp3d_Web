
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gestion_trabajos' AND column_name = 'total_pagado') THEN 
        ALTER TABLE gestion_trabajos ADD COLUMN total_pagado NUMERIC NOT NULL DEFAULT 0; 
    END IF; 
END $$;
