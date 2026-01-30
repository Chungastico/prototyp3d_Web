import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export function SalesCatalogList({ onEdit, refreshKey }: { onEdit: (item: any) => void, refreshKey: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    const { data } = await supabase.from('sales_catalog_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const handleDelete = async (id: string) => {
      if (confirm('¿Estás seguro de eliminar este item del catálogo de ventas?')) {
          await supabase.from('sales_catalog_items').delete().eq('id', id);
          fetchItems();
      }
  };

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
        <div className="flex items-center gap-2 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
                placeholder="Buscar por nombre, categoría o tag..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Tags (Búsqueda)</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-400">Sin img</div>
                        )}
                        <span className="font-medium text-gray-900">{item.title}</span>
                      </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {item.tags?.slice(0, 4).map((tag: string) => (
                            <span key={tag} className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded">
                                {tag}
                            </span>
                        ))}
                        {item.tags?.length > 4 && <span className="text-[10px] text-gray-400">+{item.tags.length - 4}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(item)} className="h-8 w-8 hover:bg-blue-50">
                            <Edit size={14} className="text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 hover:bg-red-50">
                            <Trash2 size={14} className="text-red-600" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredItems.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                          No se encontraron items
                      </TableCell>
                  </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
