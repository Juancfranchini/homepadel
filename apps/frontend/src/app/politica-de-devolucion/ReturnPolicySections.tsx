import { RefreshCw, Package, Shield, Check, X, MessageCircle, ArrowRight, Mail } from 'lucide-react';
import { trackMetaEvent } from '@/lib/metaPixel';

const STEP_ICONS = [MessageCircle, Package, ArrowRight, Shield, RefreshCw];
const BENEFIT_ICONS: Record<string, any> = { RefreshCw, Package, Shield, Check };

export function ReturnPolicyBenefits({ benefits }: { benefits: any[] }) {
  return (
    <section className="section-gradient relative border-t border-[#0D0F0F] py-12 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
          {benefits.map((b: any, i: number) => {
            const IconComp = BENEFIT_ICONS[b.icon] || Shield;
            return (
              <div key={i} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 hover:border-[#B7D31A]/30 transition-colors">
                <div className="flex items-start">
                  <span className="text-[#B7D31A] flex-shrink-0 mr-0.5"><IconComp size={22} /></span>
                  <h3 className="text-[#F7F6F7] font-semibold text-xs sm:text-sm uppercase tracking-wide text-left pl-1">{b.title}</h3>
                </div>
                <p className="text-[#C7C7C0] text-[11px] sm:text-xs leading-relaxed text-left">{b.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ReturnPolicyConditionsOk({ conditions }: { conditions: string[] }) {
  return (
    <section className="section-gradient relative border-t border-[#0D0F0F] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">CONDICIONES PARA REALIZAR UNA DEVOLUCION</h2>
        <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conditions.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm text-[#C7C7C0]">
                <div className="w-5 h-5 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center flex-none mt-0.5"><Check size={10} className="text-[#B7D31A]" /></div>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ReturnPolicySteps({ steps }: { steps: any[] }) {
  return (
    <section className="section-gradient relative border-t border-[#0D0F0F] py-14 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">COMO SOLICITAR UNA DEVOLUCION</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {steps.map((step: any, i: number) => {
            const StepIcon = STEP_ICONS[i] || MessageCircle;
            const isLast = i === steps.length - 1;
            return (
              <div key={i} className={"flex flex-col items-start text-left gap-2 md:gap-2 md:flex-1 relative p-3 sm:p-4 bg-[#1A1F21] border border-[#0D0F0F] rounded-xl sm:rounded-2xl " + (isLast ? "col-span-2 md:col-span-1 max-w-[200px] mx-auto md:max-w-none md:mx-0 w-full" : "")}>
                {i < steps.length - 1 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-[#0D0F0F] z-0" />}
                <div className="flex items-center gap-1 w-full">
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1F21] border-2 border-[#0D0F0F] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8A8A85]"><StepIcon size={18} /></span>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#B7D31A] flex items-center justify-center">
                      <span className="text-[#050606] font-bold text-[9px]">{i + 1}</span>
                    </div>
                  </div>
                  <p className="text-[#F7F6F7] font-semibold text-[10px] sm:text-xs uppercase tracking-wide pl-1">{step.title}</p>
                </div>
                <p className="text-[#C7C7C0] text-[10px] sm:text-[11px] leading-snug text-left w-full">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ReturnPolicyConditionsNo({ conditions }: { conditions: string[] }) {
  return (
    <section className="section-gradient relative border-t border-[#0D0F0F] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">CUANDO NO APLICA LA DEVOLUCION</h2>
        <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {conditions.map((c: string, i: number) => (
              <div key={i} className="flex items-start gap-3 text-sm text-[#C7C7C0]">
                <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none mt-0.5"><X size={10} className="text-red-400" /></div>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface Help {
  title: string;
  description: string;
  schedule: string;
  whatsapp: string;
  email: string;
}

export function ReturnPolicyHelp({ help }: { help: Help }) {
  return (
    <section className="section-gradient relative border-t border-[#0D0F0F] py-12 bg-[#050606]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-4 sm:p-6 md:p-5 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-none"><MessageCircle size={20} className="sm:size-[24px] text-green-400" /></div>
              <h3 className="text-[#F7F6F7] font-semibold text-base sm:text-lg">{help.title}</h3>
            </div>
            <div className="flex flex-col gap-1.5 w-full">
              <p className="text-[#C7C7C0] text-xs sm:text-sm mt-0.5 text-justify">{help.description}</p>
              <p className="text-[#8A8A85] text-[10px] sm:text-xs mt-1">{help.schedule}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a href={'https://wa.me/' + help.whatsapp} onClick={() => trackMetaEvent('Contact', { content_type: 'whatsapp' })} target="_blank" rel="noopener noreferrer" className="btn-primary-glow bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-[#CAE52E] transition-colors whitespace-nowrap w-full sm:w-auto"><MessageCircle size={16} />WHATSAPP</a>
            <a href={'mailto:' + help.email} className="bg-[#0A2D3D] text-[#F7F6F7] px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider inline-flex items-center justify-center gap-2 hover:bg-[#0D3D52] transition-colors whitespace-nowrap w-full sm:w-auto"><Mail size={16} />ENVIAR EMAIL</a>
          </div>
        </div>
      </div>
    </section>
  );
}
