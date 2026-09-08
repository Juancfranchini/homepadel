'use client';

import { UseFormReturn } from 'react-hook-form';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const inputClass = 'w-full pl-10 pr-4 py-2.5 bg-[#161818] border border-[#1A1F21] rounded-lg text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-[#B7D31A]/60 transition-colors [-webkit-box-shadow:0_0_0_30px_#161818_inset] [-webkit-text-fill-color:#F7F6F7]';
const errorInputClass = 'w-full pl-10 pr-4 py-2.5 bg-[#161818] border border-red-500/50 rounded-lg text-sm text-[#F7F6F7] placeholder-[#8A8A85] focus:outline-none focus:border-red-500 transition-colors [-webkit-box-shadow:0_0_0_30px_#161818_inset] [-webkit-text-fill-color:#F7F6F7]';

interface Props {
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
}

export default function CuentaRegisterForm({ form, onSubmit, showPassword, onToggleShowPassword }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Nombre completo</label>
        <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...register('name')} type="text" autoComplete="off" placeholder="Juan Garcia" className={errors.name ? errorInputClass : inputClass} /></div>
        {errors.name && <p className="text-red-500 text-xs mt-1">{String(errors.name.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Email</label>
        <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...register('email')} type="email" autoComplete="off" placeholder="tu@email.com" className={errors.email ? errorInputClass : inputClass} /></div>
        {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Contraseña</label>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...register('password')} type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="Minimo 6 caracteres" className={errors.password ? errorInputClass : inputClass} />
          <button type="button" onClick={onToggleShowPassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A85] hover:text-[#F7F6F7]">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
        </div>
        {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-[#8A8A85] uppercase tracking-wide mb-1">Confirmar contraseña</label>
        <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A85]" /><input {...register('confirmPassword')} type={showPassword ? 'text' : 'password'} autoComplete="off" placeholder="Repeti tu contraseña" className={errors.confirmPassword ? errorInputClass : inputClass} /></div>
        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{String(errors.confirmPassword.message)}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-[#B7D31A] text-[#050606] py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#c8e81f] transition-colors disabled:opacity-70">{isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}</button>
    </form>
  );
}
