import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export const CARD_DEFAULT = { icon: 'MessageCircle', bgColor: '#8A8A85', title: '', desc: '', detail: '', href: '' };
export const CHANNEL_DEFAULT = { title: '', description: '', logo: '', url: '', buttonText: '' };

function useContactoData() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<any[]>([]);
  const form = useForm<any>({ resolver: zodResolver(z.object({}).passthrough()) });
  const { reset } = form;

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
    } catch { toast('No se pudo cargar la información de contacto', 'error'); } finally { setLoading(false); }
  }, [reset, toast]);

  useEffect(() => { load(); }, [load]);

  return { form, loading, channels, load };
}

function useCardModal(form: ReturnType<typeof useForm<any>>) {
  const { toast } = useToast();
  const { control, setValue } = form;
  const cardsArray = useFieldArray({ control, name: 'cards' });
  const [cardModal, setCardModal] = useState(false);
  const [editCardIndex, setEditCardIndex] = useState<number | null>(null);
  const [cardForm, setCardForm] = useState(CARD_DEFAULT);

  const openCreateCard = () => { setEditCardIndex(null); setCardForm(CARD_DEFAULT); setCardModal(true); };

  const openEditCard = (index: number) => {
    const card = cardsArray.fields[index] as any;
    setEditCardIndex(index);
    setCardForm({ icon: card.icon || 'MessageCircle', bgColor: card.bgColor || '#8A8A85', title: card.title || '', desc: card.desc || '', detail: card.detail || '', href: card.href || '' });
    setCardModal(true);
  };

  const handleSaveCard = () => {
    if (!cardForm.title.trim()) { toast('El titulo es requerido', 'error'); return; }
    if (editCardIndex !== null) setValue('cards.' + editCardIndex, cardForm, { shouldDirty: true });
    else cardsArray.append(cardForm);
    setCardModal(false);
  };

  return { cardsArray, cardModal, setCardModal, editCardIndex, cardForm, setCardForm, openCreateCard, openEditCard, handleSaveCard };
}

function useChannelModal(load: () => Promise<void>) {
  const { toast } = useToast();
  const [channelModal, setChannelModal] = useState(false);
  const [editChannel, setEditChannel] = useState<any>(null);
  const [deleteChannelTarget, setDeleteChannelTarget] = useState<any>(null);
  const [channelForm, setChannelForm] = useState(CHANNEL_DEFAULT);

  const openCreateChannel = () => { setEditChannel(null); setChannelForm(CHANNEL_DEFAULT); setChannelModal(true); };

  const openEditChannel = (channel: any) => {
    setEditChannel(channel);
    setChannelForm({ title: channel.title || '', description: channel.description || channel.desc || '', logo: channel.logo || '', url: channel.url || '', buttonText: channel.buttonText || '' });
    setChannelModal(true);
  };

  const handleSaveChannel = async () => {
    try {
      if (editChannel) { await api.patch('/contact-channels/' + editChannel.id, channelForm); toast('Canal actualizado', 'success'); }
      else { await api.post('/contact-channels', channelForm); toast('Canal creado', 'success'); }
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

  return { channelModal, setChannelModal, editChannel, deleteChannelTarget, setDeleteChannelTarget, channelForm, setChannelForm, openCreateChannel, openEditChannel, handleSaveChannel, handleDeleteChannel };
}

export function useContacto() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const { form, loading, channels, load } = useContactoData();
  const cardModalState = useCardModal(form);
  const channelModalState = useChannelModal(load);

  const onSubmit = async (data: any) => {
    setSaving(true);
    try {
      const payload = { ...data, cards: data.cards.map((card: any) => ({ ...card, bgColor: card.bgColor || '#8A8A85' })) };
      await api.put('/site-sections/contacto', { data: payload, active: true });
      toast('Contacto guardado', 'success');
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  return { form, loading, saving, channels, onSubmit, ...cardModalState, ...channelModalState };
}
