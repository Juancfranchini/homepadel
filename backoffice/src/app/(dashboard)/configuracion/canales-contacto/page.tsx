'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import api from '@/lib/api';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { createElement } from 'react';

const ICON_OPTIONS = [
  { value: 'MessageCircle', label: 'WhatsApp', icon: MessageCircle },
  { value: 'Mail', label: 'Email', icon: Mail },
  { value: 'Clock', label: 'Horarios', icon: Clock },
  { value: 'MapPin', label: 'Ubicacion', icon: MapPin },
];

const ICON_MAP: Record<string, any> = { MessageCircle, Mail, Clock, MapPin };
const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';

export default function CanalesContactoPage() {
  const { toast } = useToast();
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ icon: 'MessageCircle', title: '', desc: '', detail: '', href: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact-channels/admin/all');
      const data = res.data?.data || res.data?.value || res.data;
      setChannels(Array.isArray(data) ? data : []);
    } catch { setChannels([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setForm({ icon: 'MessageCircle', title: '', desc: '', detail: '', href: '' }); setModalOpen(true); };
  const openEdit = (c: any) => { setEditItem(c); setForm({ icon: c.icon || 'MessageCircle', title: c.title || '', desc: c.desc || '', detail: c.detail || '', href: c.href || '' }); setModalOpen(true); };

  const onSubmit = async () => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/contact-channels/' + editItem.id, form); toast('Canal actualizado', 'success'); }
      else { await api.post('/contact-channels', form); toast('Canal creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await api.delete('/contact-channels/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canales de Contacto</h1>
          <p className="text-gray-500 text-sm mt-0.5">{channels.length} canales</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] whitespace-nowrap shrink-0">
          <Plus className="w-4 h-4" />Nuevo canal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((c) => {
          const IconComp = ICON_MAP[c.icon] || MessageCircle;
          return (
            <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
                    {createElement(IconComp, { size: 18, className: 'text-[#C8FF00]' })}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium text-sm">{c.title || 'Sin titulo'}</p>
                    <p className="text-xs text-gray-400">{c.desc || ''}</p>
                  </div>
                </div>
              </div>
              {c.detail && <p className="text-sm text-gray-600">{c.detail}</p>}
              {c.href && <a href={c.href} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C8FF00] hover:underline break-all">{c.href}</a>}
              <div className="border-t pt-2 flex justify-end gap-2">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar canal' : 'Nuevo canal'} size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className={inputClass}>
                {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titulo</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
              <input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
              <input value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} className={inputClass} />
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
              <button onClick={onSubmit} disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </Modal>
      )}

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar canal" description={'Eliminar ' + (deleteTarget?.title || '') + '?'} />
    </div>
  );
}