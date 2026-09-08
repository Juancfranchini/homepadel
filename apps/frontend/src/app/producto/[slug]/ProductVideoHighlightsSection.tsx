import VideoSection from './components/VideoSection';
import HighlightsSection from './components/HighlightsSection';
import RelatedVideos from './components/RelatedVideos';

interface Props {
  showVideo: boolean;
  showHighlights: boolean;
  embedUrl: string | null;
  relatedVideos: any[];
  highlights: string[];
  highlightsTitle: string;
  highlightsDescription: string;
}

export default function ProductVideoHighlightsSection({ showVideo, showHighlights, embedUrl, relatedVideos, highlights, highlightsTitle, highlightsDescription }: Props) {
  if (showVideo && showHighlights && (embedUrl || relatedVideos.length > 0) && highlights.length > 0) {
    return (
      <section className="border-t border-[#0D0F0F] py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <VideoSection embedUrl={embedUrl} />
            <div className="flex flex-col h-full">
              <HighlightsSection highlights={highlights} highlightsTitle={highlightsTitle} highlightsDescription={highlightsDescription} />
              {relatedVideos.length > 0 && (
                <div className="mt-auto">
                  <h3 className="text-lg font-semibold uppercase tracking-tight text-[#F7F6F7] mb-2">Videos Relacionados</h3>
                  <RelatedVideos videos={relatedVideos} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (showVideo && (embedUrl || relatedVideos.length > 0)) {
    return (
      <section className="border-t border-[#0D0F0F] py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {embedUrl && relatedVideos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <VideoSection embedUrl={embedUrl} />
              <div className="flex flex-col h-full">
                <h3 className="text-lg font-semibold uppercase tracking-tight text-[#F7F6F7] mb-2">Videos Relacionados</h3>
                <div className="flex-1">
                  <RelatedVideos videos={relatedVideos} />
                </div>
              </div>
            </div>
          ) : embedUrl ? (
            <VideoSection embedUrl={embedUrl} />
          ) : (
            <div>
              <h3 className="text-lg font-semibold uppercase tracking-tight text-[#F7F6F7] mb-2">Videos Relacionados</h3>
              <RelatedVideos videos={relatedVideos} />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!showVideo && showHighlights && highlights.length > 0) {
    return (
      <section className="border-t border-[#0D0F0F] py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <HighlightsSection highlights={highlights} highlightsTitle={highlightsTitle} highlightsDescription={highlightsDescription} />
        </div>
      </section>
    );
  }

  return null;
}
