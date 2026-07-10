interface Feature {
  icon: string;
  title: string;
  subtitle: string;
}

interface Props {
  features: Feature[];
}

export default function FeaturesSection({ features }: Props) {
  if (!features || features.length === 0) return null;

  return (
    <section className="border-t border-[#0D0F0F] py-10 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">
          CARACTERISTICAS PRINCIPALES
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {features.map((f) => (
            <div key={f.title} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl p-4 flex flex-col items-center text-center gap-2 hover:border-[#B7D31A]/30 transition-colors">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-[#F7F6F7] font-semibold text-xs uppercase tracking-wide leading-snug">{f.title}</p>
              <p className="text-[#C7C7C0] text-[10px] leading-snug">{f.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}