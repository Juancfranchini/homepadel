interface Props {
  mapUrl: string;
}

export default function MapSection({ mapUrl }: Props) {
  if (!mapUrl) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
      <div className="rounded-2xl overflow-hidden border border-[#0D0F0F] shadow-lg">
        <iframe src={mapUrl} width="100%" height="350" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="w-full block" />
      </div>
    </section>
  );
}