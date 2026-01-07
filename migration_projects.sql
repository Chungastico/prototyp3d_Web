-- 1. Create the new projects table
CREATE TABLE IF NOT EXISTS proyectos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Populate the projects table with existing unique types
INSERT INTO proyectos (nombre)
SELECT DISTINCT tipo_proyecto 
FROM proyectos_internos_prototyp3d
WHERE tipo_proyecto IS NOT NULL AND tipo_proyecto != '';

-- 3. Add the project_id column to the tasks table
ALTER TABLE proyectos_internos_prototyp3d 
ADD COLUMN project_id UUID REFERENCES proyectos(id);

-- 4. Update the tasks with the correct project_id
UPDATE proyectos_internos_prototyp3d t
SET project_id = p.id
FROM proyectos p
WHERE t.tipo_proyecto = p.nombre;

-- 5. Optional: Verify migration (select count to check)
-- SELECT count(*) FROM proyectos_internos_prototyp3d WHERE project_id IS NULL;
