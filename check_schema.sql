
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gestion_trabajos' AND column_name = 'total_pagado';
