'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, Cloud, Upload } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  cloudName: z.string().min(2, 'Cloud Name requerido'),
  apiKey: z.string().min(2, 'API Key requerido'),
  apiSecret: z.string().min(2, 'API Secret requerido'),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

export default function CloudinaryConfigPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { cloudName: '', apiKey: '', apiSecret: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/cloudinary');
      const data = res.data?.data ?? res.data;
      if (data && typeof data === 'object') {
        reset({
          cloudName: data.cloudName ?? '',
          apiKey: data.apiKey ?? '',
          apiSecret: data.apiSecret ?? '',
        });
      }
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/cloudinary', { data, active: true });
      toast('Configuración de Cloudinary guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cloudinary</h1>
            <p className="text-gray-500 text-sm mt-0.5">Configuración del almacenamiento de imágenes</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Credenciales de Cloudinary</h2>
          <p className="text-xs text-gray-400">Obtené tus credenciales en el dashboard de Cloudinary  Settings  API Keys. Asegurate de usar las credenciales del Product Environment.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Cloud Name</label>
              <input {...register('cloudName')} className={inputClass} placeholder="ej: tu-cloud-name" />
              {errors.cloudName && <p className="text-xs text-red-600 mt-0.5">{errors.cloudName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>API Key</label>
              <input {...register('apiKey')} className={inputClass} placeholder="ej: 123456789" />
              {errors.apiKey && <p className="text-xs text-red-600 mt-0.5">{errors.apiKey.message}</p>}
            </div>
            <div>
              <label className={labelClass}>API Secret</label>
              <input {...register('apiSecret')} type="password" className={inputClass} placeholder="" />
              {errors.apiSecret && <p className="text-xs text-red-600 mt-0.5">{errors.apiSecret.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Cloud className="w-5 h-5 text-[#C8FF00]" />
            <p className="text-sm text-gray-700 font-medium">Las imágenes se subirán a Cloudinary y se almacenará la URL en la base de datos.</p>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
              <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}