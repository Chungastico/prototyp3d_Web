'use client';

import { motion } from 'framer-motion';

interface Props {
    label: string;
    active: boolean;
    onClick: () => void;
}

export default function TabButton({ label, active, onClick }: Props) {
    return (
        <button
        onClick={onClick}
        className={`relative px-4 py-2 rounded-full font-semibold capitalize transition-all duration-300 ${
            active
            ? 'bg-azul text-white shadow-md'
            : 'bg-white text-azul border border-azul hover:bg-azul hover:text-white'
        }`}
        >
        {label}
        {active && (
            <motion.span
            layoutId="underline"
            className="absolute inset-0 rounded-full bg-azul z-[-1]"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
        )}
        </button>
    );
}
