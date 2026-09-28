export default function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-panel border border-line rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-page" />
          <div className="p-4 space-y-2.5">
            <div className="h-2.5 bg-chip rounded w-1/3" />
            <div className="h-4 bg-chip rounded w-3/4" />
            <div className="h-5 bg-chip rounded w-1/2" />
            <div className="h-9 bg-chip rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}