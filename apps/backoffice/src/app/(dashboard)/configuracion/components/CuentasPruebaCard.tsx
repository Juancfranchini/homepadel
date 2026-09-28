'use client';

import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { FlaskConical, Save, ExternalLink } from 'lucide-react';
import api from '@/lib/api';

const TIENDA_URL = (process.env.NEXT_PUBLIC_STORE_URL || 'https://www.homepadel.com.ar').replace(/\/+$/, '');

const listaSchema = z.array(z.string().email());

/** Un mail por línea (o separados por coma); sin repetidos ni vacíos. */
function leerLista(texto: string): string[] {
  const mails = texto.split(/[\s,;]+/).map((m) => m.trim().toLowerCase()).filter(Boolean);
  return [...new Set(mails)];
}

function ModoPruebaAyuda() {
  return (
    <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-900 space-y-1">
      <p>
        <strong>Para navegar la tienda sin que se cuente</strong> (visitas, productos vistos, carrito), activá el modo
        prueba en ese navegador. Queda activo hasta que toques &quot;Salir&quot; en el aviso de la tienda.
      </p>
      <a href={TIENDA_URL + '/?modo_prueba=1'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-amber-800 underline">
        Activar modo prueba en este navegador <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

/**
 * Mails con los que la tienda hace compras de prueba. Lo que se compra o se
 * deja en el carrito con ellos queda marcado como prueba: no suma en el
 * panel, en Estadísticas, en Carritos abandonados ni en Marketing, y no se
 * informa a Meta. Se guarda en `site_sections/cuentas_prueba`, que es privada.
 */
export default function CuentasPruebaCard() {
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const { data } = await api.get('/site-sections/cuentas_prueba');
      const emails: unknown = data?.data?.emails;
      setTexto(Array.isArray(emails) ? emails.filter((e) => typeof e === 'string').join('\n') : '');
    } catch {
      setError('No se pudo cargar la lista de cuentas de prueba.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardar = async () => {
    const emails = leerLista(texto);
    const validacion = listaSchema.safeParse(emails);
    if (!validacion.success) {
      const malos = emails.filter((m) => !z.string().email().safeParse(m).success);
      setError('Estos no son mails válidos: ' + malos.join(', '));
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await api.put('/site-sections/cuentas_prueba', { active: true, data: { emails: validacion.data } });
      setTexto(validacion.data.join('\n'));
      alert('Cuentas de prueba guardadas');
    } catch {
      setError('No se pudo guardar. Probá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-amber-600" /> Compras de prueba
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Las compras y carritos hechos con estos mails quedan marcados como <strong>prueba</strong>: no suman en el
          panel, las estadísticas, los carritos abandonados ni Marketing, y no se mandan a Meta. Aplica a lo que se
          haga desde que se guardan.
        </p>
      </div>

      <div>
        <label htmlFor="cuentas-prueba" className="block text-sm font-medium text-gray-700 mb-1.5">Mails de prueba (uno por línea)</label>
        <textarea
          id="cuentas-prueba"
          rows={4}
          disabled={cargando}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="tu-mail@gmail.com"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] text-gray-900"
        />
        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      </div>

      <ModoPruebaAyuda />

      <div className="flex justify-end">
        <button
          type="button"
          onClick={guardar}
          disabled={cargando || guardando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-[#C8FF00] text-[#0f172a] hover:bg-[#b8ef00] disabled:bg-gray-200 disabled:text-gray-400"
        >
          <Save className="w-4 h-4" /> {guardando ? 'Guardando...' : 'Guardar cuentas de prueba'}
        </button>
      </div>
    </div>
  );
}
