'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, FileText, Plus, Trash2, MessageCircle, Mail, Clock, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { createElement } from 'react';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

const ICON_OPTIONS = [
  { value: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'Clock', label: 'Horarios', icon: Clock },
  { value: 'MapPin', label: 'Ubicacion', icon: MapPin },
];

const ICON_MAP: Record<string, any> = { MessageCircle, Mail, Clock, MapPin };

export default function ContactoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, watch, setValue, formState: { errors } } = useForm<any>({ resolver: zodResolver(z.object({}).passthrough()) });
  const cardsArray = useFieldArray({ control, name: 'cards' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/contacto');
      const data = res.data?.data ?? res.data ?? {};
      reset({
        chip: data.chip || 'ESTAMOS PARA AYUDARTE',
        title: data.title || 'Contactanos',
        description: data.description || 'Tenes dudas? Nuestro equipo esta para ayudarte.',
        heroImage: data.heroImage || '',
        mapUrl: data.mapUrl || '',
        newsletterTitle: data.newsletterTitle || 'ENTERATE DE LAS NOVEDADES',
        newsletterText: data.newsletterText || 'Suscribite y recibi ofertas exclusivas y lanzamientos.',
        cards: data.cards?.length > 0 ? data.cards : [
          { icon: 'MessageCircle', bg: 'bg-green-500/10 border-green-500/20', title: 'WhatsApp', desc: 'La forma mas rapida.', detail: '11 3181-3297', href: 'https://wa.me/5491131813297' },
          { icon: 'Mail', bg: 'bg-[#B7D31A]/10 border-[#B7D31A]/20', title: 'Email', desc: 'Respondemos tu consulta.', detail: 'hola@homepadel.com.ar', href: 'mailto:hola@homepadel.com.ar' },
          { icon: 'Clock', bg: 'bg-white/5 border-[#0D0F0F]', title: 'Horarios', desc: 'Lunes a Viernes de 9 a 18 hs.', detail: 'Sabados de 9 a 13 hs.', href: '' },
          { icon: 'MapPin', bg: 'bg-white/5 border-[#0D0F0F]', title: 'Ubicacion', desc: 'Villa Luro, CABA.', detail: 'Envios a todo el pais', href: '' },
        ],
      });
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put('/site-sections/contacto', { data, active: true });
      toast('Contacto guardado', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#C8FF00]" />Pagina de Contacto</h1>
          <p className="text-gray-500 text-sm mt-0.5">Configura todas las secciones de la pagina /contacto</p>
        </div>
        <Link href="/configuracion/canales-contacto" className="ml-auto flex items-center gap-2 px-4 py-2 border border-[#C8FF00]/50 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          <ExternalLink className="w-4 h-4" />Gestionar Canales de Contacto
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hero */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Hero Principal</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Chip</label><input {...register('chip')} className={inputClass} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Titulo</label><input {...register('title')} className={inputClass} /></div>
          </div>
          <div><label className={labelClass}>Descripcion</label><textarea {...register('description')} rows={2} className={inputClass} /></div>
        </div>

        {/* Imagen de fondo del Hero */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Imagen de Fondo del Hero</h3>
          <ImageUpload
            value={watch('heroImage') || ''}
            onChange={(url: string) => setValue('heroImage', url, { shouldDirty: true })}
            placeholder="URL o subir imagen de fondo"
            width={300}
            height={150}
          />
        </div>

        {/* Cards de info de contacto */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Informacion de Contacto (columna izquierda)</h3>
            <button type="button" onClick={() => cardsArray.append({ icon: 'MessageCircle', bg: 'bg-white/5 border-[#0D0F0F]', title: '', desc: '', detail: '', href: '' })}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          {cardsArray.fields.map((field, i) => {
            const currentIcon = watch('cards.' + i + '.icon') || 'MessageCircle';
            const IconComp = ICON_MAP[currentIcon] || MessageCircle;
            return (
              <div key={field.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="relative w-32">
                    <select {...register(('cards.' + i + '.icon') as any)} className={inputClass + ' text-xs pl-8'}>
                      {ICON_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                    </select>
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none">{createElement(IconComp, { size: 14 })}</span>
                  </div>
                  <input {...register(('cards.' + i + '.bg') as any)} className={inputClass + ' w-40 text-xs'} placeholder="bg class" />
                  <button type="button" onClick={() => cardsArray.remove(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input {...register(('cards.' + i + '.title') as any)} className={inputClass} placeholder="Titulo" />
                  <input {...register(('cards.' + i + '.desc') as any)} className={inputClass} placeholder="Descripcion" />
                  <input {...register(('cards.' + i + '.detail') as any)} className={inputClass} placeholder="Detalle" />
                  <input {...register(('cards.' + i + '.href') as any)} className={inputClass} placeholder="Link (opcional)" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Mapa */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Mapa</h3>
          <div>
            <label className={labelClass}>URL del mapa de Google Maps (embed)</label>
            <input {...register('mapUrl')} className={inputClass} placeholder="https://www.google.com/maps/embed?pb=..." />
            <p className="text-xs text-gray-400 mt-1">Pega el link de "Compartir" {'>'} "Insertar un mapa" de Google Maps</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Seccion Newsletter</h3>
          <div><label className={labelClass}>Titulo</label><input {...register('newsletterTitle')} className={inputClass} /></div>
          <div><label className={labelClass}>Descripcion</label><input {...register('newsletterText')} className={inputClass} /></div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}