interface Props {
  hasFilters: boolean;
  onClear: () => void;
}

export default function CatalogEmpty({ hasFilters, onClear }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl mb-4">&#127992;</p>
      <p className="text-[#F7F6F7] font-semibold text-lg mb-1">Sin resultados</p>
      <p className="text-[#C7C7C0] text-sm mb-6">
        {hasFilters ? 'Proba con otros filtros o amplia la busqueda.' : 'No hay productos disponibles por el momento.'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl text-sm font-semibold btn-primary-glow">
          Ver todos los productos
        </button>
      )}
    </div>
  );
}