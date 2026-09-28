'use client';

import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { RegisterFormData } from './authFormSchemas';

const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-field border border-chip rounded-lg text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-[#B7D31A]/60 transition-colors [-webkit-box-shadow:0_0_0_30px_rgb(var(--c-field))_inset] [-webkit-text-fill-color:rgb(var(--c-fg))]';
const errorInputClass = 'w-full pl-10 pr-4 py-2.5 bg-field border border-red-500/50 rounded-lg text-sm text-fg placeholder-fg-muted focus:outline-none focus:border-red-500 transition-colors [-webkit-box-shadow:0_0_0_30px_rgb(var(--c-field))_inset] [-webkit-text-fill-color:rgb(var(--c-fg))]';
const checkboxClass = 'mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-chip bg-field accent-[#B7D31A]';

interface Props {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: SubmitHandler<RegisterFormData>;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

export default function CuentaRegisterForm({ form, onSubmit, showPassword, onToggleShowPassword }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label htmlFor="register-name" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Nombre completo</label>
        <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" /><input id="register-name" {...register('name')} type="text" autoComplete="name" placeholder="Escribí tu nombre completo" className={errors.name ? errorInputClass : inputClass} /></div>
        {errors.name && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.name.message)}</p>}
      </div>
      <div>
        <label htmlFor="register-email" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Email</label>
        <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" /><input id="register-email" {...register('email')} type="email" autoComplete="email" placeholder="Escribí tu email" className={errors.email ? errorInputClass : inputClass} /></div>
        {errors.email && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.email.message)}</p>}
      </div>
      <div>
        <label htmlFor="register-password" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Contraseña</label>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" /><input id="register-password" {...register('password')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Creá una contraseña de 6 caracteres o más" className={errors.password ? errorInputClass : inputClass} />
          <button type="button" onClick={onToggleShowPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted hover:text-fg">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {errors.password && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.password.message)}</p>}
      </div>
      <div>
        <label htmlFor="register-confirm-password" className="block text-xs font-semibold text-fg-muted uppercase tracking-wide mb-1">Confirmar contraseña</label>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" /><input id="register-confirm-password" {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repetí tu contraseña" className={errors.confirmPassword ? errorInputClass : inputClass} /></div>
        {errors.confirmPassword && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.confirmPassword.message)}</p>}
      </div>
      <div className="space-y-2.5 pt-1">
        <div>
          <label htmlFor="register-accept-terms" className="flex items-start gap-2.5 text-sm text-[#C9C9C4] light:text-[#43443E] cursor-pointer">
            <input id="register-accept-terms" {...register('acceptTerms')} type="checkbox" className={checkboxClass} />
            <span>Acepto los <Link href="/terminos" target="_blank" className="text-brand-fg font-semibold hover:text-[#c8e81f] light:hover:text-[#4B5A00] underline-offset-2 hover:underline">términos y condiciones</Link></span>
          </label>
          {errors.acceptTerms && <p className="text-red-500 light:text-red-600 text-xs mt-1">{String(errors.acceptTerms.message)}</p>}
        </div>
        <label htmlFor="register-accept-marketing" className="flex items-start gap-2.5 text-sm text-[#C9C9C4] light:text-[#43443E] cursor-pointer">
          <input id="register-accept-marketing" {...register('acceptMarketing')} type="checkbox" className={checkboxClass} />
          <span>Acepto recibir novedades, ofertas</span>
        </label>
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-[#B7D31A] text-[#050606] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70">{isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>
    </form>
  );
}
