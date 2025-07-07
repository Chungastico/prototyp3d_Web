'use client';

export default function AdminDashboardPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <section className="bg-azul-oscuro rounded-2xl p-6">
                <h3 className="text-naranja text-lg font-bold mb-2">Panel de administración</h3>
                <div className="h-full bg-opacity-20 rounded-lg border border-azul-black" />
            </section>

            <section className="bg-azul-oscuro rounded-2xl p-6">
                <h3 className="text-naranja text-lg font-bold mb-2">Estadísticas</h3>
                <div className="h-full bg-opacity-20 rounded-lg border border-azul-black" />
            </section>

            <section className="bg-azul-oscuro rounded-2xl p-6">
                <h3 className="text-naranja text-lg font-bold mb-2">Órdenes</h3>
                <div className="h-full bg-opacity-20 rounded-lg border border-azul-black" />
            </section>
        </div>
    );
}
