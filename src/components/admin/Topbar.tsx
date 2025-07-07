'use client';

import { Menu } from 'lucide-react';

const Topbar = ({ onToggleSidebar }: { onToggleSidebar: () => void }) => {
    return (
        <header className="bg-azul text-white py-4 px-6 flex items-center justify-between shadow">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="text-white">
                    <Menu size={28} />
                </button>
                <h2 className="text-xl font-bold">Inicio</h2>
            </div>
            <div className="text-sm text-gray-300">FPS N/A | GPU 0% | CPU 20% | LAT N/A</div>
        </header>
    );
};

export default Topbar;
