export default function PricePreviewCard({ watch }: { watch: any }) {
  const price = watch('price');
  if (!(price > 0)) return null;

  const basePrice = Number(price);
  const saleVal = Number(watch('salePrice') ?? 0);
  const transferVal = Number(watch('transferPrice') ?? 0);
  const hasOffer = saleVal > 0 && saleVal < basePrice;
  const activePrice = hasOffer ? saleVal : basePrice;
  const transferShow = transferVal > 0 ? transferVal : Math.ceil(activePrice * 0.8);

  return (
    <div className="bg-[#0f172a] rounded-xl p-5 text-white">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide mb-3">Preview de precios</p>
      {hasOffer ? (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-2xl font-black text-[#C8FF00]">${saleVal.toLocaleString('es-AR')}</p>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-bold">
              -{Math.round((1 - saleVal / basePrice) * 100)}% OFF
            </span>
          </div>
          <p className="text-sm text-slate-400 line-through">${basePrice.toLocaleString('es-AR')}</p>
        </>
      ) : (
        <p className="text-2xl font-black text-white">${basePrice.toLocaleString('es-AR')}</p>
      )}
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between text-slate-300">
          <span>💳 Con transferencia{transferVal > 0 ? ' ✓' : ' (auto)'}</span>
          <span className="text-[#C8FF00] font-bold">${transferShow.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span>📦 9 cuotas s/interés</span>
          <span className="text-[#C8FF00] font-bold">${Math.ceil(activePrice / 9).toLocaleString('es-AR')}/mes</span>
        </div>
      </div>
    </div>
  );
}
