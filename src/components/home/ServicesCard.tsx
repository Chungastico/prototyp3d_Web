'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface Props {
    title: string;
    description: string;
    icon: LucideIcon;
    index: number;
}

export default function ServiceCard({ title, description, icon: Icon, index }: Props) {
    return (
        <motion.div
        className="relative p-6 pt-12 bg-white rounded-2xl shadow-md hover:shadow-xl border-t-4 border-azul transition duration-300"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        >
        <div className="absolute -top-5 left-5 bg-azul text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg">
            <Icon size={20} />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-azul">{title}</h3>
        <p className="text-negro">{description}</p>
        </motion.div>
    );
}
