'use client';

export default function AdminDashboardPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 gap-6 h-full">
            {/* Fila 1: Panel de administración (ocupa 2 columnas) */}
            <section className="bg-azul-oscuro rounded-2xl p-6 col-span-1 md:col-span-2">
                <h3 className="text-naranja text-xl font-bold mb-2">Panel de administración</h3>
                <div className="h-48 bg-opacity-20 rounded-lg border border-azul-black" />
            </section>

            {/* Fila 2: Estadísticas y Órdenes */}
            <section className="bg-azul-oscuro rounded-2xl p-6">
                <h3 className="text-naranja text-xl font-bold mb-2">Estadísticas</h3>
                <div className="h-48 bg-opacity-20 rounded-lg border border-azul-black" />
            </section>

            <section className="bg-azul-oscuro rounded-2xl p-6">
                <h3 className="text-naranja text-xl font-bold mb-2">Órdenes</h3>
                <div className="h-48 bg-opacity-20 rounded-lg border border-azul-black" />
            </section>
        </div>
    );
}
