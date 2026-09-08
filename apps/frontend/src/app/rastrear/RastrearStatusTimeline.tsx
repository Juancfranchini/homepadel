import { Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { TrackedOrder } from './types';

export const STATUS_STEPS = [
  { key: 'PENDING', label: 'Confirmado', icon: Clock, desc: 'Recibimos tu pedido y lo estamos preparando', color: 'text-amber-400', bg: 'bg-amber-400/10', line: 'bg-amber-400/30' },
  { key: 'PAID', label: 'Pago Aprobado', icon: CheckCircle, desc: 'El pago fue verificado exitosamente', color: 'text-blue-400', bg: 'bg-blue-400/10', line: 'bg-blue-400/30' },
  { key: 'SHIPPED', label: 'En Camino', icon: Truck, desc: 'Tu pedido esta en viaje a tu domicilio', color: 'text-purple-400', bg: 'bg-purple-400/10', line: 'bg-purple-400/30' },
  { key: 'DELIVERED', label: 'Entregado', icon: Package, desc: 'El pedido fue recibido correctamente', color: 'text-green-400', bg: 'bg-green-400/10', line: 'bg-green-400/30' },
  { key: 'CANCELLED', label: 'Cancelado', icon: XCircle, desc: 'Este pedido fue cancelado', color: 'text-red-400', bg: 'bg-red-400/10', line: 'bg-red-400/30' },
];

export default function RastrearStatusTimeline({ order }: { order: TrackedOrder }) {
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="bg-[#0F1111] rounded-2xl border border-[#B7D31A]/20 p-6">
      <h3 className="text-sm font-semibold text-[#F7F6F7] mb-6">Estado del envío</h3>
      <div className="relative">
        {STATUS_STEPS.filter((s) => s.key !== 'CANCELLED' || isCancelled).map((step, index, arr) => {
          const isActive = index <= currentStepIndex && !isCancelled;
          const isCurrent = step.key === order.status;
          const showCancelled = isCancelled && step.key === 'CANCELLED';
          return (
            <div key={step.key} className="flex items-start gap-4 relative">
              {index < arr.length - 1 && (
                <div className="absolute left-[27px] top-14 w-0.5" style={{ height: 'calc(100% - 28px)' }}>
                  <div className="w-full h-full bg-[#1A1F21] rounded-full">
                    <div className={'w-full rounded-full transition-all duration-1000 ease-out ' + step.line} style={{ height: isActive && !isCancelled ? '100%' : '0%' }} />
                  </div>
                </div>
              )}
              <div className={'relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ' +
                (showCancelled ? 'bg-red-500/20 text-red-500' : isCurrent ? 'bg-[#B7D31A] text-[#050606] shadow-[0_0_20px_rgba(183,211,26,0.3)]' : isActive ? step.bg + ' ' + step.color : 'bg-[#1A1F21] text-[#8A8A85]')}>
                <step.icon size={22} />
              </div>
              <div className="flex-1 min-w-0 pt-3 pb-8">
                <p className={'text-base font-bold transition-colors duration-300 ' + (isActive || showCancelled ? 'text-[#F7F6F7]' : 'text-[#8A8A85]')}>{step.label}</p>
                <p className="text-sm text-[#8A8A85] mt-1">{step.desc}</p>
                {isCurrent && !isCancelled && <div className="flex items-center gap-2 mt-2"><span className="w-2 h-2 rounded-full bg-[#B7D31A] animate-pulse" /><span className="text-xs text-[#B7D31A] font-medium">Estado actual</span></div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
