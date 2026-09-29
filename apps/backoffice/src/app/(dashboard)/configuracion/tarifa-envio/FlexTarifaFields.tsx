'use client';

import { useEffect, useState } from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Bike } from 'lucide-react';
import api from '@/lib/api';
import type { TarifaEnvioForm } from './page';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

type Zona = { zona: 1 | 2 | 3; localidades: string[] };
const CAMPOS = ['flexZona1', 'flexZona2', 'flexZona3'] as const;

/** Envío Flex (moto en AMBA, Kiosco Lo de Juan): se activa acá y se cobra por zona. */
export default function FlexTarifaFields({ register, errors }: { register: UseFormRegister<TarifaEnvioForm>; errors: FieldErrors<TarifaEnvioForm> }) {
  const [zonas, setZonas] = useState<Zona[]>([]);

  useEffect(() => {
    api.get('/envio-flex').then((res) => setZonas(res.data?.zonas ?? [])).catch(() => setZonas([]));
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2"><Bike className="w-4 h-4 text-[#84cc16]" />Envío Flex en moto (Buenos Aires)</h2>
          <p className="text-gray-500 text-xs mt-1">Kiosco Lo de Juan · Tribulato 1149. Colecta de 13 a 14 hs, reparto desde las 16 hs. Se cobra según la zona de la localidad del cliente y no tiene envío gratis.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 flex-shrink-0 cursor-pointer">
          <input type="checkbox" {...register('flexActivo')} className="h-4 w-4 accent-[#84cc16]" />
          Activo
        </label>
      </div>
      {CAMPOS.map((campo, i) => {
        const zona = zonas.find((z) => z.zona === i + 1);
        return (
          <div key={campo}>
            <label className={labelClass}>Zona {i + 1} ($)</label>
            <input type="number" step="1" min="0" {...register(campo)} className={inputClass} />
            {errors[campo] && <p className="text-red-500 text-xs mt-1">{errors[campo]?.message}</p>}
            {zona && <p className="text-gray-400 text-xs mt-1">{zona.localidades.join(', ')}</p>}
          </div>
        );
      })}
    </div>
  );
}
