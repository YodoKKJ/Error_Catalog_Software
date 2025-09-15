import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { SystemError, ErrorSeverity, ErrorStatus } from '@/types/error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const errorSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  resolution: z.string().optional(),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  status: z.enum(['open', 'investigating', 'resolved', 'closed']),
  system: z.string().min(1, 'Sistema é obrigatório'),
  errorCode: z.string().optional(),
  stackTrace: z.string().optional(),
  assignedTo: z.string().optional(),
  tags: z.string().optional(),
});

type ErrorFormData = z.infer<typeof errorSchema>;

interface ErrorFormProps {
  error?: SystemError;
  onSubmit: (data: ErrorFormData & { imageUrl?: string }) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ErrorForm({ error, onSubmit, onCancel, submitLabel = 'Salvar' }: ErrorFormProps) {
  const { user } = useAuth();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(error?.imageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState<string>('');

  // Buscar nome do usuário logado
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        setUserName(profile?.full_name || user.email || 'Usuário');
      }
    };

    fetchUserProfile();
  }, [user]);

  const form = useForm<ErrorFormData>({
    resolver: zodResolver(errorSchema),
    defaultValues: {
      title: error?.title || '',
      description: error?.description || '',
      resolution: error?.resolution || '',
      severity: error?.severity || 'medium',
      status: error?.status || 'open',
      system: error?.system || '',
      errorCode: error?.errorCode || '',
      stackTrace: error?.stackTrace || '',
      assignedTo: userName || error?.assignedTo || '',
      tags: error?.tags?.join(', ') || '',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imagePreview;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `error-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('error-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error('Erro ao fazer upload da imagem');
        console.error('Upload error:', uploadError);
        return null;
      }

      const { data } = supabase.storage
        .from('error-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Erro ao fazer upload da imagem');
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (data: ErrorFormData) => {
    const imageUrl = await uploadImage();
    
    const tags = data.tags 
      ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      : [];

    await onSubmit({
      ...data,
      assignedTo: userName, // Sempre usar o nome do usuário logado
      tags: tags.join(', '),
      imageUrl: imageUrl || undefined,
    });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{error ? 'Editar Erro' : 'Novo Erro'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Título do erro"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Descrição detalhada do erro"
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="resolution">Resolução</Label>
                <Textarea
                  id="resolution"
                  {...form.register('resolution')}
                  placeholder="Como o erro foi ou pode ser resolvido"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="system">Sistema *</Label>
                <Input
                  id="system"
                  {...form.register('system')}
                  placeholder="Nome do sistema"
                />
                {form.formState.errors.system && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.system.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severidade *</Label>
                  <Select 
                    value={form.watch('severity')} 
                    onValueChange={(value: ErrorSeverity) => form.setValue('severity', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="high">Alto</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="low">Baixo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status *</Label>
                  <Select 
                    value={form.watch('status')} 
                    onValueChange={(value: ErrorStatus) => form.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="investigating">Investigando</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="errorCode">Código do Erro</Label>
                <Input
                  id="errorCode"
                  {...form.register('errorCode')}
                  placeholder="Código identificador do erro"
                />
              </div>

              <div>
                <Label htmlFor="assignedTo">Responsável</Label>
                <Input
                  id="assignedTo"
                  value={userName}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  placeholder="Carregando..."
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...form.register('tags')}
                  placeholder="Tags separadas por vírgula"
                />
              </div>

              <div>
                <Label>Imagem</Label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-full max-h-48 rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Clique para selecionar uma imagem
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Imagem
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="stackTrace">Stack Trace</Label>
            <Textarea
              id="stackTrace"
              {...form.register('stackTrace')}
              placeholder="Stack trace completo do erro"
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || uploading}
              className="flex-1"
            >
              {form.formState.isSubmitting || uploading ? 'Salvando...' : submitLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}