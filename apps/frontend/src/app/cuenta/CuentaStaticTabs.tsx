import { Heart, FileText, MapPin } from 'lucide-react';
import { User } from '@/types';

export function CuentaFavoritosTab() {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><Heart size={20} className="text-[#B7D31A]" />Favoritos</h2>
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-[#1A1F21] mb-4" />
        <p className="text-[#8A8A85] font-medium mb-1">Todavia no tenes productos favoritos</p>
        <p className="text-[#8A8A85] text-sm">Agrega productos a favoritos desde el catálogo</p>
      </div>
    </div>
  );
}

export function CuentaDatosTab({ user }: { user: User }) {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><FileText size={20} className="text-[#B7D31A]" />Mis datos</h2>
      <div className="space-y-3 max-w-md">
        <div className="flex items-center justify-between py-3 border-b border-[#0D0F0F]"><span className="text-sm text-[#8A8A85]">Nombre</span><span className="text-sm font-semibold text-[#F7F6F7]">{user.name}</span></div>
        <div className="flex items-center justify-between py-3 border-b border-[#0D0F0F]"><span className="text-sm text-[#8A8A85]">Email</span><span className="text-sm font-semibold text-[#F7F6F7]">{user.email}</span></div>
        <div className="flex items-center justify-between py-3"><span className="text-sm text-[#8A8A85]">Contraseña</span><span className="text-sm font-semibold text-[#8A8A85]">********</span></div>
      </div>
    </div>
  );
}

export function CuentaDireccionesTab() {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><MapPin size={20} className="text-[#B7D31A]" />Direcciones</h2>
      <div className="text-center py-12">
        <MapPin size={48} className="mx-auto text-[#1A1F21] mb-4" />
        <p className="text-[#8A8A85] font-medium mb-1">Todavia no tenes direcciones guardadas</p>
        <p className="text-[#8A8A85] text-sm">Las direcciones de tus pedidos apareceran aqui</p>
      </div>
    </div>
  );
}
