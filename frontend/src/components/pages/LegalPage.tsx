import { getSiteSection } from '@/lib/api';

export const dynamic = 'force-dynamic';

interface Props {
  sectionKey: string;
  fallbackTitle: string;
}

export default async function LegalPage({ sectionKey, fallbackTitle }: Props) {
  let title = fallbackTitle;
  let content = '';

  try {
    const data = await getSiteSection(sectionKey);
    if (data?.data) {
      title = data.data.title || title;
      content = data.data.content || '';
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#050606] py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-[#F7F6F7] mb-8">{title}</h1>
        <div className="prose prose-invert max-w-none">
          {content ? (
            <p className="text-[#C7C7C0] leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <p className="text-[#8A8A85] italic">Contenido no disponible. Proximamente.</p>
          )}
        </div>
      </div>
    </div>
  );
}
