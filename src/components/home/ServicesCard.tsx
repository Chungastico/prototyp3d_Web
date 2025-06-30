'use client';

import { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  index: number;
  className?: string;
}

export default function ServiceCard({ title, description, icon: Icon, className = '' }: Props) {
  return (
    <div
      className={`service-card relative p-6 pt-12 bg-white rounded-2xl shadow-md hover:shadow-xl border-t-4 border-azul transition duration-300 ${className}`}
    >
      <div className="absolute -top-5 left-5 bg-azul text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg">
        <Icon size={20} />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-azul-oscuro">{title}</h3>
      <p className="text-negro text-xl">{description}</p>
    </div>
  );
}
