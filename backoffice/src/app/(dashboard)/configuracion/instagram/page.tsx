'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, ExternalLink, Plus, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  username: z.string().min(2, 'El usuario es requerido'),
  buttonText: z.string().min(2, 'El texto del boton es requerido'),
  buttonUrl: z.string().min(1, 'La URL del perfil es requerida'),
  appId: z.string().optional().or(z.literal('')),
  appSecret: z.string().optional().or(z.literal('')),
  active: z.boolean().default(true),
  manualUrls: z.array(z.object({ url: z.string() })).optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function InstagramConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);

  const { register, handleSubmit, reset, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: 'No te pierdas ninguna publicacion',
      username: '@home.padel',
      buttonText: 'Seguinos en Instagram',
      buttonUrl: 'https://instagram.com/home.padel',
      appId: '',
      appSecret: '',
      active: true,
      manualUrls: [{ url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'manualUrls' });
  const watchUsername = watch('username');
  const watchTitle = watch('title');
  const watchAppId = watch('appId');
  const watchAppSecret = watch('appSecret');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/instagram');
      const data = res.data?.data ?? res.data;
      if (data && typeof data === 'object') {
        reset({
          title: data.title ?? 'No te pierdas ninguna publicacion',
          username: data.username ?? '@home.padel',
          buttonText: data.buttonText ?? 'Seguinos en Instagram',
          buttonUrl: data.buttonUrl ?? 'https://instagram.com/home.padel',
          appId: data.appId ?? '',
          appSecret: data.appSecret ?? '',
          active: data.active !== false,
          manualUrls: data.manualUrls && data.manualUrls.length > 0
            ? data.manualUrls.map((u: string) => ({ url: u }))
            : [{ url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }, { url: '' }],
        });
      }
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        manualUrls: data.manualUrls?.map((u) => u.url).filter(Boolean) || [],
      };
      await api.put('/site-sections/instagram', { data: payload, active: data.active });
      toast('Configuracion de Instagram guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleTestConnection = async () => {
    if (!watchAppId || !watchAppSecret) {
      toast('Ingresa App ID y App Secret primero', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const testUrl = watch('manualUrls')?.[0]?.url || 'https://www.instagram.com/p/abcdef/';
      const res = await api.post('/instagram/test-connection', {
        appId: watchAppId,
        appSecret: watchAppSecret,
        postUrl: testUrl,
      });
      setTestResult(res.data?.success === true);
      toast(res.data?.success ? 'Conexion exitosa' : 'Error de conexion', res.data?.success ? 'success' : 'error');
    } catch {
      setTestResult(false);
      toast('Error al probar conexion', 'error');
    } finally { setTesting(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instagram</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configuracion de la seccion Instagram del inicio</p>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[#C8FF00] text-xs font-bold uppercase tracking-widest mb-1">Vista previa</p>
          <p className="text-white font-black text-lg">{watchTitle || 'No te pierdas ninguna publicacion'}</p>
        </div>
        <a href={watch('buttonUrl')} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#C8FF00] text-[#0f172a] px-4 py-2 rounded-full font-bold text-sm">
          {watchUsername || '@home.padel'}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Datos generales</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titulo *</label>
              <input {...register('title')} className={inputClass} placeholder="No te pierdas ninguna publicacion" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Usuario *</label>
              <input {...register('username')} className={inputClass} placeholder="@home.padel" />
              {errors.username && <p className="text-xs text-red-600 mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Texto del boton *</label>
              <input {...register('buttonText')} className={inputClass} placeholder="Seguinos en Instagram" />
              {errors.buttonText && <p className="text-xs text-red-600 mt-1">{errors.buttonText.message}</p>}
            </div>
            <div>
              <label className={labelClass}>URL del perfil *</label>
              <input {...register('buttonUrl')} className={inputClass} placeholder="https://instagram.com/home.padel" />
              {errors.buttonUrl && <p className="text-xs text-red-600 mt-1">{errors.buttonUrl.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">Conexion API de Meta</h2>
            <button type="button" onClick={handleTestConnection} disabled={testing}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : testResult === true ? <CheckCircle className="w-4 h-4 text-green-500" /> : testResult === false ? <XCircle className="w-4 h-4 text-red-500" /> : null}
              {testing ? 'Probando...' : 'Probar conexion'}
            </button>
          </div>
          <p className="text-xs text-gray-400">Necesitas crear una App en Meta for Developers y obtener las credenciales. La app debe tener la funcion oEmbed Read activada.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Meta App ID</label>
              <input {...register('appId')} className={inputClass} placeholder="123456789" />
            </div>
            <div>
              <label className={labelClass}>Meta App Secret</label>
              <input {...register('appSecret')} type="password" className={inputClass} placeholder="abc123..." />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-800">URLs de posts ({fields.length})</h2>
            <button type="button" onClick={() => append({ url: '' })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] transition-colors">
              <Plus className="w-3 h-3" />Agregar
            </button>
          </div>
          <p className="text-xs text-gray-400">Pega las URLs de las publicaciones de Instagram que queres mostrar (maximo 6 visibles). Ej: https://www.instagram.com/p/abc123/</p>
          <div className="space-y-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...register(('manualUrls.' + index + '.url') as any)}
                  className={inputClass}
                  placeholder={'Post #' + (index + 1) + ' - https://www.instagram.com/p/...'}
                />
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(index)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="igActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
            <label htmlFor="igActive" className="text-sm text-gray-700 font-medium">Seccion activa (visible en el inicio)</label>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
