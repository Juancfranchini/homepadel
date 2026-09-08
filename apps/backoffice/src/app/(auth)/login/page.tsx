'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LayoutDashboard, Loader2 } from 'lucide-react';
import api from '@/lib/api';

const loginSchema = z.object({
  email:    z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});
type LoginFormData = z.infer<typeof loginSchema>;

function LoginFormFields({ onSubmit, apiError, loading }: { onSubmit: (data: LoginFormData) => void; apiError: string; loading: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="admin@homepadel.com"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] transition-all"
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00] transition-all"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg bg-[#C8FF00] text-[#0f172a] font-bold text-sm hover:bg-[#b8ef00] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LayoutDashboard className="w-4 h-4" />}
        {loading ? 'Ingresando...' : 'Entrar al panel'}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await api.post('/auth/login', data);
      const token: string = res.data?.access_token ?? res.data?.token ?? res.data;

      if (!token || typeof token !== 'string') {
        setApiError('Respuesta inesperada del servidor');
        return;
      }

      // Guardar en localStorage (para las requests de axios)
      localStorage.setItem('bo_token', token);
      // Guardar en cookie (para el middleware de Next.js)
      document.cookie = `bo_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;

      router.push('/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Credenciales incorrectas. Verificá tu email y contraseña.';
      setApiError(Array.isArray(msg) ? msg.join(', ') : String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Barra acento */}
          <div className="h-1 bg-[#C8FF00]" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0f172a] mb-4">
                <span className="text-[#C8FF00] font-black text-xl">HP</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">HOME PÁDEL</h1>
              <p className="text-gray-400 text-sm mt-1 font-medium uppercase tracking-widest">BackOffice</p>
            </div>

            <LoginFormFields onSubmit={onSubmit} apiError={apiError} loading={loading} />
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          © {new Date().getFullYear()} Home Pádel — Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
