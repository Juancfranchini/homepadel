import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  username: z.string().min(2, 'El usuario es requerido'),
  buttonText: z.string().min(2, 'El texto del botón es requerido'),
  buttonUrl: z.string().min(1, 'La URL del perfil es requerida'),
  appId: z.string().optional().or(z.literal('')),
  appSecret: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
  manualUrls: z.array(z.object({ url: z.string(), thumbnail: z.string().optional() })).optional(),
});
export type FormData = z.infer<typeof schema>;

export const DEFAULT_INSTAGRAM_VALUES: FormData = {
  title: 'No te pierdas ninguna publicacion',
  username: '@home.padel',
  buttonText: 'Seguinos en Instagram',
  buttonUrl: 'https://instagram.com/home.padel',
  appId: '',
  appSecret: '',
  active: true,
  manualUrls: [{ url: '', thumbnail: '' }, { url: '', thumbnail: '' }, { url: '', thumbnail: '' }, { url: '', thumbnail: '' }, { url: '', thumbnail: '' }, { url: '', thumbnail: '' }],
};

async function uploadThumbnail(file: File, index: number, setValue: any, toast: any): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setValue(('manualUrls.' + index + '.thumbnail') as any, res.data?.url || res.data?.imageUrl || '', { shouldDirty: true });
    toast('Imagen subida correctamente', 'success');
  } catch {
    toast('Error al subir la imagen', 'error');
  }
}

export function useInstagramConfig() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: DEFAULT_INSTAGRAM_VALUES });
  const { reset, watch, setValue } = form;
  const fieldArray = useFieldArray({ control: form.control, name: 'manualUrls' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/instagram');
      const data = res.data?.data ?? res.data;
      if (data && typeof data === 'object') {
        reset({
          ...DEFAULT_INSTAGRAM_VALUES,
          ...data,
          manualUrls: data.manualUrls && data.manualUrls.length > 0
            ? data.manualUrls.map((u: any) => ({ url: typeof u === 'string' ? u : u.url, thumbnail: typeof u === 'object' ? u.thumbnail : '' }))
            : [{ url: '', thumbnail: '' }],
        });
      }
    } catch { toast('No se pudo cargar la configuración de Instagram', 'error'); } finally { setLoading(false); }
  }, [reset, toast]);

  useEffect(() => { load(); }, [load]);

  const handleUploadThumbnail = async (index: number) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    await uploadThumbnail(file, index, setValue, toast);
    setUploadingIndex(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        manualUrls: (data.manualUrls || [])
          .filter((u: any) => u.url && u.url.trim())
          .map((u: any) => ({ url: u.url.trim(), thumbnail: u.thumbnail || '' })),
      };
      await api.put('/site-sections/instagram', { data: payload, active: data.active });
      toast('Configuración de Instagram guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    const appId = watch('appId');
    const appSecret = watch('appSecret');
    if (!appId || !appSecret) {
      toast('Ingresa App ID y App Secret primero', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const testUrl = watch('manualUrls')?.[0]?.url || 'https://www.instagram.com/p/abcdef/';
      const res = await api.post('/instagram/test-connection', { appId, appSecret, postUrl: testUrl });
      setTestResult(res.data?.success === true);
      toast(res.data?.success ? 'Conexion exitosa' : 'Error de conexion. Verifica oEmbed Read en Meta Developers.', res.data?.success ? 'success' : 'error');
    } catch {
      setTestResult(false);
      toast('Error al probar conexion', 'error');
    } finally { setTesting(false); }
  };

  return {
    form, loading, saving, testing, testResult, uploadingIndex, setUploadingIndex, fileRef,
    fields: fieldArray.fields, append: fieldArray.append, remove: fieldArray.remove,
    handleUploadThumbnail, onSubmit, handleTestConnection,
  };
}
