import Link from 'next/link';
import { RefreshCw, Package, Shield, Check, X, MessageCircle, Mail, ArrowRight } from 'lucide-react';
import { getSiteSection } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function PoliticaDevolucionPage() {
  let data: any = {};

  try {
    const res = await getSiteSection('politica_devolucion');
    data = res?.data || {};
  } catch {}

  const hero = {
    chip: data.chip || 'DEVOLUCIONES Y CAMBIOS',
    title: data.title || 'Politica de Devolucion',
    description: data.description || 'En Home Padel queremos que estes 100% satisfecho con tu compra.',
  };

  const benefits = data.benefits?.length > 0 ? data.benefits : [
    { icon: 'RefreshCw', title: '30 DIAS', desc: 'Tenes hasta 30 dias corridos desde que recibis tu pedido.' },
    { icon: 'Package', title: 'PRODUCTO SIN USO', desc: 'El producto debe estar sin uso, con etiquetas y en su embalaje original.' },
    { icon: 'Shield', title: 'CAMBIO O REINTEGRO', desc: 'Podes elegir entre cambio por otro producto o reintegro del dinero.' },
    { icon: 'Check', title: 'COMPRA SEGURA', desc: 'Proceso simple, rapido y 100% seguro.' },
  ];

  const conditionsOk = data.conditionsOk?.length > 0 ? data.conditionsOk : [
    'El producto debe estar sin uso y en perfectas condiciones.',
    'Debe incluir su embalaje original, etiquetas, manuales y accesorios.',
    'La solicitud debe realizarse dentro de los 30 dias corridos desde la recepcion.',
    'El producto no debe presentar signos de uso, desgaste o dano.',
    'En caso de devolucion por falla o error nuestro, nos hacemos cargo del envio.',
    'En caso de devolucion por arrepentimiento, el costo del envio corre por cuenta del cliente.',
  ];

  const conditionsNo = data.conditionsNo?.length > 0 ? data.conditionsNo : [
    'Productos usados o con signos de desgaste.',
    'Productos que no incluyan su embalaje original, etiquetas o accesorios.',
    'Productos en oferta o con descuento especial (salvo fallas de fabrica).',
    'Productos personalizados o a pedido.',
    'Productos que hayan sido alterados o modificados.',
    'Pelotas, grips, overgrips u otros accesorios que hayan sido abiertos.',
  ];

  const steps = data.steps?.length > 0 ? data.steps : [
    { title: 'CONTACTANOS', desc: 'Escribinos por WhatsApp, email o completa el formulario de contacto.' },
    { title: 'PREPARA EL PRODUCTO', desc: 'Te indicaremos como y a donde enviar el producto.' },
    { title: 'ENVIALO', desc: 'Despacha el producto segun las instrucciones que te dimos.' },
    { title: 'REVISION', desc: 'Una vez recibido, revisaremos el estado del producto.' },
    { title: 'CAMBIO O REINTEGRO', desc: 'Procesamos el cambio o el reintegro segun tu eleccion.' },
  ];

  const help = {
    title: data.helpTitle || 'Necesitas ayuda?',
    description: data.helpDescription || 'Nuestro equipo esta listo para ayudarte con tu devolucion.',
    schedule: data.helpSchedule || 'Lunes a Viernes de 9 a 18 hs. | Sabados de 9 a 13 hs.',
    whatsapp: data.helpWhatsapp || '5491131813297',
    email: data.helpEmail || 'hola@homepadel.com.ar',
  };

  const STEP_ICONS = [MessageCircle, Package, ArrowRight, Shield, RefreshCw];
  const BENEFIT_ICONS: Record<string, any> = { RefreshCw, Package, Shield, Check };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C0C0C] to-[#050606] text-[#F7F6F7]">
      <div className="border-b border-[#0D0F0F]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
          <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
          <span className="text-[#F7F6F7]">Politica de Devolucion</span>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">{hero.chip}</p>
            <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">{hero.title}</h1>
            <p className="text-[#C7C7C0] text-base leading-relaxed max-w-md">{hero.description}</p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-72 h-72 md:w-80 md:h-80 bg-[#1A1F21] border border-[#0D0F0F] rounded-3xl flex items-center justify-center relative p-8">
              <div className="relative">
                <div className="w-28 h-28 bg-[#0C0C0C] border-2 border-[#0D0F0F] rounded-2xl flex items-center justify-center">
                  <Package size={48} className="text-[#8A8A85]" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-[#B7D31A] flex items-center justify-center">
                  <RefreshCw size={20} className="text-[#050606]" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6 bg-[#B7D31A]/10 border border-[#B7D31A]/20 rounded-xl px-4 py-2 text-center">
                <p className="text-[#B7D31A] font-semibold text-sm">30 DIAS</p>
                <p className="text-[#8A8A85] text-[10px]">Sin complicaciones</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient relative border-t border-[#0D0F0F] py-12 bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((b: any, i: number) => {
              const IconComp = BENEFIT_ICONS[b.icon] || Shield;
              return (
                <div key={i} className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-5 flex flex-col gap-3 hover:border-[#B7D31A]/30 transition-colors">
                  <span className="text-[#B7D31A]"><IconComp size={28} /></span>
                  <h3 className="text-[#F7F6F7] font-semibold text-sm uppercase tracking-wide">{b.title}</h3>
                  <p className="text-[#C7C7C0] text-xs leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-gradient relative border-t border-[#0D0F0F] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">CONDICIONES PARA REALIZAR UNA DEVOLUCION</h2>
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conditionsOk.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#C7C7C0]">
                  <div className="w-5 h-5 rounded-full bg-[#B7D31A]/10 border border-[#B7D31A]/30 flex items-center justify-center flex-none mt-0.5"><Check size={10} className="text-[#B7D31A]" /></div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient relative border-t border-[#0D0F0F] py-14 bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-10">COMO SOLICITAR UNA DEVOLUCION</h2>
          <div className="flex flex-col md:flex-row items-start gap-0">
            {steps.map((step: any, i: number) => {
              const StepIcon = STEP_ICONS[i] || MessageCircle;
              return (
                <div key={i} className="flex md:flex-col items-start md:items-center gap-4 md:gap-3 flex-1 relative">
                  {i < steps.length - 1 && <div className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-[#0D0F0F] z-0" />}
                  <div className="flex md:flex-col items-center gap-3 md:gap-2 w-full">
                    <div className="relative z-10 w-12 h-12 rounded-full bg-[#1A1F21] border-2 border-[#0D0F0F] flex items-center justify-center flex-none">
                      <span className="text-[#8A8A85]"><StepIcon size={20} /></span>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#B7D31A] flex items-center justify-center">
                        <span className="text-[#050606] font-bold text-[9px]">{i + 1}</span>
                      </div>
                    </div>
                    <div className="md:text-center pb-6 md:pb-0">
                      <p className="text-[#F7F6F7] font-semibold text-xs uppercase tracking-wide">{step.title}</p>
                      <p className="text-[#C7C7C0] text-[11px] leading-snug mt-1 max-w-[140px]">{step.desc}</p>
                    </div>
                  </div>
                  {i < steps.length - 1 && <div className="md:hidden w-px h-6 bg-[#0D0F0F] mx-6" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-gradient relative border-t border-[#0D0F0F] py-14">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-8">CUANDO NO APLICA LA DEVOLUCION</h2>
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conditionsNo.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm text-[#C7C7C0]">
                  <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-none mt-0.5"><X size={10} className="text-red-400" /></div>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-gradient relative border-t border-[#0D0F0F] py-12 bg-[#050606]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-none"><MessageCircle size={24} className="text-green-400" /></div>
              <div>
                <h3 className="text-[#F7F6F7] font-semibold text-lg">{help.title}</h3>
                <p className="text-[#C7C7C0] text-sm mt-0.5">{help.description}</p>
                <p className="text-[#8A8A85] text-xs mt-1">{help.schedule}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <a href={'https://wa.me/' + help.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-primary-glow bg-[#B7D31A] text-[#050606] px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#CAE52E] transition-colors whitespace-nowrap"><MessageCircle size={16} />WHATSAPP</a>
              <a href={'mailto:' + help.email} className="bg-[#0A2D3D] text-[#F7F6F7] px-6 py-3 rounded-xl font-semibold text-sm uppercase tracking-wider inline-flex items-center gap-2 hover:bg-[#0D3D52] transition-colors whitespace-nowrap"><Mail size={16} />ENVIAR EMAIL</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
