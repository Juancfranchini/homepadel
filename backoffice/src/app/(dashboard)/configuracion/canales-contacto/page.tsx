'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import Toggle from '../../testimonios/components/Toggle';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';

interface ContactChannel {
  id: string;
  title: string;
  description: string;
  logo: string;
  url: string;
  buttonText: string;
  order: number;
  active: boolean;
}

const schema = z.object({
  title: z.string().min(2, 'El titulo es requerido'),
  description: z.string().optional().default(''),
  logo: z.string().optional().default(''),
  url: z.string().min(1, 'La URL es requerida'),
  buttonText: z.string().optional().default('Ir al canal'),
  order: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider';

export default function CanalesContactoPage() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<ContactChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContactChannel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactChannel | null>(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact-channels/admin/all');
      const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      setChannels([...data].sort((a: ContactChannel, b: ContactChannel) => a.order - b.order));
    } catch { setChannels([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditItem(null);
    reset({ title: '', description: '', logo: '', url: '', buttonText: 'Ir al canal', order: channels.length + 1, active: true });
    setModalOpen(true);
  };

  const openEdit = (item: ContactChannel) => {
    setEditItem(item);
    reset({ title: item.title, description: item.description, logo: item.logo, url: item.url, buttonText: item.buttonText || 'Ir al canal', order: item.order, active: item.active });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      if (editItem) {
        await api.patch('/contact-channels/' + editItem.id, data);
        toast('Canal actualizado', 'success');
      } else {
        await api.post('/contact-channels', data);
        toast('Canal creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete('/contact-channels/' + deleteTarget.id);
      toast('Canal eliminado', 'success');
      setDeleteTarget(null);
      load();
    } catch { toast('Error al eliminar', 'error'); }
  };

  const toggleActive = async (item: ContactChannel) => {
    try {
      await api.patch('/contact-channels/' + item.id, { active: !item.active });
      toast(item.active ? 'Canal ocultado' : 'Canal activado', 'success');
      load();
    } catch { toast('Error al cambiar estado', 'error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/contacto" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ArrowLeft className="w-4 h-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Canales de Contacto</h1>
            <p className="text-gray-500 text-sm mt-0.5">{channels.length} canales configurados</p>
          </div>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
          <Plus className="w-4 h-4" />Nuevo Canal
        </button>
      </div>

      {channels.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <p className="text-gray-400 text-sm">No hay canales configurados</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Descripcion</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">URL</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((item) => {
                const logoUrl = getImageUrl(item.logo);
                return (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-center text-sm text-gray-500">{item.order}</td>
                    <td className="px-4 py-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt={item.title} className="w-12 h-12 rounded-xl object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200"><span className="text-gray-400 text-xs">Logo</span></div>
                      )}
                    </td>
                    <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{item.title}</p></td>
                    <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{item.description}</td>
                    <td className="px-4 py-3 text-sm text-[#C8FF00] hidden md:table-cell truncate max-w-[200px]">{item.url}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Toggle checked={item.active} onChange={() => toggleActive(item)} />
                        <span className={'text-xs font-medium ' + (item.active ? 'text-green-600' : 'text-gray-400')}>{item.active ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar Canal' : 'Nuevo Canal'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Titulo *</label>
              <input {...register('title')} className={inputClass} placeholder="Ej: WhatsApp" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Texto del boton</label>
              <input {...register('buttonText')} className={inputClass} placeholder="Ir al canal" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Descripcion</label>
            <input {...register('description')} className={inputClass} placeholder="Breve descripcion" />
          </div>
          <div>
            <label className={labelClass}>URL *</label>
            <input {...register('url')} className={inputClass} placeholder="https://wa.me/549..." />
            {errors.url && <p className="text-xs text-red-600 mt-1">{errors.url.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Logo</label>
            <ImageUpload
              value={watch('logo') || ''}
              onChange={(url) => setValue('logo', url, { shouldDirty: true })}
              placeholder="URL o subir logo"
              width={120}
              height={120}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass} />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="chActive" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
              <label htmlFor="chActive" className="text-sm text-gray-700">Visible en el sitio</label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">
              <Save className="w-4 h-4 inline mr-1" />{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar Canal"
        description={'Eliminar el canal ' + (deleteTarget?.title || '') + '?'}
      />
    </div>
  );
}