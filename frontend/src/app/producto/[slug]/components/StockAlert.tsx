interface Props {
  stock: number;
}

export default function StockAlert({ stock }: Props) {
  if (stock === 0) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-2 rounded-lg w-fit">
        SIN STOCK
      </div>
    );
  }
  if (stock <= 5) {
    return (
      <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold px-3 py-2 rounded-lg w-fit">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse flex-none" />
        ULTIMAS {stock} UNIDADES!
      </div>
    );
  }
  return null;
}