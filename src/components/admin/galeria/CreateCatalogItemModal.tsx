import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateImageTags } from '@/app/actions/tag-image';
import { X, Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PortfolioItem {
  id?: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  tags?: string[];
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
  const [generatingTags, setGeneratingTags] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    category: '',
    description: '',
    image_url: '',
    tags: []
  });

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        ...itemToEdit,
        tags: itemToEdit.tags || []
      });
    } else {
      setFormData({
        title: '',
        category: '',
        description: '',
        image_url: '',
        tags: []
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
        .from('portafolio')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('portafolio').getPublicUrl(filePath);
      const imageUrl = data.publicUrl;
      
      setFormData(prev => ({ ...prev, image_url: imageUrl }));

      // Auto-generate tags
      // Si ya hay tags manuales/previos, no fuerces IA automáticamente
      if ((formData.tags || []).length === 0) {
        setGeneratingTags(true);
      }
      try {
        const generatedTags = (formData.tags || []).length === 0
            ? await generateImageTags(imageUrl)
            : [];
        if (generatedTags && generatedTags.length > 0) {
            setFormData(prev => ({ 
                ...prev, 
                tags: [...(prev.tags || []), ...generatedTags].filter((v, i, a) => a.indexOf(v) === i) // Unique
            }));
        }
      } catch (tagError) {
          console.error("Error generating tags", tagError);
      } finally {
          setGeneratingTags(false);
      }

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

  const addTag = () => {
      if (!newTag.trim()) return;
      if (formData.tags?.includes(newTag.trim())) {
          setNewTag('');
          return;
      }
      setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
      setFormData(prev => ({
          ...prev,
          tags: prev.tags?.filter(tag => tag !== tagToRemove)
      }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
             <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="Impresión 3D">Impresión 3D</SelectItem>
                            <SelectItem value="Ingeniería">Ingeniería</SelectItem>
                            <SelectItem value="Arte & Decoración">Arte & Decoración</SelectItem>
                            <SelectItem value="Prototipado">Prototipado</SelectItem>
                            <SelectItem value="Merch">Merch</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                {uploading && <p className="text-sm text-yellow-600 flex items-center gap-2"><Loader2 className="animate-spin h-3 w-3" /> Subiendo imagen...</p>}
                {generatingTags && <p className="text-sm text-blue-600 flex items-center gap-2"><Loader2 className="animate-spin h-3 w-3" /> Analizando imagen y generando etiquetas...</p>}
                
                {formData.image_url && (
                    <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
                    </div>
                )}
             </div>

             <div className="space-y-2">
                <Label>Etiquetas (Tags)</Label>
                <div className="flex gap-2">
                    <Input 
                        value={newTag} 
                        onChange={e => setNewTag(e.target.value)} 
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                        placeholder="Agregar etiqueta manual (Enter)..." 
                    />
                    <Button type="button" onClick={addTag} size="icon" variant="secondary"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 min-h-[30px] p-2 bg-gray-50 rounded border border-gray-100">
                    {formData.tags && formData.tags.length > 0 ? (
                        formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-red-500">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))
                    ) : (
                        <p className="text-xs text-gray-400 italic">No hay etiquetas. Sube una imagen para generar automáticamente o agrega manualmente.</p>
                    )}
                </div>
             </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={loading || uploading || generatingTags} className="bg-naranja hover:bg-orange-600">
                {loading ? 'Guardando...' : 'Guardar Proyecto'}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
