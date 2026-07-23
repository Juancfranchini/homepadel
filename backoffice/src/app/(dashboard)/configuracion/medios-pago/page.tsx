'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, ArrowLeft, CreditCard, Landmark, Wallet, Truck, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../../testimonios/components/Toggle';
import ImageUpload from '@/components/ui/ImageUpload';

const schema = z.object({
  mercadopagoActive: z.boolean(), mercadopagoPublicKey: z.string().optional(), mercadopagoAccessToken: z.string().optional(), mercadopagoLogo: z.string().optional(),
  transferenciaActive: z.boolean(), transferenciaCbu: z.string().optional(), transferenciaAlias: z.string().optional(), transferenciaTitular: z.string().optional(), transferenciaBanco: z.string().optional(), transferenciaLogo: z.string().optional(),
  visaActive: z.boolean(), visaLogo: z.string().optional(),
  mastercardActive: z.boolean(), mastercardLogo: z.string().optional(),
  amexActive: z.boolean(), amexLogo: z.string().optional(),
  caActive: z.boolean(), caLogo: z.string().optional(),
  ocaActive: z.boolean(), ocaLogo: z.string().optional(),
  andreaniActive: z.boolean(), andreaniLogo: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function MediosPagoPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showCbu, setShowCbu] = useState(false);
  const [showAlias, setShowAlias] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/site-sections/payment_methods');
      const data = res.data?.data ?? res.data ?? {};
      const mp = data.mercadopago || {}; const tf = data.transferencia || {};
      const vi = data.visa || {}; const mc = data.mastercard || {}; const ax = data.amex || {};
      const ca = data.ca || {}; const oc = data.oca || {}; const an = data.andreani || {};
      reset({
        mercadopagoActive: mp.active !== false, mercadopagoPublicKey: mp.publicKey || '', mercadopagoAccessToken: mp.accessToken || '', mercadopagoLogo: mp.logo || '',
        transferenciaActive: tf.active !== false, transferenciaCbu: tf.cbu || '', transferenciaAlias: tf.alias || '', transferenciaTitular: tf.titular || '', transferenciaBanco: tf.banco || '', transferenciaLogo: tf.logo || '',
        visaActive: vi.active !== false, visaLogo: vi.logo || '',
        mastercardActive: mc.active !== false, mastercardLogo: mc.logo || '',
        amexActive: ax.active !== false, amexLogo: ax.logo || '',
        caActive: ca.active !== false, caLogo: ca.logo || '',
        ocaActive: oc.active !== false, ocaLogo: oc.logo || '',
        andreaniActive: an.active !== false, andreaniLogo: an.logo || '',
      });
    } catch { } finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      const payload = {
        mercadopago: { active: data.mercadopagoActive, publicKey: data.mercadopagoPublicKey, accessToken: data.mercadopagoAccessToken, logo: data.mercadopagoLogo },
        transferencia: { active: data.transferenciaActive, cbu: data.transferenciaCbu, alias: data.transferenciaAlias, titular: data.transferenciaTitular, banco: data.transferenciaBanco, logo: data.transferenciaLogo },
        visa: { active: data.visaActive, logo: data.visaLogo },
        mastercard: { active: data.mastercardActive, logo: data.mastercardLogo },
        amex: { active: data.amexActive, logo: data.amexLogo },
        ca: { active: data.caActive, logo: data.caLogo },
        oca: { active: data.ocaActive, logo: data.ocaLogo },
        andreani: { active: data.andreaniActive, logo: data.andreaniLogo },
      };
      await api.put('/site-sections/payment_methods', { data: payload, active: true });
      toast('Configuracion guardada', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  if (loading) return <PageLoader />;

  const mpLogo = watch('mercadopagoLogo') || ''; const transfLogo = watch('transferenciaLogo') || '';
  const visaLogo = watch('visaLogo') || ''; const mcLogo = watch('mastercardLogo') || ''; const amexLogo = watch('amexLogo') || '';
  const caLogo = watch('caLogo') || ''; const ocaLogo = watch('ocaLogo') || ''; const andreaniLogo = watch('andreaniLogo') || '';

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3">
        <Link href="/configuracion" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-5 h-5 text-[#C8FF00]" />Medios de Pago y Envio</h1><p className="text-gray-500 text-sm mt-0.5">Configuracion de medios de pago y envio</p></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Mercado Pago */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Wallet className="w-4 h-4 text-[#C8FF00]" />Mercado Pago</h2>
            <Toggle checked={watch('mercadopagoActive')} onChange={() => setValue('mercadopagoActive', !watch('mercadopagoActive'), { shouldDirty: true })} />
          </div>
          {watch('mercadopagoActive') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Public Key</label>
                <div className="relative">
                  <input {...register('mercadopagoPublicKey')} className={inputClass + ' pr-8'} type={showKey ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Access Token</label>
                <div className="relative">
                  <input {...register('mercadopagoAccessToken')} className={inputClass + ' pr-8'} type={showToken ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div className="col-span-2"><label className={labelClass}>Logo</label><ImageUpload value={mpLogo} onChange={(url) => setValue('mercadopagoLogo', url, { shouldDirty: true })} width={200} height={80} /></div>
            </div>
          )}
        </div>

        {/* Transferencia */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2"><Landmark className="w-4 h-4 text-[#C8FF00]" />Transferencia Bancaria</h2>
            <Toggle checked={watch('transferenciaActive')} onChange={() => setValue('transferenciaActive', !watch('transferenciaActive'), { shouldDirty: true })} />
          </div>
          {watch('transferenciaActive') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>CBU</label>
                <div className="relative">
                  <input {...register('transferenciaCbu')} className={inputClass + ' pr-8'} type={showCbu ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowCbu(!showCbu)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCbu ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Alias</label>
                <div className="relative">
                  <input {...register('transferenciaAlias')} className={inputClass + ' pr-8'} type={showAlias ? 'text' : 'password'} />
                  <button type="button" onClick={() => setShowAlias(!showAlias)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showAlias ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div><label className={labelClass}>Titular</label><input {...register('transferenciaTitular')} className={inputClass} /></div>
              <div><label className={labelClass}>Banco</label><input {...register('transferenciaBanco')} className={inputClass} /></div>
              <div className="col-span-2"><label className={labelClass}>Logo</label><ImageUpload value={transfLogo} onChange={(url) => setValue('transferenciaLogo', url, { shouldDirty: true })} width={200} height={80} /></div>
            </div>
          )}
        </div>

        {/* Tarjetas */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-[#C8FF00]" />Tarjetas</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'visa', label: 'VISA', logo: visaLogo, active: watch('visaActive') },
            { key: 'mastercard', label: 'Mastercard', logo: mcLogo, active: watch('mastercardActive') },
            { key: 'amex', label: 'AMEX', logo: amexLogo, active: watch('amexActive') }].map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <Toggle checked={item.active} onChange={() => setValue((item.key + 'Active') as any, !item.active, { shouldDirty: true })} />
                </div>
                {item.active && <ImageUpload value={item.logo} onChange={(url) => setValue((item.key + 'Logo') as any, url, { shouldDirty: true })} width={200} height={80} />}
              </div>
            ))}
          </div>
        </div>

        {/* Envios */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b border-gray-100 pb-3 flex items-center gap-2"><Truck className="w-4 h-4 text-[#C8FF00]" />Medios de Envio</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ key: 'ca', label: 'Correo Argentino', logo: caLogo, active: watch('caActive') },
            { key: 'oca', label: 'OCA', logo: ocaLogo, active: watch('ocaActive') },
            { key: 'andreani', label: 'Andreani', logo: andreaniLogo, active: watch('andreaniActive') }].map((item) => (
              <div key={item.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <Toggle checked={item.active} onChange={() => setValue((item.key + 'Active') as any, !item.active, { shouldDirty: true })} />
                </div>
                {item.active && <ImageUpload value={item.logo} onChange={(url) => setValue((item.key + 'Logo') as any, url, { shouldDirty: true })} width={200} height={80} />}
              </div>
            ))}
          </div>
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
