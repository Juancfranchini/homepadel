export default function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-[#0C0C0C] border border-[#0D0F0F] rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-[#050606]" />
          <div className="p-4 space-y-2.5">
            <div className="h-2.5 bg-[#1A1F21] rounded w-1/3" />
            <div className="h-4 bg-[#1A1F21] rounded w-3/4" />
            <div className="h-5 bg-[#1A1F21] rounded w-1/2" />
            <div className="h-9 bg-[#1A1F21] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}