interface Props {
  embedUrl: string | null;
  /** Shorts y TikTok son verticales y necesitan un marco alto, no uno 16:9. */
  vertical?: boolean;
}

export default function VideoSection({ embedUrl, vertical }: Props) {
  if (!embedUrl) return null;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-4">
        VIDEO DEL PRODUCTO
      </h2>

      {/* Un video vertical en un marco 16:9 se ve chico y con dos franjas
          negras a los costados. Se le da su propia proporción y se limita el
          ancho para que no ocupe media pantalla de alto. */}
      <div
        className={
          'flex-1 overflow-hidden rounded-2xl border border-[#0D0F0F] ' +
          (vertical ? 'aspect-[9/16] w-full max-w-[22rem]' : 'aspect-video')
        }
      >
        <iframe
          src={embedUrl}
          title="Video del producto"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
