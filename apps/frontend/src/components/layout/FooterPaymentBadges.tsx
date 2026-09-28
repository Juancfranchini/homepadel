import { getImageUrl } from '@/lib/utils';
import { PaymentMethodConfig } from '@/hooks/usePaymentMethods';

interface Props {
  mercadopago: PaymentMethodConfig;
  transferencia: PaymentMethodConfig;
  ca: PaymentMethodConfig;
  oca: PaymentMethodConfig;
  andreani: PaymentMethodConfig;
}

const titulo = 'mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-fg sm:mb-4 sm:text-sm';

/** En el celular pagos y envíos van lado a lado; en escritorio, uno arriba del otro en su columna. */
export default function FooterPaymentBadges({ mercadopago, transferencia, ca, oca, andreani }: Props) {
  return (
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-1">
      <div>
        <h3 className={titulo}>Medios de pago</h3>
        <div className="flex flex-wrap gap-2">
          {mercadopago.active !== false && (mercadopago.logo ? <div className="flex h-8 w-16 items-center justify-center rounded"><img src={getImageUrl(mercadopago.logo)} alt="Mercado Pago" className="h-8 w-16 rounded object-contain" /></div> : <div className="flex h-8 items-center justify-center rounded bg-[#00A650] px-3"><span className="text-[8px] font-bold text-white">MERCADO PAGO</span></div>)}
          {transferencia.active === true && <div className="flex h-8 items-center justify-center rounded bg-fg/10 px-3"><span className="text-[8px] font-bold text-fg">TRANSFERENCIA</span></div>}
        </div>
        <p className="mt-2 text-[10px] text-fg-muted">Tarjetas procesadas de forma segura por Mercado Pago.</p>
      </div>

      <div>
        <h3 className={titulo}>Medios de envío</h3>
        <div className="flex flex-wrap gap-2">
          {ca?.active !== false && (ca?.logo ? <div className="flex h-7 w-10 items-center justify-center rounded"><img src={getImageUrl(ca.logo)} alt="CA" className="h-7 w-10 rounded object-cover" /></div> : <div className="flex h-7 w-10 items-center justify-center rounded bg-[#00509E]"><span className="text-[6px] font-bold text-white">CA</span></div>)}
          {oca?.active !== false && (oca?.logo ? <div className="flex h-7 w-10 items-center justify-center rounded"><img src={getImageUrl(oca.logo)} alt="OCA" className="h-7 w-10 rounded object-cover" /></div> : <div className="flex h-7 w-10 items-center justify-center rounded bg-[#E30613]"><span className="text-[7px] font-bold text-white">OCA</span></div>)}
          {andreani?.active !== false && (andreani?.logo ? <div className="flex h-7 w-10 items-center justify-center rounded"><img src={getImageUrl(andreani.logo)} alt="ANDREANI" className="h-7 w-10 rounded object-cover" /></div> : <div className="flex h-7 w-10 items-center justify-center rounded bg-[#003DA5]"><span className="text-[5px] font-bold text-white">ANDREANI</span></div>)}
        </div>
      </div>
    </div>
  );
}
