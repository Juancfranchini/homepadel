'use client';

import { Plus, Edit2, Trash2, ImageIcon, Search } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Toggle from '../testimonios/components/Toggle';
import ImageUpload, { getImageUrl } from '@/components/ui/ImageUpload';
import { useHero, HeroSlide } from './useHero';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

function SlidesTable({ slides, onToggleActive, onEdit, onDelete }: { slides: HeroSlide[]; onToggleActive: (s: HeroSlide) => void; onEdit: (s: HeroSlide) => void; onDelete: (s: HeroSlide) => void }) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Titulo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtitulo</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {slides.map((s) => {
              const imgSrc = getImageUrl(s.image);
              return (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-center text-sm font-bold text-gray-400">{s.order}</td>
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img src={imgSrc} alt={s.title} className="w-24 h-12 object-cover rounded border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-24 h-12 rounded bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-300" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm whitespace-nowrap">{s.title}</p></td>
                  <td className="px-4 py-3"><p className="text-gray-500 text-sm truncate max-w-xs">{s.subtitle || '-'}</p></td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={s.active} onChange={() => onToggleActive(s)} />
                      <span className={'text-xs font-medium ' + (s.active ? 'text-green-600' : 'text-gray-400')}>{s.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(s)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(s)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SlideCard({ slide, onToggleActive, onEdit, onDelete }: { slide: HeroSlide; onToggleActive: (s: HeroSlide) => void; onEdit: (s: HeroSlide) => void; onDelete: (s: HeroSlide) => void }) {
  const imgSrc = getImageUrl(slide.image);
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div className="flex gap-3">
        {imgSrc ? (
          <img src={imgSrc} alt={slide.title} className="w-24 h-14 rounded-lg bg-gray-100 object-cover border border-gray-200 shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-24 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageIcon className="w-5 h-5 text-gray-400" /></div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{slide.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">#{slide.order}</p>
        </div>
        <div className="shrink-0">
          <Toggle checked={slide.active} onChange={() => onToggleActive(slide)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <p className="text-xs text-gray-400">Subtitulo</p>
          <p className="font-medium text-gray-900">{slide.subtitle || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Imagen Mobile</p>
          {slide.imageMobile ? <p className="text-xs text-green-600 font-medium">Configurada</p> : <p className="text-gray-400">-</p>}
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Descripcion</p>
          <p className="font-medium text-gray-900">{slide.description || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">CTA Principal</p>
          <p className="font-medium text-gray-900">{slide.ctaPrimary || '-'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">CTA Secundario</p>
          <p className="font-medium text-gray-900">{slide.ctaSecondary || '-'}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-gray-400">Estado</p>
          <p className={'font-medium ' + (slide.active ? 'text-green-600' : 'text-gray-400')}>{slide.active ? 'Activo' : 'Inactivo'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className={'text-xs font-medium ' + (slide.active ? 'text-green-600' : 'text-gray-400')}>{slide.active ? 'Activo' : 'Inactivo'}</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(slide)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => onDelete(slide)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}

function SlideFormModal({ isOpen, editItem, isMobile, imageDesktop, imageMobile, isActive, register, errors, setValue, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: HeroSlide | null; isMobile: boolean; imageDesktop: string; imageMobile: string; isActive: boolean;
  register: any; errors: any; setValue: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar slide' : 'Nuevo slide'} size="xl">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-4 md:gap-0">
        <div className="md:flex-shrink-0 flex flex-col gap-4 md:pr-4" style={{ width: isMobile ? '100%' : 200 }}>
          <div>
            <p className={labelClass + ' mb-2'}>Desktop</p>
            <ImageUpload value={imageDesktop} onChange={(url) => setValue('image', url, { shouldDirty: true })} placeholder="URL desktop" width={isMobile ? 140 : 200} height={80} />
          </div>
          <div>
            <p className={labelClass + ' mb-2'}>Mobile</p>
            <ImageUpload value={imageMobile} suggestion="Medida recomendada: 768x1024px (mobile)" onChange={(url) => setValue('imageMobile', url, { shouldDirty: true })} placeholder="URL mobile" width={isMobile ? 140 : 200} height={80} />
          </div>
        </div>

        <div className="hidden md:block mx-6 w-px bg-gray-200 self-stretch my-2" />

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
          <div className="sm:col-span-2">
            <label className={labelClass}>Titulo *</label>
            <input {...register('title')} className={inputClass + ' mt-1'} placeholder="NUEVA COLECCION 2026" />
            {errors.title && <p className="text-xs text-red-600 mt-0.5">{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Subtitulo (chip verde)</label>
            <input {...register('subtitle')} className={inputClass + ' mt-1'} placeholder="Nueva Temporada" />
          </div>
          <div>
            <label className={labelClass}>Orden</label>
            <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripcion</label>
            <textarea {...register('description')} rows={2} className={inputClass + ' mt-1'} placeholder="Texto descriptivo bajo el titulo..." />
          </div>
          <div>
            <label className={labelClass}>CTA Principal - Texto</label>
            <input {...register('ctaPrimary')} className={inputClass + ' mt-1'} placeholder="VER COLECCION" />
          </div>
          <div>
            <label className={labelClass}>CTA Principal - URL</label>
            <input {...register('ctaPrimaryUrl')} className={inputClass + ' mt-1'} placeholder="/catalogo" />
          </div>
          <div>
            <label className={labelClass}>CTA Secundario - Texto</label>
            <input {...register('ctaSecondary')} className={inputClass + ' mt-1'} placeholder="VER OFERTAS" />
          </div>
          <div>
            <label className={labelClass}>CTA Secundario - URL</label>
            <input {...register('ctaSecondaryUrl')} className={inputClass + ' mt-1'} placeholder="/catalogo?oferta=1" />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <div className="flex items-center gap-2 mt-1">
              <Toggle checked={isActive} onChange={() => setValue('active', !isActive, { shouldDirty: true })} />
              <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
            </div>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function HeroPage() {
  const {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, isMobile, openCreate, openEdit, onSubmit, toggleActive,
    handleDelete, filtered, totalPages, paginated,
  } = useHero();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const imageDesktop = watch('image') || '';
  const imageMobile = watch('imageMobile') || '';
  const isActive = watch('active');

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 text-sm">{filtered.length} registros</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar slides..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              />
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo slide</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron slides</p></div>
      ) : (
        <>
          <SlidesTable slides={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <div className="md:hidden space-y-3">
            {paginated.map((s) => (
              <SlideCard key={s.id} slide={s} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))}
          </div>

          {/* Paginacion */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}

      <SlideFormModal
        isOpen={modalOpen}
        editItem={editItem}
        isMobile={isMobile}
        imageDesktop={imageDesktop}
        imageMobile={imageMobile}
        isActive={isActive}
        register={register}
        errors={errors}
        setValue={setValue}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit(onSubmit)}
      />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar slide" description={'Eliminar el slide "' + (deleteTarget?.title || '') + '"?'} isLoading={deleting} />
    </div>
  );
}