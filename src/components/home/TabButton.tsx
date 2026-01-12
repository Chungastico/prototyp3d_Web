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
        className={`relative px-3 py-2 sm:px-5 sm:py-2.5 rounded-full text-sm sm:text-base font-bold capitalize transition-all duration-300 ${
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
