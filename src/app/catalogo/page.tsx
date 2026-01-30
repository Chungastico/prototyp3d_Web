'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Filter, ShoppingBag, ChevronDown, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SalesCatalogItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  tags?: string[];
  created_at?: string;
}

export default function CatalogPage() {
  const [items, setItems] = useState<SalesCatalogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<SalesCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter sections open state
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  
  // Mobile Filter Drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Categories extracted from items or predefined
  const categories = ["Todos", "Regalos", "Decoración", "Accesorios", "Coleccionables", "San Valentín"];

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedTags, searchQuery, selectedCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_catalog_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setItems(data);
        const tags = Array.from(new Set(data.flatMap((item) => item.tags || []))).sort();
        setAllTags(tags);
      }
    } catch (error) {
      console.error('Error fetching catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let result = items;

    // Filter by Category
    if (selectedCategory && selectedCategory !== "Todos") {
        result = result.filter(item => item.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(item => 
        selectedTags.every(tag => item.tags?.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query) ||
        item.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredItems(result);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="h-screen bg-white pt-20 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile Header (Search + Filter Toggle) */}
        <div className="md:hidden flex-none p-4 pb-2 bg-white z-30 border-b border-gray-100">
             <div className="flex gap-2">
                 <div className="relative flex-1">
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-full text-gray-800 bg-gray-100 border-none focus:ring-2 focus:ring-naranja/20 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                 </div>
                 <Button 
                    variant="outline" 
                    size="icon" 
                    className="shrink-0 rounded-full border-gray-200 text-azul-oscuro"
                    onClick={() => setIsMobileFiltersOpen(true)}
                 >
                     <Filter className="h-4 w-4" />
                 </Button>
             </div>
        </div>

        {/* Mobile Filter Drawer Overlay */}
        <AnimatePresence>
            {isMobileFiltersOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={() => setIsMobileFiltersOpen(false)}
                    />
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white z-50 md:hidden shadow-2xl flex flex-col"
                    >
                         <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                             <h3 className="font-bold text-azul-oscuro text-lg">Filtros</h3>
                             <Button variant="ghost" size="icon" onClick={() => setIsMobileFiltersOpen(false)} className="text-gray-500">
                                 <X className="h-5 w-5" />
                             </Button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Reusing Filter Content Logic for Mobile Drawer */}
                             {/* Categories */}
                            <div>
                                <h4 className="font-bold text-azul-oscuro text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Categorías
                                </h4>
                                <div className="space-y-1">
                                    {categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { setSelectedCategory(cat === selectedCategory ? null : cat); setIsMobileFiltersOpen(false); }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                                                selectedCategory === cat 
                                                    ? 'bg-naranja text-white shadow-md' 
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="font-bold text-azul-oscuro text-sm uppercase tracking-wider">Etiquetas</h4>
                                    {selectedTags.length > 0 && (
                                        <button onClick={() => setSelectedTags([])} className="text-xs text-red-500 hover:underline">Limpiar</button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {allTags.map(tag => (
                                        <Badge 
                                            key={tag}
                                            variant="outline"
                                            className={`cursor-pointer px-3 py-1.5 text-xs font-medium border ${
                                                selectedTags.includes(tag)
                                                    ? 'bg-azul-oscuro text-white border-azul-oscuro'
                                                    : 'bg-white border-gray-200 text-gray-500'
                                            }`}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                         </div>
                         <div className="p-4 border-t border-gray-100 bg-gray-50">
                             <Button className="w-full bg-naranja text-white font-bold hover:bg-orange-600" onClick={() => setIsMobileFiltersOpen(false)}>
                                 Ver Resultados ({filteredItems.length})
                             </Button>
                         </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden md:flex w-80 flex-shrink-0 bg-gray-50/50 border-r border-gray-100 flex-col h-full overflow-hidden">
            <div className="p-6 overflow-y-auto h-full space-y-8">
                
                {/* Search Bar - Desktop */}
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-naranja/20 focus:border-naranja shadow-sm text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>

                {/* Categories - Collapsible */}
                <div>
                    <button 
                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                        className="flex items-center justify-between w-full font-bold text-azul-oscuro text-sm uppercase tracking-wider mb-4 hover:text-naranja transition-colors"
                    >
                        <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Categorías</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <motion.div 
                        initial={false}
                        animate={{ height: isCategoriesOpen ? 'auto' : 0, opacity: isCategoriesOpen ? 1 : 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-1 pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                                    className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm font-medium ${
                                        selectedCategory === cat 
                                            ? 'bg-naranja/10 text-naranja font-bold border-l-2 border-naranja' 
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Tags - Collapsible */}
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <button 
                            onClick={() => setIsTagsOpen(!isTagsOpen)}
                            className="flex items-center justify-between w-full font-bold text-azul-oscuro text-sm uppercase tracking-wider hover:text-naranja transition-colors"
                        >
                             <span>Etiquetas</span>
                             <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isTagsOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    <motion.div 
                         initial={false}
                         animate={{ height: isTagsOpen ? 'auto' : 0, opacity: isTagsOpen ? 1 : 0 }}
                         className="overflow-hidden"
                    >
                        <div className="pb-2">
                             {selectedTags.length > 0 && (
                                <button onClick={() => setSelectedTags([])} className="text-xs text-red-500 hover:underline mb-3 block">Limpiar filtros</button>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {allTags.map(tag => (
                                    <Badge 
                                        key={tag}
                                        variant="outline"
                                        className={`cursor-pointer px-3 py-1.5 transition-all text-xs font-medium border ${
                                            selectedTags.includes(tag)
                                                ? 'bg-azul-oscuro text-white border-azul-oscuro shadow-sm'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-naranja hover:text-naranja'
                                        }`}
                                        onClick={() => toggleTag(tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                                {allTags.length === 0 && !loading && (
                                    <p className="text-sm text-gray-400 italic">Sin etiquetas.</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </aside>

        {/* Main Content - Independent Scroll */}
        <main className="flex-1 overflow-y-auto h-full bg-white relative scroll-smooth w-full">
             <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
                
                {/* Active Filters Summary (Mobile/Desktop) */}
                {(selectedCategory || selectedTags.length > 0 || (searchQuery && window.innerWidth >= 768)) && (
                    <div className="mb-4 md:mb-6 flex flex-wrap gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="text-xs md:text-sm text-gray-500 mr-2 font-bold">Filtros:</span>
                        {selectedCategory && selectedCategory !== "Todos" && (
                                <Badge className="bg-naranja text-white text-[10px] md:text-xs px-2 py-0.5">{selectedCategory}</Badge>
                        )}
                        {selectedTags.map(tag => (
                                <Badge key={tag} className="bg-azul-oscuro text-white text-[10px] md:text-xs px-2 py-0.5">{tag} <X onClick={() => toggleTag(tag)} className="ml-1 h-3 w-3 cursor-pointer"/></Badge>
                        ))}
                         <button 
                            onClick={() => { setSelectedTags([]); setSelectedCategory(null); setSearchQuery(''); }}
                            className="text-[10px] md:text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
                        >
                            Limpiar
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-10 w-10 text-naranja animate-spin mb-4" />
                        <p className="text-gray-400 text-sm">Cargando catálogo...</p>
                    </div>
                ) : filteredItems.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 pb-20">
                        <AnimatePresence>
                            {filteredItems.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    key={item.id}
                                    className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                                >
                                    {/* Image Area */}
                                    <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-2 md:p-4">
                                        <div className="absolute top-2 left-2 z-10">
                                             <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-azul-oscuro text-[9px] md:text-[10px] font-bold shadow-sm px-1.5 py-0.5">
                                                {item.category}
                                            </Badge>
                                        </div>
                                        
                                        {item.image_url ? (
                                            <Image 
                                                src={item.image_url} 
                                                alt={item.title} 
                                                fill
                                                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                            />
                                        ) : (
                                            <div className="text-gray-300 text-xs">Sin imagen</div>
                                        )}

                                        {/* WhatsApp Direct Action (Desktop) */}
                                        <div className="hidden md:block absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                             <Button size="icon" className="bg-green-500 hover:bg-green-600 rounded-full h-10 w-10 shadow-lg text-white">
                                                <ShoppingBag className="h-4 w-4" />
                                             </Button>
                                        </div>
                                        {/* WhatsApp Direct Action (Mobile - always visible but smaller) */}
                                         <div className="md:hidden absolute bottom-2 right-2">
                                             <div className="bg-green-500 rounded-full p-1.5 shadow-md text-white">
                                                <ShoppingBag className="h-3 w-3" />
                                             </div>
                                        </div>
                                    </div>

                                    <div className="p-3 md:p-5 flex flex-col flex-1">
                                        <h3 className="text-sm md:text-base font-bold text-azul-oscuro mb-1 leading-tight line-clamp-2 md:line-clamp-1 group-hover:text-naranja transition-colors font-garet">{item.title}</h3>
                                        <p className="hidden md:line-clamp-2 text-gray-500 text-xs mb-3 leading-relaxed">{item.description}</p>
                                        
                                        <div className="mt-auto pt-2 md:pt-3 border-t border-gray-50 flex items-center gap-1 md:gap-2 overflow-hidden flex-wrap">
                                           {item.tags?.slice(0, 2).map((tag) => (
                                                <span key={tag} className="text-[9px] md:text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 whitespace-nowrap">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                     <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-50 p-6 rounded-full mb-4">
                            <Search className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-azul-oscuro mb-1">No encontramos resultados</h3>
                        <p className="text-gray-400 text-sm max-w-xs mx-auto">Intenta ajustar tu búsqueda o filtros.</p>
                     </div>
                )}
             </div>
        </main>
    </div>
  );
}


