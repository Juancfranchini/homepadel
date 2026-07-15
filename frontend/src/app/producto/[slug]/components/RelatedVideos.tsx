'use client';

import { useState } from 'react';
import { Play, ChevronUp, ChevronDown } from 'lucide-react';

interface RelatedVideo {
  title: string;
  url: string;
}

interface Props {
  videos: RelatedVideo[];
}

function getYouTubeThumb(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? 'https://img.youtube.com/vi/' + match[1] + '/mqdefault.jpg' : null;
}

export default function RelatedVideos({ videos }: Props) {
  if (!videos || videos.length === 0) return null;

  const itemsPerPage = 2;
  const totalPages = Math.ceil(videos.length / itemsPerPage);
  const [page, setPage] = useState(0);
  const currentVideos = videos.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="flex gap-4">
      <div className="flex-1 grid grid-cols-2 gap-3">
        {currentVideos.map((video, i) => {
          const thumb = getYouTubeThumb(video.url);
          return (
            <a key={i} href={video.url} target="_blank" rel="noopener noreferrer"
              className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl overflow-hidden cursor-pointer group hover:border-[#B7D31A]/40 transition-all">
              <div className="aspect-video bg-[#0C0C0C] flex items-center justify-center relative">
                {thumb ? <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                  : <div className="w-12 h-12 rounded-full bg-[#B7D31A]/20 flex items-center justify-center group-hover:bg-[#B7D31A]/40 transition-all"><Play size={20} className="text-[#B7D31A] ml-0.5" /></div>}
              </div>
              <div className="p-3"><p className="text-[#F7F6F7] text-xs font-medium line-clamp-2">{video.title}</p></div>
            </a>
          );
        })}
      </div>
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-1 justify-center">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="w-6 h-6 rounded flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] disabled:opacity-30"><ChevronUp size={14} /></button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={'w-2 h-2 rounded-full transition-all ' + (i === page ? 'bg-[#B7D31A] w-2.5 h-2.5' : 'bg-[#8A8A85]/40 hover:bg-[#8A8A85]')} />
          ))}
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
            className="w-6 h-6 rounded flex items-center justify-center text-[#8A8A85] hover:text-[#F7F6F7] disabled:opacity-30"><ChevronDown size={14} /></button>
        </div>
      )}
    </div>
  );
}
