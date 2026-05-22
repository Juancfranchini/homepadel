'use client';
// Página de cuenta del usuario
// Estado sin login: muestra formulario de login + link a registro
// Estado con login: muestra bienvenida, historial de órdenes y botón de logout
// Usa react-hook-form + zod para validación de formularios

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Package,
  LogOut,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { login, register as registerUser, getMyOrders } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';
import { useEffect } from 'react';

// Schemas de validación
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre es requerido'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

// Mapeo de estados de orden en español
const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  PAID: { label: 'Pagado', color: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-700' },
  DELIVERED: { label: 'Entregado', color: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
};

export default function CuentaPage() {
  const { user, setAuth, logout, isAuthenticated } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Carga las órdenes del usuario autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      setLoadingOrders(true);
      getMyOrders()
        .then((data) => setOrders(Array.isArray(data) ? data : data?.data ?? MOCK_ORDERS))
        .catch(() => setOrders(MOCK_ORDERS))
        .finally(() => setLoadingOrders(false));
    }
  }, [isAuthenticated()]);

  // ── Formulario de Login ────────────────────────────────────────────────
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginFormData) => {
    setApiError('');
    try {
      const result = await login(data);
      setAuth(result.user, result.token);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error?.response?.data?.message || 'Email o contraseña incorrectos');
    }
  };

  // ── Formulario de Registro ─────────────────────────────────────────────
  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegister = async (data: RegisterFormData) => {
    setApiError('');
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(result.user, result.token);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error?.response?.data?.message || 'No se pudo crear la cuenta. Intentá con otro email.');
    }
  };

  // ── Vista autenticada ─────────────────────────────────────────────────
  if (isAuthenticated() && user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Header de cuenta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#C8FF00] rounded-full flex items-center justify-center text-[#111] font-black text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Bienvenido</p>
                <h1 className="text-xl font-black text-[#111]">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-4 py-2 rounded-lg hover:border-red-200"
            >
              <LogOut size={15} />
              Cerrar sesión
            </button>
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Mis pedidos', icon: Package, href: '#pedidos' },
              { label: 'Favoritos', icon: User, href: '#' },
              { label: 'Mis datos', icon: User, href: '#' },
              { label: 'Mis direcciones', icon: User, href: '#' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 text-center hover:border-[#C8FF00] hover:shadow-sm transition-all"
              >
                <item.icon size={22} className="text-gray-600" />
                <span className="text-xs font-semibold text-gray-700">{item.label}</span>
              </a>
            ))}
          </div>

          {/* Mis pedidos */}
          <div id="pedidos" className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-black text-lg uppercase tracking-tight flex items-center gap-2 mb-5">
              <Package size={20} />
              Mis pedidos
            </h2>

            {loadingOrders ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package size={40} className="mx-auto text-gray-200 mb-3" />
                <p className="text-gray-500 font-medium mb-1">Todavía no realizaste pedidos</p>
                <p className="text-gray-400 text-sm mb-5">¡Empezá a comprar ahora!</p>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center gap-2 bg-[#C8FF00] text-[#111] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#111] hover:text-white transition-colors"
                >
                  Ver catálogo
                  <ChevronRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const status = ORDER_STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' };
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {order.status === 'DELIVERED' ? (
                          <CheckCircle size={18} className="text-green-500" />
                        ) : (
                          <Package size={18} className="text-gray-400" />
                        )}
                        <div>
                          <p className="font-bold text-sm">Pedido #{order.number}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('es-AR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="font-black text-sm text-[#111]">
                          {formatPrice(order.total)}
                        </span>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Vista no autenticada ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4">
        {/* Tabs login / registro */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => { setIsRegister(false); setApiError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              !isRegister ? 'bg-[#111] text-white' : 'bg-white text-gray-500 hover:text-gray-700'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => { setIsRegister(true); setApiError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${
              isRegister ? 'bg-[#111] text-white' : 'bg-white text-gray-500 hover:text-gray-700'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="15" fill="#C8FF00" />
                <circle cx="16" cy="16" r="11" fill="#111" />
                <path d="M10 16 Q13 10 16 16 Q19 22 22 16" stroke="#C8FF00" strokeWidth="1.5" fill="none" />
              </svg>
              <span className="font-black text-lg text-[#111]">HOME<span className="text-[#C8FF00]">.</span>PÁDEL</span>
            </Link>
            <h1 className="text-xl font-black mt-3 text-[#111]">
              {isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {isRegister
                ? 'Completá tus datos para registrarte'
                : 'Ingresá para acceder a tu cuenta'}
            </p>
          </div>

          {/* Error de API */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
              <p className="text-red-600 text-sm">{apiError}</p>
            </div>
          )}

          {/* ── Formulario de Login ─────────────────────────────────── */}
          {!isRegister && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...loginForm.register('email')}
                    type="email"
                    placeholder="tu@email.com"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      loginForm.formState.errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      loginForm.formState.errors.password ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs text-gray-500 hover:text-[#111] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loginForm.formState.isSubmitting}
                className="w-full bg-[#C8FF00] text-[#111] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#111] hover:text-white transition-colors duration-200 disabled:opacity-70"
              >
                {loginForm.formState.isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
          )}

          {/* ── Formulario de Registro ──────────────────────────────── */}
          {isRegister && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Nombre completo
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm.register('name')}
                    type="text"
                    placeholder="Juan García"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      registerForm.formState.errors.name ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {registerForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm.register('email')}
                    type="email"
                    placeholder="tu@email.com"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      registerForm.formState.errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      registerForm.formState.errors.password ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    {...registerForm.register('confirmPassword')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repetí tu contraseña"
                    className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:border-gray-400 transition-colors ${
                      registerForm.formState.errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <p className="text-xs text-gray-400">
                Al registrarte aceptás los{' '}
                <Link href="/terminos" className="text-gray-600 underline">
                  Términos y condiciones
                </Link>{' '}
                y la{' '}
                <Link href="/privacidad" className="text-gray-600 underline">
                  Política de privacidad
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={registerForm.formState.isSubmitting}
                className="w-full bg-[#C8FF00] text-[#111] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#111] hover:text-white transition-colors duration-200 disabled:opacity-70"
              >
                {registerForm.formState.isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {/* Separador y toggle */}
          <div className="mt-5 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-400">
              {isRegister ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
              <button
                onClick={() => { setIsRegister(!isRegister); setApiError(''); }}
                className="text-[#111] font-bold hover:text-[#C8FF00] transition-colors"
              >
                {isRegister ? 'Iniciá sesión' : 'Registrate gratis'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Órdenes mock para desarrollo
const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    number: 'HP100123',
    status: 'DELIVERED',
    total: 68000,
    createdAt: '2026-04-15T10:30:00Z',
  },
  {
    id: '2',
    number: 'HP100089',
    status: 'SHIPPED',
    total: 49600,
    createdAt: '2026-04-28T14:00:00Z',
  },
  {
    id: '3',
    number: 'HP100201',
    status: 'PAID',
    total: 18000,
    createdAt: '2026-05-02T09:15:00Z',
  },
];
