'use client';

import { useState } from 'react';
import { Play, ChevronUp, ChevronDown } from 'lucide-react';

const MOCK_VIDEOS = [
  [
    { title: 'NOX AT10 Genius - Review', thumbnail: '/images/video-thumb-1.jpg', duration: '12:34' },
    { title: 'Comparativa Bullpadel vs NOX', thumbnail: '/images/video-thumb-2.jpg', duration: '08:21' },
  ],
  [
    { title: 'Adidas Metalbone - Analisis', thumbnail: '/images/video-thumb-3.jpg', duration: '15:10' },
    { title: 'Mejores paletas 2026', thumbnail: '/images/video-thumb-4.jpg', duration: '22:45' },
  ],
  [
    { title: 'Como elegir tu paleta', thumbnail: '/images/video-thumb-5.jpg', duration: '10:05' },
    { title: 'Entrenamiento con paleta nueva', thumbnail: '/images/video-thumb-6.jpg', duration: '18:30' },
  ],
];

export default function RelatedVideos() {
  const [page, setPage] = useState(0);
  const videos = MOCK_VIDEOS[page] || MOCK_VIDEOS[0];
  const totalPages = MOCK_VIDEOS.length;

  return (
    <div className="flex gap-4">
      {/* Cards de videos */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {videos.map((video, i) => (
          <div key={i} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl overflow-hidden cursor-pointer group hover:border-[#B7D31A]/40 transition-all">
            <div className="aspect-video bg-[#0C0C0C] flex items-center justify-center relative">
              <div className="w-12 h-12 rounded-full bg-[#B7D31A]/20 flex items-center justify-center group-hover:bg-[#B7D31A]/40 transition-all">
                <Play size={20} className="text-[#B7D31A] ml-0.5" />
              </div>
              <span className="absolute bottom-2 right-2 text-[10px] text-[#8A8A85] bg-black/60 px-2 py-0.5 rounded">
                {video.duration}
              </span>
            </div>
            <div className="p-3">
              <p className="text-[#F7F6F7] text-xs font-medium line-clamp-2">{video.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Paginacion vertical */}
      <div className="flex flex-col items-center gap-1 justify-center">
        <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
          className="w-6 h-6 rounded flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] disabled:opacity-30 transition-colors">
          <ChevronUp size={14} />
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} onClick={() => setPage(i)}
            className={'w-2 h-2 rounded-full transition-all ' +
              (i === page ? 'bg-[#B7D31A] w-2.5 h-2.5' : 'bg-[#8A8A85]/40 hover:bg-[#8A8A85]')} />
        ))}
        <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
          className="w-6 h-6 rounded flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] disabled:opacity-30 transition-colors">
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}