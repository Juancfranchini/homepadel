'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, FileText, Plus, Trash2, RefreshCw, Package, Shield, Check, X } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { createElement } from 'react';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

const ICON_OPTIONS = [
  { value: 'RefreshCw', label: 'Cambios', icon: RefreshCw },
  { value: 'Package', label: 'Paquete', icon: Package },
  { value: 'Shield', label: 'Garantia', icon: Shield },
  { value: 'Check', label: 'Seguro', icon: Check },
];

const ICON_MAP: Record<string, any> = { RefreshCw, Package, Shield, Check };

export default function PoliticaDevolucionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<any>({ resolver: zodResolver(z.object({}).passthrough()) });

  const benefitsArray = useFieldArray({ control, name: 'benefits' });
  const conditionsOkArray = useFieldArray({ control, name: 'conditionsOk' });
  const conditionsNoArray = useFieldArray({ control, name: 'conditionsNo' });
  const stepsArray = useFieldArray({ control, name: 'steps' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/politica_devolucion');
      const data = res.data?.data ?? res.data ?? {};
      reset({
        chip: data.chip || 'DEVOLUCIONES Y CAMBIOS',
        title: data.title || 'Politica de Devolucion',
        description: data.description || 'En Home Padel queremos que estes 100% satisfecho con tu compra.',
        benefits: data.benefits?.length >= 4 ? data.benefits : [
          { icon: 'RefreshCw', title: '30 DIAS', desc: 'Tenes hasta 30 dias corridos desde que recibis tu pedido.' },
          { icon: 'Package', title: 'PRODUCTO SIN USO', desc: 'El producto debe estar sin uso, con etiquetas y en su embalaje original.' },
          { icon: 'Shield', title: 'CAMBIO O REINTEGRO', desc: 'Podes elegir entre cambio por otro producto o reintegro del dinero.' },
          { icon: 'Check', title: 'COMPRA SEGURA', desc: 'Proceso simple, rapido y 100% seguro.' },
        ],
        conditionsOk: data.conditionsOk?.length > 0 ? data.conditionsOk : ['El producto debe estar sin uso y en perfectas condiciones.','Debe incluir su embalaje original, etiquetas, manuales y accesorios.','La solicitud debe realizarse dentro de los 30 dias corridos desde la recepcion.','El producto no debe presentar signos de uso, desgaste o dano.','En caso de devolucion por falla o error nuestro, nos hacemos cargo del envio.','En caso de devolucion por arrepentimiento, el costo del envio corre por cuenta del cliente.'],
        conditionsNo: data.conditionsNo?.length > 0 ? data.conditionsNo : ['Productos usados o con signos de desgaste.','Productos que no incluyan su embalaje original, etiquetas o accesorios.','Productos en oferta o con descuento especial (salvo fallas de fabrica).','Productos personalizados o a pedido.','Productos que hayan sido alterados o modificados.','Pelotas, grips, overgrips u otros accesorios que hayan sido abiertos.'],
        steps: data.steps?.length > 0 ? data.steps : [{ title: 'CONTACTANOS', desc: 'Escribinos por WhatsApp, email o completa el formulario de contacto.' },{ title: 'PREPARA EL PRODUCTO', desc: 'Te indicaremos como y a donde enviar el producto.' },{ title: 'ENVIALO', desc: 'Despacha el producto segun las instrucciones que te dimos.' },{ title: 'REVISION', desc: 'Una vez recibido, revisaremos el estado del producto.' },{ title: 'CAMBIO O REINTEGRO', desc: 'Procesamos el cambio o el reintegro segun tu eleccion.' }],
        helpTitle: data.helpTitle || 'Necesitas ayuda?',
        helpDescription: data.helpDescription || 'Nuestro equipo esta listo para ayudarte con tu devolucion.',
        helpSchedule: data.helpSchedule || 'Lunes a Viernes de 9 a 18 hs. | Sabados de 9 a 13 hs.',
        helpWhatsapp: data.helpWhatsapp || '5491131813297',
        helpEmail: data.helpEmail || 'hola@homepadel.com.ar',
      });
    } catch { reset({}); } finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      await api.put('/site-sections/politica_devolucion', { data, active: true });
      toast('Politica de Devolucion guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#C8FF00]" />Politica de Devolucion</h1><p className="text-gray-500 text-sm mt-0.5">Contenido de la pagina de devoluciones y cambios</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hero */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Hero Principal</h3>
          <div><label className={labelClass}>Chip (texto verde)</label><input {...register('chip')} className={inputClass} placeholder="DEVOLUCIONES Y CAMBIOS" /></div>
          <div><label className={labelClass}>Titulo</label><input {...register('title')} className={inputClass} placeholder="Politica de Devolucion" /></div>
          <div><label className={labelClass}>Descripcion</label><textarea {...register('description')} rows={3} className={inputClass} /></div>
        </div>

        {/* Beneficios */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Beneficios</h3>
            <button type="button" onClick={() => benefitsArray.append({ icon: 'Shield', title: '', desc: '' })}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          {benefitsArray.fields.length > 0 && (
            <div className="flex gap-2 mb-1 px-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase" style={{width: '25%'}}>Icono</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase" style={{width: '35%'}}>Titulo</span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase" style={{width: '40%'}}>Descripcion</span>
              <span style={{width: 32}}></span>
            </div>
          )}
          {benefitsArray.fields.map((field, i) => {
            const currentIcon = watch('benefits.' + i + '.icon') || 'Shield';
            const IconComp = ICON_MAP[currentIcon] || Shield;
            return (
              <div key={field.id} className="flex gap-2 items-center p-2 bg-gray-50 rounded-lg">
                <div className="relative bg-white rounded-lg" style={{width: '25%'}}>
                  <select {...register(('benefits.' + i + '.icon') as any)} className='w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] pl-8 pr-1 appearance-none'>
                    {ICON_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#C8FF00] pointer-events-none z-10">
                    {createElement(IconComp, { size: 14 })}
                  </span>
                </div>
                <input {...register(('benefits.' + i + '.title') as any)} className={inputClass} style={{width: '35%'}} placeholder="Titulo" />
                <input {...register(('benefits.' + i + '.desc') as any)} className={inputClass} style={{width: '40%'}} placeholder="Descripcion" />
                <button type="button" onClick={() => benefitsArray.remove(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>

        {/* Condiciones OK */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Condiciones para devolucion</h3>
            <button type="button" onClick={() => conditionsOkArray.append('')}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          {conditionsOkArray.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center flex-none mt-0.5"><Check size={10} className="text-[#B7D31A]" /></span>
              <input {...register('conditionsOk.' + i)} className={inputClass} placeholder="Condicion..." />
              <button type="button" onClick={() => conditionsOkArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Pasos */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Como solicitar una devolucion</h3>
            <button type="button" onClick={() => stepsArray.append({ title: '', desc: '' })}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          {stepsArray.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i + 1}</span>
              <input {...register('steps.' + i + '.title')} className={inputClass + ' flex-1'} placeholder="Titulo del paso" />
              <input {...register('steps.' + i + '.desc')} className={inputClass + ' flex-1'} placeholder="Descripcion" />
              <button type="button" onClick={() => stepsArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Condiciones NO */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">Cuando NO aplica</h3>
            <button type="button" onClick={() => conditionsNoArray.append('')}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00]"><Plus size={12} />Agregar</button>
          </div>
          {conditionsNoArray.fields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <span className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none mt-0.5"><X size={10} className="text-red-400" /></span>
              <input {...register('conditionsNo.' + i)} className={inputClass} placeholder="No aplica si..." />
              <button type="button" onClick={() => conditionsNoArray.remove(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>

        {/* Ayuda */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3">Seccion de Ayuda</h3>
          <div><label className={labelClass}>Titulo</label><input {...register('helpTitle')} className={inputClass} /></div>
          <div><label className={labelClass}>Descripcion</label><input {...register('helpDescription')} className={inputClass} /></div>
          <div><label className={labelClass}>Horario</label><input {...register('helpSchedule')} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>WhatsApp</label><input {...register('helpWhatsapp')} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input {...register('helpEmail')} className={inputClass} /></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
