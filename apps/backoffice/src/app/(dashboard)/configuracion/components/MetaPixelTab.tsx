'use client';

import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { MetaPixelForm, useMetaPixel } from './useMetaPixel';

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

function CredentialsFields({ form, onChange, showToken, onToggleShowToken }: {
  form: MetaPixelForm; onChange: (f: MetaPixelForm) => void; showToken: boolean; onToggleShowToken: () => void;
}) {
  return (
    <>
      <div>
        <label className={labelClass}>Pixel ID *</label>
        <input type="text" className={inputClass} placeholder="Ej: 1234567890" value={form.pixelId}
          onChange={(e) => onChange({ ...form, pixelId: e.target.value.trim() })} />
        <p className="text-xs text-gray-400 mt-1">Se encuentra en: Administrador de eventos  Configuracion  Identificador del pixel</p>
      </div>

      <div>
        <label className={labelClass}>Access Token (CAPI)</label>
        <div className="relative">
          <input type={showToken ? 'text' : 'password'} className={inputClass + ' pr-10'} placeholder="EAA..." value={form.accessToken}
            onChange={(e) => onChange({ ...form, accessToken: e.target.value.trim() })} />
          <button type="button" onClick={onToggleShowToken} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Se encuentra en: Configuracion  API de Conversiones  Generar token. NUNCA compartir este valor.</p>
      </div>

      <div>
        <label className={labelClass}>Test Event Code (opcional - solo desarrollo)</label>
        <input type="text" className={inputClass} placeholder="TEST12345" value={form.testEventCode}
          onChange={(e) => onChange({ ...form, testEventCode: e.target.value.trim() })} />
        <p className="text-xs text-gray-400 mt-1">Solo usar en entorno de pruebas. Dejar vacio en produccion.</p>
      </div>
    </>
  );
}

function EventsChecklist({ form, onChange, eventLabels }: {
  form: MetaPixelForm; onChange: (f: MetaPixelForm) => void; eventLabels: Array<{ key: keyof MetaPixelForm['events']; label: string }>;
}) {
  return (
    <div className="border-t border-gray-100 pt-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Eventos a trackear</h3>
      <div className="space-y-2">
        {eventLabels.map((event) => (
          <label key={event.key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.events[event.key]}
              onChange={(e) => onChange({ ...form, events: { ...form.events, [event.key]: e.target.checked } })}
              className="w-4 h-4 border border-gray-300 rounded-[1px] cursor-pointer accent-[#C8FF00]"
            />
            <span className="text-sm text-gray-600">{event.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function MetaPixelTab() {
  const { form, setForm, loading, saving, handleSave } = useMetaPixel();
  const [showToken, setShowToken] = useState(false);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
        <p className="text-gray-400 text-sm">Cargando configuracion...</p>
      </div>
    );
  }

  const eventLabels: Array<{ key: keyof MetaPixelForm['events']; label: string }> = [
    { key: 'pageView', label: 'PageView - Vista de pagina' },
    { key: 'viewContent', label: 'ViewContent - Vista de producto' },
    { key: 'addToCart', label: 'AddToCart - Agregar al carrito' },
    { key: 'initiateCheckout', label: 'InitiateCheckout - Iniciar checkout' },
    { key: 'purchase', label: 'Purchase - Compra confirmada' },
    { key: 'contact', label: 'Contact - Click a WhatsApp' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-800 mb-2">Meta Pixel - Configuracion</h2>
        <p className="text-xs text-gray-400 mb-5">
          Ingresa los datos de tu Meta Pixel desde el Administrador de Eventos de Facebook. El Access Token es secreto y solo se usa en el servidor.
        </p>

        <div className="space-y-5">
          <CredentialsFields form={form} onChange={setForm} showToken={showToken} onToggleShowToken={() => setShowToken(!showToken)} />
          <EventsChecklist form={form} onChange={setForm} eventLabels={eventLabels} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!form.pixelId || saving}
          className={'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ' +
            (form.pixelId && !saving
              ? 'bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar configuracion'}
        </button>
      </div>
    </div>
  );
}
