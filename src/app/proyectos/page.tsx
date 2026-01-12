'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ScrollLayout from '@/components/layout/ScrollLayout';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

// Keeping metadata in a separate file or removing specific export if strict client component issues arise. 
// For Next.js App Router, layout or page metadata exports don't work in 'use client' files directly in the same way.
// We'll skip exporting metadata from this client file or use a wrapper. 
// For simplicity in this edit, we'll omit the metadata export to avoid runtime errors, 
// or ideally move this logic to a client component imported by a server page.
// Given previous patterns, I will omit metadata export here or try to keep it simple.

interface Project {
    id: string;
    title: string;
    category: string;
    description: string;
    image_url: string;
}

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filter, setFilter] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            const { data } = await supabase
                .from('portfolio_items')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (data) {
                setProjects(data);
            }
            setLoading(false);
        };

        fetchProjects();
    }, []);

    // Extract unique categories
    const categories = ['Todos', ...Array.from(new Set(projects.map(p => p.category)))];

    const filteredProjects = filter === 'Todos' 
        ? projects 
        : projects.filter(p => p.category === filter);

    const handleNext = useCallback(() => {
        setSelectedIndex(prev => (prev !== null ? (prev + 1) % filteredProjects.length : null));
    }, [filteredProjects]);

    const handlePrev = useCallback(() => {
        setSelectedIndex(prev => (prev !== null ? (prev - 1 + filteredProjects.length) % filteredProjects.length : null));
    }, [filteredProjects]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === 'Escape') setSelectedIndex(null);
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, handleNext, handlePrev]);

  return (
    <ScrollLayout>
       <div className="bg-azul-oscuro min-h-screen text-white font-garet">
        {/* Hero Section */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Nuestros <span className="text-naranja">Proyectos</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              La calidad habla por sí misma. Explora algunos de los retos que hemos convertido en realidad.
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="pb-24 px-6">
            <div className="max-w-[1600px] mx-auto">
                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                     {categories.map(cat => (
                         <Button 
                            key={cat} 
                            onClick={() => { setFilter(cat); setSelectedIndex(null); }}
                            variant={filter === cat ? "secondary" : "ghost"} 
                            className={`rounded-full font-bold ${filter === cat ? "bg-naranja text-azul-oscuro hover:bg-white" : "text-white hover:text-naranja hover:bg-white/10"}`}
                        >
                             {cat}
                         </Button>
                     ))}
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Cargando proyectos...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.map((project, idx) => (
                            <div 
                                key={project.id} 
                                onClick={() => setSelectedIndex(idx)}
                                className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-naranja/50 transition-all hover:shadow-2xl hover:shadow-naranja/10 cursor-pointer h-80"
                            >
                                <div className="absolute inset-0">
                                    {project.image_url ? (
                                        <Image 
                                            src={project.image_url} 
                                            alt={project.title} 
                                            fill 
                                            className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/20 select-none">No Image</div>
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-azul-oscuro/90 via-azul-oscuro/50 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                {/* Content Overlay */}
                                <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <span className="text-naranja text-xs font-bold uppercase tracking-wider mb-1 block">{project.category}</span>
                                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-1 group-hover:text-naranja transition-colors">{project.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                                        <Maximize2 size={12} />
                                        <span>Click para ver detalles</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && filteredProjects.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No hay proyectos en esta categoría aún.
                    </div>
                )}

                <div className="mt-20 text-center">
                    <h3 className="text-2xl font-bold mb-6">¿Tienes un proyecto en mente?</h3>
                    <Link href="/contacto">
                         <Button className="bg-white text-azul-oscuro hover:bg-naranja hover:text-azul-oscuro font-extrabold text-lg px-8 py-6 rounded-full transition-all">
                             Hacerlo Realidad
                         </Button>
                    </Link>
                </div>
            </div>
        </section>

        {/* Lightbox Modal */}
        {selectedIndex !== null && filteredProjects[selectedIndex] && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-200">
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedIndex(null)}
                    className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                >
                    <X size={32} />
                </button>

                {/* Navigation Buttons */}
                <button 
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-naranja hover:text-azul-oscuro rounded-full text-white transition-all z-20 group"
                >
                    <ChevronLeft size={32} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-naranja hover:text-azul-oscuro rounded-full text-white transition-all z-20 group"
                >
                    <ChevronRight size={32} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Content Container */}
                <div className="flex flex-col md:flex-row w-full max-w-7xl h-[85vh] bg-azul-oscuro rounded-3xl overflow-hidden shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                    
                    {/* Image Area */}
                    <div className="w-full md:w-2/3 h-1/2 md:h-full relative bg-black/50">
                        {filteredProjects[selectedIndex].image_url ? (
                            <Image 
                                src={filteredProjects[selectedIndex].image_url} 
                                alt={filteredProjects[selectedIndex].title} 
                                fill 
                                className="object-contain p-4" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">No Image</div>
                        )}
                    </div>

                    {/* Info Area */}
                    <div className="w-full md:w-1/3 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-center bg-white/5 border-l border-white/5 relative overflow-y-auto">
                        <span className="text-naranja font-bold tracking-widest uppercase text-sm mb-4 block">
                            {filteredProjects[selectedIndex].category}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">
                            {filteredProjects[selectedIndex].title}
                        </h2>
                        <div className="w-12 h-1 bg-naranja mb-8" />
                        <p className="text-gray-300 text-lg leading-relaxed mb-8">
                            {filteredProjects[selectedIndex].description}
                        </p>
                        
                        <div className="mt-auto pt-8 border-t border-white/10">
                            <p className="text-sm text-gray-500 italic">
                                Proyecto Prototyp3D
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )}

       </div>
       <Footer />
    </ScrollLayout>
  );
}
