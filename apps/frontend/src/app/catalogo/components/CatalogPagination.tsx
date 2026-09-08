interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function CatalogPagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-[#0D0F0F] text-[#F7F6F7] text-sm font-medium disabled:opacity-30 hover:border-[#B7D31A] transition-colors">
        Anterior
      </button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={'w-9 h-9 rounded-lg text-sm font-medium transition-colors ' + (i + 1 === currentPage ? 'bg-[#B7D31A] text-[#050606]' : 'border border-[#0D0F0F] text-[#C7C7C0] hover:border-[#B7D31A]')}>
          {i + 1}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-[#0D0F0F] text-[#F7F6F7] text-sm font-medium disabled:opacity-30 hover:border-[#B7D31A] transition-colors">
        Siguiente
      </button>
    </div>
  );
}