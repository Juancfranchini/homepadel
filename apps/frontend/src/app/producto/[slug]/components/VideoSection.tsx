interface Props {
  embedUrl: string | null;
}

export default function VideoSection({ embedUrl }: Props) {
  if (!embedUrl) return null;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-4">
        VIDEO DEL PRODUCTO
      </h2>
      <div className="flex-1 aspect-video rounded-2xl overflow-hidden border border-[#0D0F0F]">
        <iframe src={embedUrl} title="Video del producto" className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    </div>
  );
}