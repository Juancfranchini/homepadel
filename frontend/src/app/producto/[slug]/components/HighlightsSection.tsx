import { Check } from 'lucide-react';
import RelatedVideos from './RelatedVideos';

interface RelatedVideo { title: string; url: string; }

interface Props {
  highlights: string[];
  highlightsTitle?: string;
  highlightsDescription?: string;
  relatedVideos?: RelatedVideo[];
}

const PLACEHOLDER_HIGHLIGHTS = [
  'Materiales de alta calidad que garantizan durabilidad y rendimiento superior',
  'Tecnologia avanzada de absorcion de impactos para mayor confort',
  'Diseno aerodinamico que mejora la velocidad de juego',
  'Balance perfecto entre control y potencia para jugadores exigentes',
];

export default function HighlightsSection({ highlights, highlightsTitle, highlightsDescription, relatedVideos }: Props) {
  const items = highlights && highlights.length > 0 ? highlights : PLACEHOLDER_HIGHLIGHTS;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-3">
        {highlightsTitle || 'POR QUE ELEGIR ESTE PRODUCTO'}
      </h2>
      {highlightsDescription && (
        <p className="text-[#C7C7C0] text-sm leading-relaxed mb-4">{highlightsDescription}</p>
      )}
      <ul className="space-y-3">
        {items.map((text, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-[#B7D31A] border border-[#B7D31A] flex items-center justify-center flex-none mt-0.5">
              <Check size={10} className="text-[#050606]" />
            </span>
            <span className="text-[#C7C7C0] text-sm leading-relaxed">{text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-4">
        <RelatedVideos videos={relatedVideos || []} />
      </div>
    </div>
  );
}
