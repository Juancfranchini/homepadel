'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

const BRANDS = ['Bullpadel', 'NOX', 'Siux', 'Black Crown'];

const PARAMETERS = [
  { label: 'Control', stars: [4, 4.5, 3.5, 4] },
  { label: 'Potencia', stars: [3.5, 4, 4.5, 3.5] },
  { label: 'Salida de bola', stars: [4, 3.5, 4, 4.5] },
  { label: 'Manejabilidad', stars: [4.5, 4, 3.5, 4] },
];

const LEVELS = ['Avanzado', 'Intermedio', 'Avanzado', 'Iniciante'];
const BALANCES = ['Medio', 'Alto', 'Bajo', 'Medio'];

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

export default function CompareModels() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

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
                {BRANDS.map((brand, i) => (
                  <th key={i}
                    className={'px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider transition-colors border-x border-[#B7D31A]/30 ' +
                      (hoveredCol === i ? 'text-[#B7D31A] bg-[#242A05]' : 'text-[#F7F6F7]')}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}>
                    {brand}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARAMETERS.map((param, rowIdx) => (
                <tr key={rowIdx} className="border-b border-[#B7D31A]/30">
                  <td className="px-4 py-3 text-left text-[#C7C7C0] text-xs font-medium border-r border-[#B7D31A]/30">
                    {param.label}
                  </td>
                  {param.stars.map((star, colIdx) => (
                    <td key={colIdx}
                      className={'px-4 py-3 text-center transition-colors border-x border-[#B7D31A]/30 ' +
                        (hoveredCol === colIdx ? 'bg-[#242A05]' : '')}
                      onMouseEnter={() => setHoveredCol(colIdx)}
                      onMouseLeave={() => setHoveredCol(null)}>
                      <StarRating value={star} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-b border-[#B7D31A]/30">
                <td className="px-4 py-3 text-left text-[#C7C7C0] text-xs font-medium border-r border-[#B7D31A]/30">Balance</td>
                {BALANCES.map((b, colIdx) => (
                  <td key={colIdx}
                    className={'px-4 py-3 text-center text-sm transition-colors border-x border-[#B7D31A]/30 ' +
                      (hoveredCol === colIdx ? 'text-[#B7D31A] bg-[#242A05]' : 'text-[#C7C7C0]')}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}>
                    {b}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-3 text-left text-[#C7C7C0] text-xs font-medium border-r border-[#B7D31A]/30">Nivel del jugador</td>
                {LEVELS.map((l, colIdx) => (
                  <td key={colIdx}
                    className={'px-4 py-3 text-center text-sm transition-colors border-x border-[#B7D31A]/30 ' +
                      (hoveredCol === colIdx ? 'text-[#B7D31A] bg-[#242A05]' : 'text-[#C7C7C0]')}
                    onMouseEnter={() => setHoveredCol(colIdx)}
                    onMouseLeave={() => setHoveredCol(null)}>
                    {l}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}