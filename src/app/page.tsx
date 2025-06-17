// src/app/page.tsx
export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-5xl font-garet font-extrabold text-azul">¡Prototyp3D funcionando!</h1>
        <p className="text-lg text-azul-oscuro">Tu idea. Nuestro modelo.</p>
        <button className="px-6 py-2 bg-naranja text-white rounded-xl shadow-lg hover:bg-azul transition">
            Ver servicios
        </button>
        </main>
    )
}
