import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import Image from 'next/image';

export function CatalogList({ onEdit, refreshKey }: { onEdit: (item: any) => void, refreshKey: number }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    const { data } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false });
    if (data) setItems(data);
  };

  const handleDelete = async (id: string) => {
      if (confirm('¿Estás seguro de eliminar este proyecto?')) {
          await supabase.from('portfolio_items').delete().eq('id', id);
          fetchItems();
      }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Imagen</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Etiquetas</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                  {item.image_url && (
                    <div className="relative w-16 h-16 rounded overflow-hidden">
                        <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                    </div>
                  )}
              </TableCell>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                    {item.tags?.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                    {item.tags?.length > 3 && <span className="text-xs text-gray-400">+{item.tags.length - 3}</span>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit size={16} className="text-blue-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} className="text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
