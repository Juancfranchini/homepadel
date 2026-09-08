'use client';

import { Plus, Edit2, Trash2, Upload, ImageIcon } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Toggle from '../testimonios/components/Toggle';
import { useMarcas, getImageUrl, isBrandActive, Brand } from './useMarcas';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

function BrandsTable({ brands, onToggleActive, onEdit, onDelete }: { brands: Brand[]; onToggleActive: (b: Brand) => void; onEdit: (b: Brand) => void; onDelete: (b: Brand) => void }) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => {
              const imgSrc = getImageUrl(b.logo || b.logoUrl);
              return (
                <tr key={b.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {imgSrc ? <img src={imgSrc} alt={b.name} className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>}
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{b.name}</p></td>
                  <td className="px-4 py-3"><code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{b.slug}</code></td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">{b._count?.products ?? '-'}</td>
                  <td className="px-4 py-3 text-center"><Toggle checked={isBrandActive(b)} onChange={() => onToggleActive(b)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEdit(b)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(b)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
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

function BrandsCards({ brands, onToggleActive, onEdit, onDelete }: { brands: Brand[]; onToggleActive: (b: Brand) => void; onEdit: (b: Brand) => void; onDelete: (b: Brand) => void }) {
  return (
    <div className="md:hidden space-y-3">
      {brands.map((b) => {
        const imgSrc = getImageUrl(b.logo || b.logoUrl);
        return (
          <div key={b.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 bg-white">
                {imgSrc ? <img src={imgSrc} alt={b.name} className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <ImageIcon className="w-5 h-5 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{b.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{b._count?.products ?? 0} productos</p>
              </div>
              <div className="shrink-0">
                <Toggle checked={isBrandActive(b)} onChange={() => onToggleActive(b)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => onEdit(b)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(b)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BrandFormModal({ isOpen, editItem, previewUrl, register, errors, uploading, onUpload, isActive, setValue, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Brand | null; previewUrl: string | null; register: any; errors: any; uploading: boolean; onUpload: () => void;
  isActive: boolean; setValue: any; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar marca' : 'Nueva marca'} size="xl">
      <form onSubmit={onSubmit} className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 flex-1 min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="w-full md:w-[200px] flex-shrink-0 flex flex-col gap-3">
            <div className="w-full h-[180px] md:h-[200px] rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <div className="flex gap-2 w-full">
              <input
                {...register('logo')}
                className="flex-1 min-w-0 px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
                placeholder="URL del logo"
              />
              <button type="button" onClick={onUpload} disabled={uploading}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border border-[#C8FF00]/50 text-gray-600 hover:bg-gray-50 disabled:opacity-50 shrink-0">
                <Upload className="w-3 h-3" />{uploading ? '...' : 'Subir'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 leading-tight mt-1">Medida recomendada: 300x150px. Logo horizontal, fondo transparente.</p>
          </div>

          <div className="hidden md:block w-px bg-gray-200 self-stretch" />

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start">
            <div>
              <label className={labelClass}>Nombre *</label>
              <input {...register('name')} className={inputClass + ' mt-1'} placeholder="Ej: Bullpadel" />
              {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Sitio Web</label>
              <input {...register('url')} className={inputClass + ' mt-1'} placeholder="https://bullpadel.com" />
            </div>
            <div>
              <label className={labelClass}>Orden</label>
              <input type="number" min={0} {...register('order')} className={inputClass + ' mt-1'} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <div className="flex items-center gap-2 mt-1">
                <Toggle checked={isActive} onChange={() => setValue('isActive', !isActive, { shouldDirty: true })} />
                <span className={'text-xs font-medium ' + (isActive ? 'text-green-600' : 'text-gray-400')}>{isActive ? 'Activo' : 'Inactivo'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function MarcasPage() {
  const {
    form, brands, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    uploading, currentPage, setCurrentPage, totalPages, paginated, openCreate, openEdit, handleUpload,
    onSubmit, toggleActive, handleDelete,
  } = useMarcas();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const logoValue = watch('logo') || '';
  const previewUrl = getImageUrl(logoValue);
  const isActive = watch('isActive');

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marcas</h1>
          <p className="text-gray-500 text-sm mt-0.5">{brands.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center justify-center gap-2 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva marca</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron marcas</p></div>
      ) : (
        <div>
          <BrandsTable brands={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <BrandsCards brands={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      <BrandFormModal
        isOpen={modalOpen}
        editItem={editItem}
        previewUrl={previewUrl}
        register={register}
        errors={errors}
        uploading={uploading}
        onUpload={handleUpload}
        isActive={isActive}
        setValue={setValue}
        saving={saving}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit(onSubmit)}
      />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar marca" description={'Eliminar "' + (deleteTarget?.name || '') + '"? Los productos vinculados quedaran sin marca.'} isLoading={deleting} />
    </div>
  );
}
