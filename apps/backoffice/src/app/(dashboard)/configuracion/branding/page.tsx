'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Image } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

const schema = z.object({
  logoHeader: z.string().optional().or(z.literal('')),
  logoFooter: z.string().optional().or(z.literal('')),
  isotipo: z.string().optional().or(z.literal('')),
  logoMobile: z.string().optional().or(z.literal('')),
  logoLogin: z.string().optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function LogoField({ label, register, name, placeholder, previewUrl, previewHeight = 'h-8', hint }: {
  label: string; register: any; name: keyof FormData; placeholder: string; previewUrl?: string; previewHeight?: string; hint?: string;
}) {
  return (
    <div>
      <label className={labelClass}>
        <span className="flex items-center gap-2"><Image className="w-4 h-4 text-[#C8FF00]" />{label}</span>
      </label>
      <input {...register(name)} className={inputClass} placeholder={placeholder} />
      {previewUrl && (
        <div className="mt-3 p-4 bg-gray-900 rounded-lg inline-block">
          <img src={previewUrl} alt={label} className={previewHeight + ' object-contain'} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </div>
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function BrandingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const logoHeader = watch('logoHeader');
  const logoFooter = watch('logoFooter');
  const isotipo = watch('isotipo');
  const logoMobile = watch('logoMobile');
  const logoLogin = watch('logoLogin');

  useEffect(() => {
    api.get('/site-sections/branding')
      .then(res => {
        const data = res.data?.data || res.data || {};
        reset({
          logoHeader: data.logoHeader || '',
          logoFooter: data.logoFooter || '',
          isotipo: data.isotipo || '',
          logoMobile: data.logoMobile || '',
          logoLogin: data.logoLogin || '',
        });
      })
      .catch(() => toast('No se pudo cargar la identidad de marca', 'error'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await api.put('/site-sections/branding', { data });
      toast('Configuración guardada', 'success');
    } catch {
      toast('Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Identidad de Marca</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona los logos de la tienda</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <LogoField label="Logo Header (Principal)" register={register} name="logoHeader" placeholder="https://... o deja vacio para usar el logo por defecto"
            previewUrl={logoHeader} previewHeight="h-10" hint="Se muestra en el header y footer. Recomendado: PNG con fondo transparente, 200x60px." />
          <LogoField label="Logo Footer" register={register} name="logoFooter" placeholder="https://... (opcional, si es diferente al header)" previewUrl={logoFooter} />
          <LogoField label="Isotipo (solo icono)" register={register} name="isotipo" placeholder="https://... (opcional)" previewUrl={isotipo} previewHeight="h-10"
            hint="Version sin texto. Se usa en FinalMessage, AboutSection y favicon." />
          <LogoField label="Logo Login (Formulario)" register={register} name="logoLogin" placeholder="https://... (opcional, para formulario de login)" previewUrl={logoLogin}
            hint="Se muestra en el formulario de login/registro. Recomendado: 200x60px." />
          <LogoField label="Logo Mobile" register={register} name="logoMobile" placeholder="https://... (opcional, version reducida para moviles)" previewUrl={logoMobile} />
        </div>

        <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-3 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}