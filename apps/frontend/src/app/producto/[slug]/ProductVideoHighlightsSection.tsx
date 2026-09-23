import VideoSection from './components/VideoSection';
import HighlightsSection from './components/HighlightsSection';
import RelatedVideos from './components/RelatedVideos';

interface Props {
  showVideo: boolean;
  showHighlights: boolean;
  embedUrl: string | null;
  embedVertical: boolean;
  relatedVideos: { title: string; url: string }[];
  highlights: string[];
  highlightsTitle: string;
  highlightsDescription: string;
}

/**
 * Video y "por qué elegir este producto", uno al lado del otro cuando hay
 * ambos.
 *
 * La condición para mostrar los highlights exigía que hubiera ítems de
 * checklist. Cargar solo el título y la descripción en el backoffice —que es
 * lo que hace la mayoría— no mostraba nada, y la sección figuraba como
 * activada. Ahora alcanza con que haya cualquiera de los tres.
 */
export default function ProductVideoHighlightsSection({
  showVideo, showHighlights, embedUrl, embedVertical, relatedVideos, highlights, highlightsTitle, highlightsDescription,
}: Props) {
  const hayVideo = showVideo && !!embedUrl;
  const hayRelacionados = showVideo && relatedVideos.length > 0;
  const hayHighlights =
    showHighlights && (highlights.length > 0 || !!highlightsTitle.trim() || !!highlightsDescription.trim());

  if (!hayVideo && !hayRelacionados && !hayHighlights) return null;

  const columnaDerecha = hayHighlights || hayRelacionados;
  const dosColumnas = hayVideo && columnaDerecha;

  return (
    <section className="border-t border-[#0D0F0F] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className={dosColumnas ? 'grid grid-cols-1 lg:grid-cols-2 gap-10' : ''}>
          {hayVideo && <VideoSection embedUrl={embedUrl} vertical={embedVertical} />}

          {columnaDerecha && (
            <div className="flex flex-col h-full">
              {hayHighlights && (
                <HighlightsSection
                  highlights={highlights}
                  highlightsTitle={highlightsTitle}
                  highlightsDescription={highlightsDescription}
                />
              )}
              {hayRelacionados && (
                <div className={hayHighlights ? 'mt-auto pt-6' : ''}>
                  <h3 className="text-lg font-semibold uppercase tracking-tight text-[#F7F6F7] mb-2">Videos Relacionados</h3>
                  <RelatedVideos videos={relatedVideos} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
