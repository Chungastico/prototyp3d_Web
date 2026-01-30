import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateImageTags, generateProductDescription } from '@/app/actions/tag-image';
import { X, Loader2, Plus, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SalesCatalogItem {
    id?: string;
    title: string;
    category: string;
    description: string;
    image_url: string;
    model_url?: string;
    tags?: string[];
}

interface CreateSalesCatalogItemModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onItemSaved: () => void;
    itemToEdit?: SalesCatalogItem | null;
}

export function CreateSalesCatalogItemModal({ open, onOpenChange, onItemSaved, itemToEdit }: CreateSalesCatalogItemModalProps) {
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [generatingTags, setGeneratingTags] = useState(false);
    const [generatingDescription, setGeneratingDescription] = useState(false);

    const [newTag, setNewTag] = useState('');
    const [formData, setFormData] = useState<SalesCatalogItem>({
        title: '',
        category: '',
        description: '',
        image_url: '',
        model_url: '',
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
                model_url: '',
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
            const filePath = `sales/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('portafolio')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('portafolio').getPublicUrl(filePath);
            const imageUrl = data.publicUrl;

            setFormData(prev => ({ ...prev, image_url: imageUrl }));

            // Auto-generate tags si no hay tags previos
            const hadTags = (formData.tags || []).length > 0;
            if (!hadTags) {
                setGeneratingTags(true);
            }

            try {
                const generatedTags = !hadTags ? await generateImageTags(imageUrl) : [];
                if (generatedTags && generatedTags.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        tags: [...(prev.tags || []), ...generatedTags].filter((v, i, a) => a.indexOf(v) === i)
                    }));
                }
            } catch (tagError) {
                console.error('Error generating tags', tagError);
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

    const handleGenerateDescription = async () => {
        if (!formData.image_url) return;

        setGeneratingDescription(true);
        try {
            const text = await generateProductDescription({
                imageUrl: formData.image_url,
                title: formData.title,
                category: formData.category,
                tags: formData.tags || []
            });

            if (text.trim()) {
                setFormData(prev => ({
                    ...prev,
                    description: text
                }));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setGeneratingDescription(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (itemToEdit?.id) {
                await supabase.from('sales_catalog_items').update(formData).eq('id', itemToEdit.id);
            } else {
                await supabase.from('sales_catalog_items').insert(formData);
            }
            onItemSaved();
            onOpenChange(false);
        } catch (e) {
            console.error(e);
            alert('Error saving sales item');
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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {itemToEdit ? 'Editar Item de Venta' : 'Nuevo Item de Venta'}
                        <Badge variant="outline" className="text-naranja border-naranja bg-naranja/10">Catálogo Ventas</Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Left Column: Image */}
                        <div className="md:col-span-5 space-y-4">
                            <div className="space-y-2">
                                <Label>Imagen del Producto</Label>
                                <div className={`border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 transition relative ${uploading ? 'opacity-50 pointer-events-none' : ''} h-[280px] flex flex-col items-center justify-center`}>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple={false}
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    {formData.image_url ? (
                                        <div className="relative w-full h-full rounded overflow-hidden">
                                            <img src={formData.image_url} alt="Preview" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Sparkles className="h-10 w-10 mb-3 text-naranja/50" />
                                            <p className="text-sm font-medium">Click o arrastra imagen</p>
                                            <p className="text-xs text-gray-300 mt-1">La IA generará etiquetas automáticamente</p>
                                        </div>
                                    )}
                                </div>
                                {uploading && (
                                    <p className="text-xs text-naranja flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin h-3 w-3" /> Subiendo...
                                    </p>
                                )}
                                {generatingTags && (
                                    <p className="text-xs text-blue-600 flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin h-3 w-3" /> IA Generando etiquetas...
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Details */}
                        <div className="md:col-span-7 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Título / Nombre</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ej: Corazón Geométrico"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Categoría Principal</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Regalos">Regalos</SelectItem>
                                            <SelectItem value="Decoración">Decoración</SelectItem>
                                            <SelectItem value="Accesorios">Accesorios</SelectItem>
                                            <SelectItem value="Coleccionables">Coleccionables</SelectItem>
                                            <SelectItem value="Gadgets">Gadgets</SelectItem>
                                            <SelectItem value="San Valentín">San Valentín</SelectItem>
                                            <SelectItem value="Personalizado">Personalizado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Descripción de Venta</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGenerateDescription}
                                        disabled={!formData.image_url || generatingDescription || uploading || generatingTags}
                                        className="h-8"
                                    >
                                        {generatingDescription ? (
                                            <>
                                                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                                Generando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-3 w-3 mr-2" />
                                                Generar
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe el producto para el cliente..."
                                    className="h-24 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    URL del Modelo 3D
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Interno</span>
                                </Label>
                                <Input
                                    value={formData.model_url || ''}
                                    onChange={e => setFormData({ ...formData, model_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <Label className="flex justify-between items-center">
                            <span>Etiquetas de Búsqueda (Tags)</span>
                            <span className="text-xs text-gray-400 font-normal">Ayudan al cliente a encontrar este producto</span>
                        </Label>

                        <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
                            {formData.tags && formData.tags.length > 0 ? (
                                formData.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="px-3 py-1 bg-white border border-gray-200 text-gray-700 hover:border-naranja transition-colors">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-gray-300 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-xs text-gray-400 italic py-2">Sube una imagen para generar tags o agrégalos manualmente.</p>
                            )}
                        </div>

                        <div className="flex gap-2 mt-2">
                            <Input
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Nueva etiqueta..."
                                className="max-w-[200px] h-8 text-sm"
                            />
                            <Button type="button" onClick={addTag} size="sm" variant="outline" className="h-8">
                                <Plus className="h-3 w-3 mr-1" /> Agregar
                            </Button>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading || uploading || generatingTags || generatingDescription}
                        className="bg-naranja hover:bg-orange-600"
                    >
                        {loading ? 'Guardando...' : 'Guardar Item'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
