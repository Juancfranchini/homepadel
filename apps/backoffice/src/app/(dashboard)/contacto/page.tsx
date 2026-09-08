'use client';

import { Save, FileText } from 'lucide-react';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { ConfirmDialog } from '@/components/ui/Modal';
import { useContacto } from './useContacto';
import HeroSection from './components/HeroSection';
import ContactCardsSection from './components/ContactCardsSection';
import ChannelsSection from './components/ChannelsSection';
import SimpleToggleSection from './components/SimpleToggleSection';
import MapSection from './components/MapSection';
import NewsletterSection from './components/NewsletterSection';
import CardFormModal from './components/CardFormModal';
import ChannelFormModal from './components/ChannelFormModal';

export default function ContactoPage() {
  const {
    form, loading, saving, channels, onSubmit,
    cardsArray, cardModal, setCardModal, editCardIndex, cardForm, setCardForm, openCreateCard, openEditCard, handleSaveCard,
    channelModal, setChannelModal, editChannel, deleteChannelTarget, setDeleteChannelTarget, channelForm, setChannelForm,
    openCreateChannel, openEditChannel, handleSaveChannel, handleDeleteChannel,
  } = useContacto();
  const { register, handleSubmit, watch, setValue } = form;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><FileText className="w-5 h-5 text-[#C8FF00]" />Pagina de Contacto</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configura todas las secciones de la pagina /contacto</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <HeroSection register={register} watch={watch} setValue={setValue} />

        <ContactCardsSection visible={watch('heroActive')} fields={cardsArray.fields} onAdd={openCreateCard} onEdit={openEditCard} onRemove={cardsArray.remove} />

        <ChannelsSection
          channels={channels}
          active={watch('channelsActive')}
          onToggleActive={() => setValue('channelsActive', !watch('channelsActive'), { shouldDirty: true })}
          onAdd={openCreateChannel}
          onEdit={openEditChannel}
          onDelete={setDeleteChannelTarget}
        />

        <SimpleToggleSection title="Beneficios" description="Se gestionan en la seccion Beneficios del Landing Page"
          active={watch('benefitsActive')} onToggle={() => setValue('benefitsActive', !watch('benefitsActive'), { shouldDirty: true })} />

        <SimpleToggleSection title="Preguntas Frecuentes (FAQ)" description="Se gestionan en la seccion FAQ del Landing Page"
          active={watch('faqActive')} onToggle={() => setValue('faqActive', !watch('faqActive'), { shouldDirty: true })} />

        <MapSection register={register} active={watch('mapActive')} onToggle={() => setValue('mapActive', !watch('mapActive'), { shouldDirty: true })} />

        <NewsletterSection register={register} active={watch('newsletterActive')} onToggle={() => setValue('newsletterActive', !watch('newsletterActive'), { shouldDirty: true })} />

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] disabled:opacity-50 transition-colors whitespace-nowrap">
            <Save className="w-4 h-4" />{saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <CardFormModal isOpen={cardModal} isEdit={editCardIndex !== null} cardForm={cardForm} setCardForm={setCardForm} onClose={() => setCardModal(false)} onSave={handleSaveCard} />

      <ChannelFormModal isOpen={channelModal} isEdit={!!editChannel} channelForm={channelForm} setChannelForm={setChannelForm} onClose={() => setChannelModal(false)} onSave={handleSaveChannel} />

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
