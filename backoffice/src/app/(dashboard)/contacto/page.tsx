'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, FileText, Plus, Trash2, MessageCircle, Mail, Clock, MapPin, Edit2 } from 'lucide-react';
import api from '@/lib/api';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import { createElement } from 'react';
import ImageUpload from '@/components/ui/ImageUpload';
import Toggle from '../testimonios/components/Toggle';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1';

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
  const [channels, setChannels] = useState<any[]>([]);
  const [cardModal, setCardModal] = useState(false);
  const [editCardIndex, setEditCardIndex] = useState<number | null>(null);
  const [channelModal, setChannelModal] = useState(false);
  const [editChannel, setEditChannel] = useState<any>(null);
  const [deleteChannelTarget, setDeleteChannelTarget] = useState<any>(null);
  const [cardForm, setCardForm] = useState({ icon: 'MessageCircle', bgColor: '#8A8A85', title: '', desc: '', detail: '', href: '' });
  const [channelForm, setChannelForm] = useState({ title: '', description: '', logo: '', url: '', buttonText: '' });

  const { register, handleSubmit, reset, control, watch, setValue } = useForm<any>({ resolver: zodResolver(z.object({}).passthrough()) });
  const cardsArray = useFieldArray({ control, name: 'cards' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contactoRes, channelsRes] = await Promise.all([
        api.get('/site-sections/contacto'),
        api.get('/contact-channels/admin/all'),
      ]);
      
      const data = contactoRes.data?.data ?? contactoRes.data ?? {};
      const channelsData = channelsRes.data?.data || channelsRes.data?.value || channelsRes.data;
      
      reset({
        chip: data.chip || 'ESTAMOS PARA AYUDARTE',
        title: data.title || 'Contactanos',
        description: data.description || 'Tenes dudas? Nuestro equipo esta para ayudarte.',
        heroImage: data.heroImage || '',
        mapUrl: data.mapUrl || '',
        newsletterTitle: data.newsletterTitle || 'ENTERATE DE LAS NOVEDADES',
        newsletterText: data.newsletterText || 'Suscribite y recibi ofertas exclusivas y lanzamientos.',
        heroActive: data.heroActive !== false,
        benefitsActive: data.benefitsActive !== false,
        channelsActive: data.channelsActive !== false,
        faqActive: data.faqActive !== false,
        mapActive: data.mapActive !== false,
        newsletterActive: data.newsletterActive !== false,
        cards: data.cards?.length > 0 ? data.cards : [],
      });
      
      setChannels(Array.isArray(channelsData) ? channelsData : []);
    } catch {} finally { setLoading(false); }
  }, [reset]);

  useEffect(() => { load(); }, [load]);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        cards: data.cards.map((card: any) => ({
          ...card,
          bgColor: card.bgColor || '#8A8A85',
        })),
      };
      await api.put('/site-sections/contacto', { data: payload, active: true });
      toast('Contacto guardado', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const openCreateCard = () => {
    setEditCardIndex(null);
    setCardForm({ icon: 'MessageCircle', bgColor: '#8A8A85', title: '', desc: '', detail: '', href: '' });
    setCardModal(true);
  };

  const openEditCard = (index: number) => {
    const card = cardsArray.fields[index] as any;
    setEditCardIndex(index);
    setCardForm({ icon: card.icon || 'MessageCircle', bgColor: card.bgColor || '#8A8A85', title: card.title || '', desc: card.desc || '', detail: card.detail || '', href: card.href || '' });
    setCardModal(true);
  };

  const handleSaveCard = () => {
    if (!cardForm.title.trim()) {
      toast('El titulo es requerido', 'error');
      return;
    }
    if (editCardIndex !== null) {
      setValue('cards.' + editCardIndex, cardForm, { shouldDirty: true });
    } else {
      cardsArray.append(cardForm);
    }
    setCardModal(false);
  };

  const openCreateChannel = () => {
    setEditChannel(null);
    setChannelForm({ title: '', description: '', logo: '', url: '', buttonText: '' });
    setChannelModal(true);
  };

  const openEditChannel = (channel: any) => {
    setEditChannel(channel);
    setChannelForm({ title: channel.title || '', description: channel.description || channel.desc || '', logo: channel.logo || '', url: channel.url || '', buttonText: channel.buttonText || '' });
    setChannelModal(true);
  };

  const handleSaveChannel = async () => {
    try {
      if (editChannel) {
        await api.patch('/contact-channels/' + editChannel.id, channelForm);
        toast('Canal actualizado', 'success');
      } else {
        await api.post('/contact-channels', channelForm);
        toast('Canal creado', 'success');
      }
      setChannelModal(false);
      load();
    } catch { toast('Error al guardar canal', 'error'); }
  };

  const handleDeleteChannel = async () => {
    if (!deleteChannelTarget) return;
    try {
      await api.delete('/contact-channels/' + deleteChannelTarget.id);
      toast('Canal eliminado', 'success');
      setDeleteChannelTarget(null);
      load();
    } catch { toast('Error al eliminar', 'error'); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#C8FF00]" />Pagina de Contacto</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configura todas las secciones de la pagina /contacto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seccion Hero */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Hero Principal</h3>
            <div className="flex items-center gap-2">
              <Toggle checked={watch('heroActive')} onChange={() => setValue('heroActive', !watch('heroActive'), { shouldDirty: true })} />
              <span className="text-xs text-gray-500">{watch('heroActive') ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          {watch('heroActive') ? (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Columna 1: Imagen */}
                <div className="lg:w-1/3 space-y-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen de Fondo del Hero</h4>
                  <ImageUpload
                    value={watch('heroImage') || ''}
                    onChange={(url: string) => setValue('heroImage', url, { shouldDirty: true })}
                    placeholder="URL o subir imagen de fondo"
                    width={300}
                    height={150}
                  />
                </div>

                {/* Divider vertical */}
                <div className="hidden lg:block w-px bg-gray-200 self-stretch" />

                {/* Columna 2: Campos de texto */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Chip</label>
                      <input {...register('chip')} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Titulo</label>
                      <input {...register('title')} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Descripcion</label>
                    <textarea {...register('description')} rows={4} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-400 italic">Seccion desactivada. Activala para editar su contenido.</p>
            </div>
          )}
        </div>

        {/* Cards de informacion de contacto */}
        {watch('heroActive') && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Informacion de Contacto</h3>
              <button type="button" onClick={openCreateCard}
                className="flex items-center justify-center gap-1 text-xs font-semibold px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] whitespace-nowrap">
                <Plus size={12} />Agregar Card
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {cardsArray.fields.map((field, i) => {
                const card = field as any;
                const IconComp = ICON_MAP[card.icon] || MessageCircle;
                return (
                  <div key={field.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: (card.bgColor || '#8A8A85') + '20' }}>
                          {createElement(IconComp, { size: 18, style: { color: card.bgColor || '#8A8A85' } })}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{card.title || 'Sin titulo'}</p>
                          <p className="text-xs text-gray-400">{card.desc || ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openEditCard(i)} className="p-1.5 text-[#C8FF00] hover:bg-[#C8FF00]/10 rounded-lg">
                          <Edit2 size={14} />
                        </button>
                        <button type="button" onClick={() => cardsArray.remove(i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {cardsArray.fields.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No hay cards. Agrega una con el boton superior.</p>
              )}
            </div>
          </div>
        )}

        {/* Seccion Canales de Contacto */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Canales de Contacto</h3>
              <p className="text-xs text-gray-400 mt-0.5">{channels.length} canales configurados</p>
            </div>
            <div className="flex items-center gap-3">
              <Toggle checked={watch('channelsActive')} onChange={() => setValue('channelsActive', !watch('channelsActive'), { shouldDirty: true })} />
              <button type="button" onClick={openCreateChannel}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg hover:bg-[#b8ef00] whitespace-nowrap">
                <Plus size={12} />Agregar Canal
              </button>
            </div>
          </div>
          {watch('channelsActive') && (
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {channels.map((channel) => (
                  <div key={channel.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#0f172a] flex items-center justify-center overflow-hidden">
                        {channel.logo ? (
                          <img src={channel.logo} alt={channel.title} className="w-full h-full object-cover" />
                        ) : (
                          <MessageCircle size={20} className="text-[#C8FF00]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{channel.title || 'Sin titulo'}</p>
                        <p className="text-xs text-gray-400 truncate">{channel.description || channel.desc || ''}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEditChannel(channel)} className="p-1.5 text-[#C8FF00] hover:bg-[#C8FF00]/10 rounded-lg">
                        <Edit2 size={14} />
                      </button>
                      <button type="button" onClick={() => setDeleteChannelTarget(channel)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seccion Beneficios */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Beneficios</h3>
              <p className="text-xs text-gray-400 mt-0.5">Se gestionan en la seccion Beneficios del Landing Page</p>
            </div>
            <div className="flex items-center gap-2">
              <Toggle checked={watch('benefitsActive')} onChange={() => setValue('benefitsActive', !watch('benefitsActive'), { shouldDirty: true })} />
              <span className="text-xs text-gray-500">{watch('benefitsActive') ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>

        {/* Seccion FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Preguntas Frecuentes (FAQ)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Se gestionan en la seccion FAQ del Landing Page</p>
            </div>
            <div className="flex items-center gap-2">
              <Toggle checked={watch('faqActive')} onChange={() => setValue('faqActive', !watch('faqActive'), { shouldDirty: true })} />
              <span className="text-xs text-gray-500">{watch('faqActive') ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
        </div>

        {/* Seccion Mapa */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Mapa</h3>
            <div className="flex items-center gap-2">
              <Toggle checked={watch('mapActive')} onChange={() => setValue('mapActive', !watch('mapActive'), { shouldDirty: true })} />
              <span className="text-xs text-gray-500">{watch('mapActive') ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          {watch('mapActive') ? (
            <div className="p-4 sm:p-6">
              <label className={labelClass}>URL del mapa de Google Maps (embed)</label>
              <input {...register('mapUrl')} className={inputClass} placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-gray-400 mt-1">Pega el link de "Compartir" {'>'} "Insertar un mapa" de Google Maps</p>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-400 italic">Seccion desactivada. Activala para editar su contenido.</p>
            </div>
          )}
        </div>

        {/* Seccion Newsletter */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Seccion Newsletter</h3>
            <div className="flex items-center gap-2">
              <Toggle checked={watch('newsletterActive')} onChange={() => setValue('newsletterActive', !watch('newsletterActive'), { shouldDirty: true })} />
              <span className="text-xs text-gray-500">{watch('newsletterActive') ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          {watch('newsletterActive') ? (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titulo</label>
                <input {...register('newsletterTitle')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Descripcion</label>
                <input {...register('newsletterText')} className={inputClass} />
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <p className="text-sm text-gray-400 italic">Seccion desactivada. Activala para editar su contenido.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors whitespace-nowrap">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* Modal para Card */}
      <Modal isOpen={cardModal} onClose={() => setCardModal(false)} title={editCardIndex !== null ? 'Editar Card' : 'Agregar Card'} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
            <input value={cardForm.title} onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })} className={inputClass} placeholder="WhatsApp" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
              <input value={cardForm.desc} onChange={(e) => setCardForm({ ...cardForm, desc: e.target.value })} className={inputClass} placeholder="La forma mas rapida." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Detalle</label>
              <input value={cardForm.detail} onChange={(e) => setCardForm({ ...cardForm, detail: e.target.value })} className={inputClass} placeholder="11 3181-3297" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Link (opcional)</label>
              <input value={cardForm.href} onChange={(e) => setCardForm({ ...cardForm, href: e.target.value })} className={inputClass} placeholder="https://wa.me/..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
              <input type="color" value={cardForm.bgColor} onChange={(e) => setCardForm({ ...cardForm, bgColor: e.target.value })} className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Icono</label>
            <select value={cardForm.icon} onChange={(e) => setCardForm({ ...cardForm, icon: e.target.value })} className={inputClass}>
              {ICON_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setCardModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button onClick={handleSaveCard} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold">Guardar</button>
          </div>
        </div>
      </Modal>

      {/* Modal para Canal */}
      <Modal isOpen={channelModal} onClose={() => setChannelModal(false)} title={editChannel ? 'Editar Canal' : 'Agregar Canal'} size="lg">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Columna 1: Imagen */}
            <div className="md:w-1/3 space-y-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo del Canal</h4>
              <ImageUpload 
                value={channelForm.logo} 
                onChange={(url) => setChannelForm({ ...channelForm, logo: url })} 
                placeholder="URL o subir logo" 
                width={200} 
                height={100} 
              />
            </div>

            {/* Divider vertical */}
            <div className="hidden md:block w-px bg-gray-200 self-stretch" />

            {/* Columna 2: Campos */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Titulo *</label>
                <input value={channelForm.title} onChange={(e) => setChannelForm({ ...channelForm, title: e.target.value })} className={inputClass} placeholder="WhatsApp" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
                <input value={channelForm.description} onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })} className={inputClass} placeholder="La forma mas rapida de contactarnos." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">URL *</label>
                <input value={channelForm.url} onChange={(e) => setChannelForm({ ...channelForm, url: e.target.value })} className={inputClass} placeholder="https://wa.me/..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Texto del boton</label>
                <input value={channelForm.buttonText} onChange={(e) => setChannelForm({ ...channelForm, buttonText: e.target.value })} className={inputClass} placeholder="Ir a WhatsApp" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={() => setChannelModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancelar</button>
            <button onClick={handleSaveChannel} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold">Guardar</button>
          </div>
        </div>
      </Modal>

      {/* ConfirmDialog para eliminar canal */}
      <ConfirmDialog 
        isOpen={!!deleteChannelTarget} 
        onClose={() => setDeleteChannelTarget(null)} 
        onConfirm={handleDeleteChannel} 
        title="Eliminar canal" 
        description={'Eliminar ' + (deleteChannelTarget?.title || '') + '?'} 
      />
    </div>
  );
}

