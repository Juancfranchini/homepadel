import { Check } from 'lucide-react';

interface Props {
  highlights: string[];
  highlightsTitle?: string;
  highlightsDescription?: string;
}

/**
 * "Por qué elegir este producto".
 *
 * Cuando el checklist venía vacío se mostraban cuatro viñetas inventadas
 * —"Materiales de alta calidad...", "Tecnología avanzada de absorción de
 * impactos..."— iguales para todos los productos, afirmando cosas que nadie
 * había cargado. Si no hay checklist ahora no se muestra lista, y se ve el
 * título y la descripción que sí se escribieron.
 */
export default function HighlightsSection({ highlights, highlightsTitle, highlightsDescription }: Props) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-3">
        {highlightsTitle || 'POR QUE ELEGIR ESTE PRODUCTO'}
      </h2>

      {highlightsDescription && (
        <p className="text-[#C7C7C0] text-sm leading-relaxed mb-4">{highlightsDescription}</p>
      )}

      {highlights.length > 0 && (
        <ul className="space-y-3">
          {highlights.map((text, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#B7D31A] border border-[#B7D31A] flex items-center justify-center flex-none mt-0.5">
                <Check size={10} className="text-[#050606]" />
              </span>
              <span className="text-[#C7C7C0] text-sm leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
