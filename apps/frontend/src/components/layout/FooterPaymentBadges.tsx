import { getImageUrl } from '@/lib/utils';

interface Props {
  mercadopago: any;
  visa: any;
  mastercard: any;
  amex: any;
  ca: any;
  oca: any;
  andreani: any;
}

export default function FooterPaymentBadges({ mercadopago, visa, mastercard, amex, ca, oca, andreani }: Props) {
  return (
    <>
      <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Medios de Pago</h3>
      <div className="flex flex-wrap gap-2 mb-6 justify-center md:justify-start">
        {visa?.active !== false && (visa?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(visa.logo)} alt="VISA" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-white rounded flex items-center justify-center"><span className="text-[#1A1F71] text-[7px] font-bold">VISA</span></div>)}
        {mastercard?.active !== false && (mastercard?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(mastercard.logo)} alt="MC" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-black rounded flex items-center justify-center"><svg width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" rx="2" fill="#000" /><circle cx="9" cy="8" r="4" fill="#FF0000" opacity="0.8" /><circle cx="15" cy="8" r="4" fill="#FF9900" opacity="0.8" /></svg></div>)}
        {amex?.active !== false && (amex?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(amex.logo)} alt="AMEX" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#2E77BC] rounded flex items-center justify-center"><span className="text-white text-[7px] font-bold">AMEX</span></div>)}
        {mercadopago?.active !== false && (mercadopago?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(mercadopago.logo)} alt="MP" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#00A650] rounded flex items-center justify-center"><span className="text-white text-[6px] font-bold">MP</span></div>)}
      </div>

      <h3 className="font-semibold text-xs sm:text-sm uppercase tracking-widest text-[#F7F6F7] mb-3 sm:mb-4">Medios de Envio</h3>
      <div className="flex flex-wrap gap-2 justify-center md:justify-start">
        {ca?.active !== false && (ca?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(ca.logo)} alt="CA" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#00509E] rounded flex items-center justify-center"><span className="text-white text-[6px] font-bold">CA</span></div>)}
        {oca?.active !== false && (oca?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(oca.logo)} alt="OCA" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#E30613] rounded flex items-center justify-center"><span className="text-white text-[7px] font-bold">OCA</span></div>)}
        {andreani?.active !== false && (andreani?.logo ? <div className="w-10 h-7 rounded flex items-center justify-center"><img src={getImageUrl(andreani.logo)} alt="ANDREANI" className="w-10 h-7 object-cover rounded" /></div> : <div className="w-10 h-7 bg-[#003DA5] rounded flex items-center justify-center"><span className="text-white text-[5px] font-bold">ANDREANI</span></div>)}
      </div>
    </>
  );
}
