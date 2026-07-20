'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface CompareField {
  label: string;
  type: 'stars' | 'text';
}

interface CompareProduct {
  name: string;
  image?: string;
  values: (number | string)[];
}

interface CompareData {
  fields: CompareField[];
  products: CompareProduct[];
}

interface Props {
  data: CompareData | null;
}

function StarRating({ value }: { value: number }) {
  const fullStars = Math.floor(value);
  const hasHalf = value % 1 >= 0.5;
  return (
    <div className="flex gap-0.5 justify-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14}
          fill={i < fullStars ? '#B7D31A' : (hasHalf && i === fullStars ? '#B7D31A' : 'none')}
          stroke={i < fullStars ? '#B7D31A' : (hasHalf && i === fullStars ? '#B7D31A' : '#8A8A85')}
        />
      ))}
    </div>
  );
}

export default function CompareModels({ data }: Props) {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  if (!data || !data.fields || data.fields.length === 0 || !data.products || data.products.length < 2) return null;

  // Filtrar productos que tengan al menos un valor con estrellas > 0 o texto no vacio
  const validProducts = data.products.filter((p) => p.name && p.values.some((v) => v !== 0 && v !== ''));
  if (validProducts.length < 2) return null;

  // Filtrar campos que tengan al menos un valor con estrellas > 0
  const validFields = data.fields.filter((f, fi) => {
    return validProducts.some((p) => {
      const v = p.values[fi];
      return f.type === 'stars' ? (typeof v === 'number' && v > 0) : (typeof v === 'string' && v.trim() !== '');
    });
  });
  if (validFields.length === 0) return null;

  return (
    <section className="border-t border-[#0D0F0F] py-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">
          COMPARA CON OTROS MODELOS
        </h2>

        <div className="overflow-x-auto border border-[#B7D31A]/30 rounded-xl">
          <table className="w-full min-w-[600px] bg-[#0C0C0C]">
            <thead>
              <tr className="border-b border-[#B7D31A]/30">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#8A8A85] border-r border-[#B7D31A]/30">
                  Caracteristicas
                </th>
                {validProducts.map((prod, i) => (
                  <th key={i}
                    className={'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors border-x border-[#B7D31A]/30 ' +
                      (hoveredCol === i ? 'text-[#B7D31A] bg-[#242A05]' : 'text-[#F7F6F7]')}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}>
                    {prod.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {validFields.map((field, fi) => {
                const originalIndex = data.fields.indexOf(field);
                return (
                  <tr key={fi} className="border-b border-[#B7D31A]/30">
                    <td className="px-4 py-3 text-left text-[#C7C7C0] text-xs font-medium border-r border-[#B7D31A]/30">{field.label}</td>
                    {validProducts.map((prod, pi) => {
                      const val = prod.values[originalIndex];
                      return (
                        <td key={pi}
                          className={'px-4 py-3 text-center transition-colors border-x border-[#B7D31A]/30 ' +
                            (hoveredCol === pi ? 'bg-[#242A05]' : '')}
                          onMouseEnter={() => setHoveredCol(pi)}
                          onMouseLeave={() => setHoveredCol(null)}>
                          {field.type === 'stars' ? (
                            <StarRating value={typeof val === 'number' ? val : 0} />
                          ) : (
                            <span className="text-sm text-[#C7C7C0]">{typeof val === 'string' ? val : '-'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
