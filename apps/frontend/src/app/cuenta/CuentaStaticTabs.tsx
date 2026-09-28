import { Heart, FileText, MapPin } from 'lucide-react';
import { User } from '@/types';

export function CuentaFavoritosTab() {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2 mb-5"><Heart size={20} className="text-brand-fg" />Favoritos</h2>
      <div className="text-center py-12">
        <Heart size={48} className="mx-auto text-chip mb-4" />
        <p className="text-fg-muted font-medium mb-1">Todavia no tenes productos favoritos</p>
        <p className="text-fg-muted text-sm">Agrega productos a favoritos desde el catálogo</p>
      </div>
    </div>
  );
}

export function CuentaDatosTab({ user }: { user: User }) {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2 mb-5"><FileText size={20} className="text-brand-fg" />Mis datos</h2>
      <div className="space-y-3 max-w-md">
        <div className="flex items-center justify-between py-3 border-b border-line"><span className="text-sm text-fg-muted">Nombre</span><span className="text-sm font-semibold text-fg">{user.name}</span></div>
        <div className="flex items-center justify-between py-3 border-b border-line"><span className="text-sm text-fg-muted">Email</span><span className="text-sm font-semibold text-fg">{user.email}</span></div>
        <div className="flex items-center justify-between py-3"><span className="text-sm text-fg-muted">Contraseña</span><span className="text-sm font-semibold text-fg-muted">********</span></div>
      </div>
    </div>
  );
}

export function CuentaDireccionesTab() {
  return (
    <div>
      <h2 className="font-black text-lg uppercase tracking-tight text-fg flex items-center gap-2 mb-5"><MapPin size={20} className="text-brand-fg" />Direcciones</h2>
      <div className="text-center py-12">
        <MapPin size={48} className="mx-auto text-chip mb-4" />
        <p className="text-fg-muted font-medium mb-1">Todavia no tenes direcciones guardadas</p>
        <p className="text-fg-muted text-sm">Las direcciones de tus pedidos apareceran aqui</p>
      </div>
    </div>
  );
}
