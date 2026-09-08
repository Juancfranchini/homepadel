export default function StatusSidebar({ register }: { register: any }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900">Estado y visibilidad</h3>

      <div className="flex items-center justify-between py-2 border-b border-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-900">Activo</p>
          <p className="text-xs text-gray-500">Visible en la tienda</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register('active')} className="sr-only peer" />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8FF00]" />
        </label>
      </div>

      <div className="flex items-center justify-between py-2 border-b border-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-900">Destacado</p>
          <p className="text-xs text-gray-500">Aparece en Home</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" {...register('featured')} className="sr-only peer" />
          <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C8FF00]" />
        </label>
      </div>

      <div className="space-y-2 pt-1">
        <p className="text-sm font-medium text-gray-700 mb-2">Etiquetas</p>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isNew" {...register('isNew')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="isNew" className="text-sm text-gray-700 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold">NUEVO</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isOffer" {...register('isOffer')} className="w-4 h-4 rounded accent-[#C8FF00]" />
          <label htmlFor="isOffer" className="text-sm text-gray-700 flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold">OFERTA</span>
          </label>
        </div>
      </div>
    </div>
  );
}
