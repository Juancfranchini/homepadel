'use client';

import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import Toggle from '../testimonios/components/Toggle';
import { useCupones, Coupon } from './useCupones';

const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

function discountLabel(c: Coupon) { return c.type === 'PERCENTAGE' ? c.discount + '%' : '$' + c.discount.toLocaleString('es-AR'); }

function CouponsTable({ coupons, onToggleActive, onEdit, onDelete }: { coupons: Coupon[]; onToggleActive: (c: Coupon) => void; onEdit: (c: Coupon) => void; onDelete: (c: Coupon) => void }) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Código</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descuento</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usos</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
          </tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3"><code className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-900">{c.code}</code></td>
                <td className="px-4 py-3 text-center"><span className="text-sm font-semibold text-gray-900">{discountLabel(c)}</span></td>
                <td className="px-4 py-3 text-center text-sm text-gray-500 whitespace-nowrap">{c.usedCount}/{c.maxUses || ''}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Toggle checked={c.active} onChange={() => onToggleActive(c)} />
                    <span className={'text-xs font-medium ' + (c.active ? 'text-green-600' : 'text-gray-400')}>{c.active ? 'Activo' : 'Inactivo'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => onEdit(c)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(c)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponsCards({ coupons, onToggleActive, onEdit, onDelete }: { coupons: Coupon[]; onToggleActive: (c: Coupon) => void; onEdit: (c: Coupon) => void; onDelete: (c: Coupon) => void }) {
  return (
    <div className="md:hidden space-y-3">
      {coupons.map((c) => (
        <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <code className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-900">{c.code}</code>
              <p className="text-xs text-gray-500 mt-1.5">{discountLabel(c)}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{c.usedCount}/{c.maxUses || ''} usos</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Toggle checked={c.active} onChange={() => onToggleActive(c)} />
              <span className={'text-xs font-medium ' + (c.active ? 'text-green-600' : 'text-gray-400')}>{c.active ? 'Activo' : 'Inactivo'}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(c)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => onDelete(c)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CouponFormModal({ isOpen, editItem, register, errors, watchType, saving, onClose, onSubmit }: {
  isOpen: boolean; editItem: Coupon | null; register: any; errors: any; watchType: string; saving: boolean; onClose: () => void; onSubmit: (e?: React.BaseSyntheticEvent) => void;
}) {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editItem ? 'Editar cupon' : 'Nuevo cupon'} size="sm">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={labelClass}>Codigo *</label>
          <input {...register('code')} className={inputClass} placeholder="EJ: VERANO10" />
          {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Descuento * {watchType === 'PERCENTAGE' ? '(%)' : '($)'}</label>
            <input type="number" {...register('discount')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select {...register('type')} className={inputClass}>
              <option value="PERCENTAGE">Porcentaje (%)</option>
              <option value="FIXED">Fijo ($)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Monto minimo</label>
            <input type="number" {...register('minAmount')} className={inputClass} placeholder="Opcional" />
          </div>
          <div>
            <label className={labelClass}>Usos maximos</label>
            <input type="number" {...register('maxUses')} className={inputClass} placeholder="Ilimitado" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Fecha de expiracion</label>
          <input type="date" {...register('expiresAt')} className={inputClass} />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" {...register('active')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label className="text-sm text-gray-700">Cupon activo</label>
        </div>
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50">{saving ? 'Guardando...' : editItem ? 'Actualizar' : 'Crear'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function CuponesPage() {
  const {
    form, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget, deleting, saving,
    search, setSearch, currentPage, setCurrentPage, openCreate, openEdit, onSubmit, toggleActive, handleDelete,
    filtered, totalPages, paginated,
  } = useCupones();
  const { register, handleSubmit, watch, formState: { errors } } = form;
  const watchType = watch('type');

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
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
                placeholder="Buscar por codigo..."
                className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
              />
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo cupon</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron cupones</p></div>
      ) : (
        <>
          <CouponsTable coupons={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />
          <CouponsCards coupons={paginated} onToggleActive={toggleActive} onEdit={openEdit} onDelete={setDeleteTarget} />

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

      <CouponFormModal isOpen={modalOpen} editItem={editItem} register={register} errors={errors} watchType={watchType} saving={saving} onClose={() => setModalOpen(false)} onSubmit={handleSubmit(onSubmit)} />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Eliminar cupon" description={'Eliminar ' + (deleteTarget?.code || '') + '?'} isLoading={deleting} />
    </div>
  );
}