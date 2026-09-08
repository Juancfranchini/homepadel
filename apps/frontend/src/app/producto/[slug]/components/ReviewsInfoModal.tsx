import { Star, X, HelpCircle } from 'lucide-react';

interface Props {
  title: string;
  text: string;
  onClose: () => void;
}

export default function ReviewsInfoModal({ title, text, onClose }: Props) {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 z-20 flex items-center justify-center bg-black/60 rounded-xl">
      <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl p-5 w-full h-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#B7D31A]/10 flex items-center justify-center"><HelpCircle size={16} className="text-[#B7D31A]" /></div>
            <h4 className="text-sm font-semibold text-[#F7F6F7]">{title}</h4>
          </div>
          <button onClick={onClose} className="text-[#8A8A85] hover:text-[#F7F6F7]"><X size={16} /></button>
        </div>
        <p className="text-xs text-[#C7C7C0] leading-relaxed">
          {text || 'Las opiniones son realizadas por clientes verificados que compraron el producto. El promedio se calcula en base a todas las resenas aprobadas.'}
        </p>
        <div className="mt-auto pt-3 border-t border-[#0D0F0F] flex items-center gap-2 text-xs text-[#8A8A85] justify-end">
          <Star className="w-3 h-3 text-[#B7D31A] fill-[#B7D31A]" />
          <span>Resenas 100% verificadas</span>
        </div>
      </div>
    </div>
  );
}
