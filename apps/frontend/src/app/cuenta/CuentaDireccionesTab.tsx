'use client';

import { useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { actualizarDireccion, borrarDireccion, crearDireccion, DireccionGuardada, DireccionInput, getDirecciones } from '@/lib/api';
import DireccionForm from './DireccionForm';

const MAX_DIRECCIONES = 3;

function mensajeDeError(err: unknown): string {
  const detalle = (err as { response?: { data?: { message?: unknown } } })?.response?.data?.message;
  if (Array.isArray(detalle)) return detalle.join('. ');
  return typeof detalle === 'string' ? detalle : 'No se pudo guardar. Probá de nuevo.';
}

/** Hasta 3 direcciones de entrega: se agregan, editan y borran acá y se eligen en el checkout. */
export default function CuentaDireccionesTab() {
  const [direcciones, setDirecciones] = useState<DireccionGuardada[] | null>(null);
  const [editando, setEditando] = useState<string | 'nueva' | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDirecciones().then(setDirecciones).catch(() => setError('No pudimos cargar tus direcciones.'));
  }, []);

  const guardar = async (datos: DireccionInput) => {
    setGuardando(true);
    setError('');
    try {
      const guardada = editando === 'nueva' ? await crearDireccion(datos) : await actualizarDireccion(editando as string, datos);
      setDirecciones((prev) => (editando === 'nueva' ? [...(prev ?? []), guardada] : (prev ?? []).map((d) => (d.id === guardada.id ? guardada : d))));
      setEditando(null);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async (direccion: DireccionGuardada) => {
    if (!window.confirm(`¿Borrar la dirección ${direccion.label || direccion.street}?`)) return;
    try {
      await borrarDireccion(direccion.id);
      setDirecciones((prev) => (prev ?? []).filter((d) => d.id !== direccion.id));
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const lista = direcciones ?? [];
  const lleno = lista.length >= MAX_DIRECCIONES;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2"><MapPin size={20} className="text-brand-fg" />Direcciones</h2>
        {direcciones && editando === null && !lleno && (
          <button onClick={() => setEditando('nueva')} className="flex items-center gap-1.5 text-sm font-bold text-brand-fg hover:underline"><Plus size={15} />Agregar dirección</button>
        )}
      </div>
      {error && <p className="text-sm text-red-500 light:text-red-600 mb-4">{error}</p>}
      {direcciones === null && !error && <div className="h-20 bg-chip rounded-xl animate-pulse" />}
      {editando === 'nueva' && <div className="mb-4"><DireccionForm guardando={guardando} onGuardar={guardar} onCancelar={() => setEditando(null)} /></div>}
      {direcciones && lista.length === 0 && editando === null && (
        <div className="text-center py-12">
          <MapPin size={48} className="mx-auto text-chip mb-4" />
          <p className="text-fg-muted font-medium mb-1">Todavía no guardaste direcciones</p>
          <p className="text-fg-muted text-sm">Guardá hasta {MAX_DIRECCIONES} y elegilas en el checkout sin volver a escribirlas.</p>
        </div>
      )}
      <div className="space-y-3">
        {lista.map((d) => (editando === d.id ? (
          <DireccionForm key={d.id} inicial={d} guardando={guardando} onGuardar={guardar} onCancelar={() => setEditando(null)} />
        ) : (
          <div key={d.id} className="rounded-xl border border-chip p-4 flex items-start justify-between gap-3">
            <div className="text-sm">
              {d.label && <p className="font-bold text-fg mb-0.5">{d.label}</p>}
              <p className="text-fg-soft">{d.street}</p>
              <p className="text-fg-muted">{d.city}, {d.province} ({d.postalCode}){d.phone ? ` · ${d.phone}` : ''}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => setEditando(d.id)} disabled={editando !== null} aria-label="Editar dirección" className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-chip disabled:opacity-40"><Pencil size={15} /></button>
              <button onClick={() => borrar(d)} disabled={editando !== null} aria-label="Borrar dirección" className="p-2 rounded-lg text-fg-muted hover:text-red-500 light:hover:text-red-600 hover:bg-chip disabled:opacity-40"><Trash2 size={15} /></button>
            </div>
          </div>
        )))}
      </div>
      {lleno && editando === null && <p className="text-xs text-fg-muted mt-4">Llegaste al máximo de {MAX_DIRECCIONES} direcciones. Editá o borrá una para sumar otra.</p>}
    </div>
  );
}
