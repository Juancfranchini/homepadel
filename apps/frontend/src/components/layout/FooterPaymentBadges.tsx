import { getImageUrl } from '@/lib/utils';
import { PaymentMethodConfig } from '@/hooks/usePaymentMethods';

interface Props {
  mercadopago: PaymentMethodConfig;
  transferencia: PaymentMethodConfig;
  ca: PaymentMethodConfig;
  oca: PaymentMethodConfig;
  andreani: PaymentMethodConfig;
}

export default function FooterPaymentBadges({ mercadopago, transferencia, ca, oca, andreani }: Props) {
  return (
    <>
      <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Medios de Pago</h3>
      <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
        {mercadopago.active !== false && (mercadopago.logo ? <div className="w-16 h-8 rounded flex items-center justify-center"><img src={getImageUrl(mercadopago.logo)} alt="Mercado Pago" className="w-16 h-8 object-contain rounded" /></div> : <div className="h-8 px-3 bg-[#00A650] rounded flex items-center justify-center"><span className="text-white text-[8px] font-bold">MERCADO PAGO</span></div>)}
        {transferencia.active === true && <div className="h-8 px-3 bg-white/10 rounded flex items-center justify-center"><span className="text-white text-[8px] font-bold">TRANSFERENCIA</span></div>}
      </div>
      <p className="text-[10px] text-[#8A8A85] -mt-4 mb-6">Tarjetas procesadas de forma segura por Mercado Pago.</p>

      <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Medios de Envio</h3>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {ca?.active !== false && (ca?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(ca.logo)} alt="CA" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#00509E] rounded flex items-center justify-center"><span className="text-white text-[6px] font-bold">CA</span></div>)}
        {oca?.active !== false && (oca?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(oca.logo)} alt="OCA" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#E30613] rounded flex items-center justify-center"><span className="text-white text-[7px] font-bold">OCA</span></div>)}
        {andreani?.active !== false && (andreani?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(andreani.logo)} alt="ANDREANI" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#003DA5] rounded flex items-center justify-center"><span className="text-white text-[5px] font-bold">ANDREANI</span></div>)}
      </div>
    </>
  );
}
