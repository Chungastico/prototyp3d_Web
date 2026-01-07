export type Project = {
    id: string;
    proyecto: string;
    tipo_proyecto: string;
    project_id: string | null;
    responsables: string[] | null;
    fecha_objetivo: string | null;
    estado: string | null;
    entregable_esperado: string | null;
}

export type ProjectType = {
    id: string;
    nombre: string;
    descripcion?: string;
}

export type Priority = "alta" | "media" | "baja";
