import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PortfolioItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
}

interface CreateCatalogItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onItemSaved: () => void;
  itemToEdit?: PortfolioItem | null;
}

export function CreateCatalogItemModal({ open, onOpenChange, onItemSaved, itemToEdit }: CreateCatalogItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    category: '',
    description: '',
    image_url: '',
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData(itemToEdit);
    } else {
      setFormData({
        title: '',
        category: '',
        description: '',
        image_url: '',
      });
    }
  }, [itemToEdit, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('portafolio') // Corrected bucket name
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('portafolio').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: data.publicUrl });
    } catch (error: any) {
      console.error('Upload error details:', error);
      alert(`Error uploading image: ${error.message || JSON.stringify(error)}`);
    } finally {
      setUploading(false);
    }
  };
  
  const handleSave = async () => {
      setLoading(true);
      try {
          if (itemToEdit?.id) {
              await supabase.from('portfolio_items').update(formData).eq('id', itemToEdit.id);
          } else {
              await supabase.from('portfolio_items').insert(formData);
          }
          onItemSaved();
          onOpenChange(false);
      } catch (e) {
          console.error(e);
          alert('Error saving project');
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Título del Proyecto</Label>
                <Input 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    placeholder="Ej: Maqueta Arquitectónica"
                />
             </div>
             
             <div className="space-y-2">
                <Label>Categoría</Label>
                <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({...formData, category: val})}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Maquetas">Maquetas</SelectItem>
                        <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                        <SelectItem value="Arte & Decoración">Arte & Decoración</SelectItem>
                        <SelectItem value="Prototipado">Prototipado</SelectItem>
                        <SelectItem value="Merch">Merch</SelectItem>
                    </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Breve descripción del proyecto..."
                />
             </div>

             <div className="space-y-2">
                <Label>Imagen</Label>
                <Input 
                    type="file" 
                    accept="image/*" 
                    multiple={false}
                    onChange={handleImageUpload} 
                    disabled={uploading}
                />
                {uploading && <p className="text-sm text-yellow-600">Subiendo imagen...</p>}
                {formData.image_url && (
                    <div className="mt-2 relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                )}
             </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || uploading} className="bg-naranja hover:bg-orange-600">
                {loading ? 'Guardando...' : 'Guardar Proyecto'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
