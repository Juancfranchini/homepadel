'use client';

import { useState, useEffect } from 'react';

interface Section {
  title: string;
  content: string;
}

interface Props {
  sectionKey: string;
  fallbackTitle: string;
}

function cleanContent(html: string): string {
  const cleaned = html
    .replace(/<pre><code>/g, '')
    .replace(/<\/code><\/pre>/g, '')
    .replace(/<pre>/g, '<div>')
    .replace(/<\/pre>/g, '</div>')
    .replace(/<code>/g, '<span>')
    .replace(/<\/code>/g, '</span>');
  const txt = document.createElement('textarea');
  txt.innerHTML = cleaned;
  let decoded = txt.value;
  if (decoded.includes('&')) {
    txt.innerHTML = decoded;
    decoded = txt.value;
  }
  return decoded;
}

function isHtml(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

export default function LegalPage({ sectionKey, fallbackTitle }: Props) {
  const [title, setTitle] = useState(fallbackTitle);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(apiUrl + '/site-sections/' + sectionKey)
      .then(r => r.json())
      .then(data => {
        const d = data?.data || data || {};
        setTitle(d.title || fallbackTitle);
        const secs = d.sections;
        if (secs && secs.length > 0) {
          setSections(secs);
        } else if (d.content) {
          setSections([{ title: d.title || fallbackTitle, content: d.content }]);
        } else {
          setSections([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sectionKey, fallbackTitle]);

  return (
    <div className="min-h-screen bg-page py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-fg/[0.06] rounded w-1/3" />
            <div className="h-4 bg-fg/[0.06] rounded w-full" />
            <div className="h-4 bg-fg/[0.06] rounded w-2/3" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-fg mb-10">{title}</h1>
            
            {sections.length === 0 ? (
              <p className="text-fg-muted italic">Contenido no disponible. Proximamente.</p>
            ) : (
              <div className="space-y-12">
                {sections.map((section, i) => {
                  const cleaned = cleanContent(section.content);
                  const html = isHtml(cleaned);
                  return (
                    <div key={i}>
                      {section.title && section.title !== title && (
                        <h2 className="text-xl font-semibold text-fg mb-4">{section.title}</h2>
                      )}
                      <div className="prose prose-invert max-w-none">
                        {html ? (
                          <div
                            className="text-fg-soft leading-relaxed [&_h3]:text-fg [&_h3]:font-semibold [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_li]:mb-1 [&_strong]:text-fg [&_em]:italic [&_em]:text-[#E0E0D8] light:[&_em]:text-[#2A2B27] [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-chip [&_th]:bg-chip [&_th]:text-fg [&_th]:text-sm [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-chip [&_td]:text-sm [&_td]:px-3 [&_td]:py-2 [&_a]:text-brand-fg [&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: cleaned }}
                          />
                        ) : (
                          <p className="text-fg-soft leading-relaxed whitespace-pre-wrap">{section.content}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}