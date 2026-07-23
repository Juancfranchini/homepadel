'use client';

import { useState, useEffect } from 'react';
import { Star, X, HelpCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface Props {
  productId: string;
}

interface ReviewStats {
  average: number;
  total: number;
  label: string;
  distribution: { stars: number; count: number; percentage: number }[];
}

function getLabel(avg: number): string {
  if (avg >= 4.5) return 'Excelente';
  if (avg >= 3.5) return 'Bueno';
  if (avg >= 2.5) return 'Regular';
  return 'Malo';
}

export default function OverallCustomerOpinions({ productId }: Props) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [infoTitle, setInfoTitle] = useState('{infoTitle}');
  const [infoText, setInfoText] = useState('');

  useEffect(() => {
    fetch(API_URL + '/reviews?productId=' + productId)
      .then((res) => res.json())
      .then((data) => {
        const reviews = Array.isArray(data) ? data.filter((r: any) => r.active !== false) : [];
        if (reviews.length === 0) { setStats(null); return; }
        const total = reviews.length;
        const avg = reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / total;
        const distribution = [5,4,3,2,1].map((stars) => {
          const count = reviews.filter((r: any) => r.rating === stars).length;
          return { stars, count, percentage: Math.round((count / total) * 100) };
        });
        setStats({ average: Math.round(avg * 10) / 10, total, label: getLabel(avg), distribution });
      })
      .catch(() => {});

    fetch(API_URL + '/site-sections/reviews_info?t=' + refreshKey)
      .then((r) => r.json())
      .then((d) => {
        const data = d?.data || d;
        setInfoTitle(data?.title || '{infoTitle}');
        setInfoText(data?.content || '');
      })
      .catch(() => {});
  }, [productId]);

  if (!stats) return null;

  return (
    <div className="bg-[#0C0C0C] rounded-xl border border-[#0D0F0F] p-5 h-full flex flex-col relative">
      <h3 className="text-sm font-semibold text-[#F7F6F7] mb-4">Opiniones de los clientes</h3>

      {/* Fila 2 columnas: promedio + estrellas/cantidad/label */}
      <div className="flex items-center gap-5 mb-4">
        <div className="flex-shrink-0">
          <p className="text-7xl font-black text-[#F7F6F7] leading-none text-center">{stats.average}</p>
        </div>
        <div className="flex flex-col justify-center">
          <div className="flex gap-0.5 mb-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={'w-5 h-5 ' + (s <= Math.round(stats.average) ? 'text-[#B7D31A] fill-[#B7D31A]' : 'text-[#1A1F21]')} />
            ))}
          </div>
          <p className="text-sm font-medium text-[#F7F6F7]">{stats.total} opiniones</p>
          <p className="text-xs font-semibold text-[#B7D31A]">{stats.label}</p>
        </div>
      </div>

      {/* Distribucion */}
      <div className="space-y-1.5 flex-1">
        {stats.distribution.map((d) => (
          <div key={d.stars} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-[#C7C7C0]">{d.stars}</span>
            <Star className="w-3 h-3 text-[#B7D31A] fill-[#B7D31A] flex-shrink-0" />
            <div className="flex-1 h-2 bg-[#1A1F21] rounded-full overflow-hidden">
              <div className="h-full bg-[#B7D31A] rounded-full" style={{ width: d.percentage + '%' }} />
            </div>
            <span className="w-8 text-right text-[#8A8A85]">{d.percentage}%</span>
          </div>
        ))}
      </div>

      {/* Footer - tirado al final */}
      <button onClick={() => { setRefreshKey(k => k + 1); setShowInfo(true); }} className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-[#B7D31A] hover:text-[#c8e81f] transition-colors w-fit ml-auto">
        <HelpCircle size={12} />
        {infoTitle}
      </button>

      {/* Modal info */}
      {showInfo && (
        <div className="absolute top-0 left-0 right-0 bottom-0 z-20 flex items-center justify-center bg-black/60 rounded-xl">
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl p-5 w-full h-full flex flex-col justify-center">
            
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#B7D31A]/10 flex items-center justify-center"><HelpCircle size={16} className="text-[#B7D31A]" /></div><h4 className="text-sm font-semibold text-[#F7F6F7]">{infoTitle}</h4></div><button onClick={() => setShowInfo(false)} className="text-[#8A8A85] hover:text-[#F7F6F7]"><X size={16} /></button></div>
            <p className="text-xs text-[#C7C7C0] leading-relaxed">
              {infoText || 'Las opiniones son realizadas por clientes verificados que compraron el producto. El promedio se calcula en base a todas las resenas aprobadas.'}
            </p>
            <div className="mt-auto pt-3 border-t border-[#0D0F0F] flex items-center gap-2 text-xs text-[#8A8A85] justify-end">
              <Star className="w-3 h-3 text-[#B7D31A] fill-[#B7D31A]" />
              <span>Resenas 100% verificadas</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
