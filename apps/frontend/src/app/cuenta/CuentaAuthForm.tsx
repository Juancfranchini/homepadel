'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { login, register as registerUser } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import CuentaLoginForm from './CuentaLoginForm';
import CuentaRegisterForm from './CuentaRegisterForm';

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface Props {
  onAuth: (user: any, token: string) => void;
}

export default function CuentaAuthForm({ onAuth }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginFormData) => {
    setApiError('');
    try { const result = await login(data); onAuth(result.user, result.token); }
    catch (err: any) { setApiError(err?.response?.data?.message || 'Email o contraseña incorrectos'); }
  };

  const onRegister = async (data: RegisterFormData) => {
    setApiError('');
    try { const result = await registerUser({ name: data.name, email: data.email, password: data.password }); onAuth(result.user, result.token); }
    catch (err: any) { setApiError(err?.response?.data?.message || 'No se pudo crear la cuenta.'); }
  };

  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center py-12">
      <div className="w-full max-w-md mx-4">
        <div className="flex rounded-xl overflow-hidden border border-[#1A1F21] mb-6">
          <button onClick={() => { setIsRegister(false); setApiError(''); }} className={'flex-1 py-3 text-sm font-bold transition-colors ' + (!isRegister ? 'bg-[#B7D31A] text-[#050606]' : 'bg-transparent text-[#8A8A85] hover:text-[#F7F6F7]')}>Iniciar sesión</button>
          <button onClick={() => { setIsRegister(true); setApiError(''); }} className={'flex-1 py-3 text-sm font-bold transition-colors ' + (isRegister ? 'bg-[#B7D31A] text-[#050606]' : 'bg-transparent text-[#8A8A85] hover:text-[#F7F6F7]')}>Crear cuenta</button>
        </div>

        <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-8">
          <div className="text-center mb-6">
            <Link href="/" aria-label="Home Padel" className="inline-block">
              <BrandLogo size="lg" />
            </Link>
            <h1 className="text-xl font-black mt-4 text-[#F7F6F7]">{isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}</h1>
            <p className="text-[#8A8A85] text-sm mt-1">{isRegister ? 'Completa tus datos para registrarte' : 'Ingresa para acceder a tu cuenta'}</p>
          </div>

          {apiError && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4"><p className="text-red-500 text-sm">{apiError}</p></div>}

          {!isRegister && (
            <CuentaLoginForm form={loginForm} onSubmit={onLogin} showPassword={showPassword} onToggleShowPassword={() => setShowPassword(!showPassword)} />
          )}

          {isRegister && (
            <CuentaRegisterForm form={registerForm} onSubmit={onRegister} showPassword={showPassword} onToggleShowPassword={() => setShowPassword(!showPassword)} />
          )}

          <div className="mt-5 pt-5 border-t border-[#0D0F0F] text-center">
            <p className="text-sm text-[#8A8A85]">
              {isRegister ? 'Ya tenes cuenta? ' : 'No tenes cuenta? '}
              <button onClick={() => { setIsRegister(!isRegister); setApiError(''); }} className="text-[#B7D31A] font-bold hover:text-[#c8e81f] transition-colors">{isRegister ? 'Inicia sesión' : 'Registrate gratis'}</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
