import { syncStudentClient } from "@/app/actions/student";
import { AlertCircle } from "lucide-react";
import NewProjectForm from "./NewProjectForm";

export default async function NuevoProyectoPage() {
    const { clientId, error } = await syncStudentClient();

    if (error || !clientId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error de Autenticación</h2>
                <p className="text-gray-600">No se pudo cargar tu perfil. Intenta iniciar sesión nuevamente.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen">
            <h1 className="text-3xl font-bold text-azul-oscuro mb-2">Crear Nuevo Proyecto</h1>
            <p className="text-gray-600 mb-8">Sube tus archivos STL y cuéntanos sobre tu idea. Nosotros calcularemos el mejor precio para ti.</p>
            
            <NewProjectForm clientId={clientId} />
        </div>
    );
}
