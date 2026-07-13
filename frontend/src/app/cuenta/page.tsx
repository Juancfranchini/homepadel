'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, Package, LogOut, ChevronRight, CheckCircle, Heart, MapPin, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { login, register as registerUser, getMyOrders } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import BrandLogo from '@/components/ui/BrandLogo';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Las contrasenas no coinciden', path: ['confirmPassword'] });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-400' },
  PAID: { label: 'Pagado', color: 'bg-blue-500/20 text-blue-400' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-500/20 text-purple-400' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-500/20 text-green-400' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-500/20 text-red-400' },
};

type TabKey = 'pedidos' | 'favoritos' | 'datos' | 'direcciones';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'pedidos', label: 'Mis pedidos', icon: Package },
  { key: 'favoritos', label: 'Favoritos', icon: Heart },
  { key: 'datos', label: 'Mis datos', icon: FileText },
  { key: 'direcciones', label: 'Direcciones', icon: MapPin },
];

const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-[#161818] border border-[#1A1F21] rounded-lg text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors';
const errorInputClass = 'w-full pl-10 pr-4 py-2.5 bg-[#161818] border border-red-500/50 rounded-lg text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors';

export default function CuentaPage() {
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('pedidos');

  useEffect(() => {
    if (isAuthenticated()) {
      setLoadingOrders(true);
      getMyOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.data ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated()]);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginFormData) => {
    setApiError('');
    try { const result = await login(data); setAuth(result.user, result.token); }
    catch (err: any) { setApiError(err?.response?.data?.message || 'Email o contrasena incorrectos'); }
  };

  const onRegister = async (data: RegisterFormData) => {
    setApiError('');
    try { const result = await registerUser({ name: data.name, email: data.email, password: data.password }); setAuth(result.user, result.token); }
    catch (err: any) { setApiError(err?.response?.data?.message || 'No se pudo crear la cuenta.'); }
  };

  if (isAuthenticated() && user) {
    return (
      <div className="min-h-screen bg-[#050606]">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header */}
          <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#B7D31A] rounded-full flex items-center justify-center text-[#050606] font-black text-xl">{user.name.charAt(0).toUpperCase()}</div>
              <div>
                <p className="text-xs text-[#8A8A85] font-medium uppercase tracking-wide">Bienvenido</p>
                <h1 className="text-xl font-black text-[#F7F6F7]">{user.name}</h1>
                <p className="text-sm text-[#8A8A85]">{user.email}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-sm text-[#8A8A85] hover:text-red-500 transition-colors border border-[#1A1F21] px-4 py-2 rounded-lg hover:border-red-500/30">
              <LogOut size={15} /> Cerrar sesion
            </button>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={'rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-all ' +
                    (isActive ? 'bg-[#B7D31A]/10 border border-[#B7D31A]/40 shadow-[0_0_12px_rgba(183,211,26,0.08)]' : 'bg-[#0F1111] border border-[#B7D31A]/20 hover:border-[#B7D31A]/40')}>
                  <Icon size={22} className={isActive ? 'text-[#B7D31A]' : 'text-[#8A8A85]'} />
                  <span className={'text-xs font-semibold ' + (isActive ? 'text-[#B7D31A]' : 'text-[#C7C7C0]')}>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Contenido del tab */}
          <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6 min-h-[300px]">
            {/* Pedidos */}
            {activeTab === 'pedidos' && (
              <div>
                <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><Package size={20} className="text-[#B7D31A]" />Mis pedidos</h2>
                {loadingOrders ? (
                  <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-16 bg-[#1A1F21] rounded-lg animate-pulse" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-[#1A1F21] mb-4" />
                    <p className="text-[#8A8A85] font-medium mb-1">Todavia no realizaste pedidos</p>
                    <p className="text-[#8A8A85] text-sm mb-5">Explora nuestro catalogo y hace tu primer pedido</p>
                    <Link href="/catalogo" className="inline-flex items-center gap-2 bg-[#B7D31A] text-[#050606] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#c8e81f] transition-colors">Ver catalogo <ChevronRight size={14} /></Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const status = ORDER_STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-[#1A1F21] text-[#8A8A85]' };
                      return (
                        <Link key={order.id} href={'/rastrear?order=' + order.number}
                          className="flex items-center justify-between p-4 border border-[#1A1F21] rounded-xl hover:border-[#B7D31A]/30 hover:bg-[#0C0C0C] transition-all">
                          <div className="flex items-center gap-3">
                            {order.status === 'DELIVERED' ? <CheckCircle size={18} className="text-green-500" /> : <Package size={18} className="text-[#8A8A85]" />}
                            <div>
                              <p className="font-bold text-sm text-[#F7F6F7]">Pedido #{order.number}</p>
                              <p className="text-xs text-[#8A8A85]">{new Date(order.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={'text-xs font-bold px-2.5 py-1 rounded-full ' + status.color}>{status.label}</span>
                            <span className="font-black text-sm text-[#F7F6F7]">{formatPrice(order.total)}</span>
                            <ChevronRight size={16} className="text-[#8A8A85]" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Favoritos */}
            {activeTab === 'favoritos' && (
              <div>
                <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><Heart size={20} className="text-[#B7D31A]" />Favoritos</h2>
                <div className="text-center py-12">
                  <Heart size={48} className="mx-auto text-[#1A1F21] mb-4" />
                  <p className="text-[#8A8A85] font-medium mb-1">Todavia no tenes productos favoritos</p>
                  <p className="text-[#8A8A85] text-sm">Agrega productos a favoritos desde el catalogo</p>
                </div>
              </div>
            )}

            {/* Datos */}
            {activeTab === 'datos' && (
              <div>
                <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><FileText size={20} className="text-[#B7D31A]" />Mis datos</h2>
                <div className="space-y-3 max-w-md">
                  <div className="flex items-center justify-between py-3 border-b border-[#0D0F0F]"><span className="text-sm text-[#8A8A85]">Nombre</span><span className="text-sm font-semibold text-[#F7F6F7]">{user.name}</span></div>
                  <div className="flex items-center justify-between py-3 border-b border-[#0D0F0F]"><span className="text-sm text-[#8A8A85]">Email</span><span className="text-sm font-semibold text-[#F7F6F7]">{user.email}</span></div>
                  <div className="flex items-center justify-between py-3"><span className="text-sm text-[#8A8A85]">Contrasena</span><span className="text-sm font-semibold text-[#8A8A85]">********</span></div>
                </div>
              </div>
            )}

            {/* Direcciones */}
            {activeTab === 'direcciones' && (
              <div>
                <h2 className="font-black text-lg uppercase tracking-tight text-[#F7F6F7] flex items-center gap-2 mb-5"><MapPin size={20} className="text-[#B7D31A]" />Direcciones</h2>
                <div className="text-center py-12">
                  <MapPin size={48} className="mx-auto text-[#1A1F21] mb-4" />
                  <p className="text-[#8A8A85] font-medium mb-1">Todavia no tenes direcciones guardadas</p>
                  <p className="text-[#8A8A85] text-sm">Las direcciones de tus pedidos apareceran aqui</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Login / Register
  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4">
        <div className="flex rounded-xl overflow-hidden border border-[#1A1F21] mb-6">
          <button onClick={() => { setIsRegister(false); setApiError(''); }} className={'flex-1 py-3 text-sm font-bold transition-colors ' + (!isRegister ? 'bg-[#B7D31A] text-[#050606]' : 'bg-transparent text-[#8A8A85] hover:text-[#F7F6F7]')}>Iniciar sesion</button>
          <button onClick={() => { setIsRegister(true); setApiError(''); }} className={'flex-1 py-3 text-sm font-bold transition-colors ' + (isRegister ? 'bg-[#B7D31A] text-[#050606]' : 'bg-transparent text-[#8A8A85] hover:text-[#F7F6F7]')}>Crear cuenta</button>
        </div>

        <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-8">
          <div className="text-center mb-6">
            <Link href="/" aria-label="Home Padel" className="inline-block"><BrandLogo variant="light" size="sm" showText={true} /></Link>
            <h1 className="text-xl font-black mt-3 text-[#F7F6F7]">{isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}</h1>
            <p className="text-[#8A8A85] text-sm mt-1">{isRegister ? 'Completa tus datos para registrarte' : 'Ingresa para acceder a tu cuenta'}</p>
          </div>

          {apiError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4"><p className="text-red-500 text-sm">{apiError}</p></div>}

          {!isRegister && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Email</label>
                <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...loginForm.register('email')} type="email" placeholder="tu@email.com" className={loginForm.formState.errors.email ? errorInputClass : inputClass} /></div>
                {loginForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Contrasena</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...loginForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="********" className={loginForm.formState.errors.password ? errorInputClass : inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#F7F6F7]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {loginForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
              </div>
              <button type="submit" disabled={loginForm.formState.isSubmitting} className="w-full bg-[#B7D31A] text-[#050606] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70">{loginForm.formState.isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}</button>
            </form>
          )}

          {isRegister && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Nombre completo</label>
                <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...registerForm.register('name')} type="text" placeholder="Juan Garcia" className={registerForm.formState.errors.name ? errorInputClass : inputClass} /></div>
                {registerForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Email</label>
                <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...registerForm.register('email')} type="email" placeholder="tu@email.com" className={registerForm.formState.errors.email ? errorInputClass : inputClass} /></div>
                {registerForm.formState.errors.email && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Contrasena</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...registerForm.register('password')} type={showPassword ? 'text' : 'password'} placeholder="Minimo 6 caracteres" className={registerForm.formState.errors.password ? errorInputClass : inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#F7F6F7]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                {registerForm.formState.errors.password && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Confirmar contrasena</label>
                <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...registerForm.register('confirmPassword')} type={showPassword ? 'text' : 'password'} placeholder="Repeti tu contrasena" className={registerForm.formState.errors.confirmPassword ? errorInputClass : inputClass} /></div>
                {registerForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.confirmPassword.message}</p>}
              </div>
              <button type="submit" disabled={registerForm.formState.isSubmitting} className="w-full bg-[#B7D31A] text-[#050606] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70">{registerForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>
            </form>
          )}

          <div className="mt-5 pt-5 border-t border-[#0D0F0F] text-center">
            <p className="text-sm text-[#8A8A85]">
              {isRegister ? 'Ya tenes cuenta? ' : 'No tenes cuenta? '}
              <button onClick={() => { setIsRegister(!isRegister); setApiError(''); }} className="text-[#B7D31A] font-bold hover:text-[#c8e81f] transition-colors">{isRegister ? 'Inicia sesion' : 'Registrate gratis'}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
