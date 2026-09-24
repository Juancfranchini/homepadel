import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

/**
 * Pedido tomado por transferencia (flujo deshabilitado por defecto).
 *
 * No promete un email: el envío de correos (Resend) no está en servicio, así
 * que decía "te enviamos un email con los detalles y el link de seguimiento"
 * y no llegaba nada. Tampoco enlaza al rastreo, que está fuera de uso hasta
 * que haya credenciales del correo.
 */
export default function CheckoutSuccessScreen({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="min-h-screen bg-[#050606] flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-[#0F1111] rounded-2xl border border-[#B7D31A]/30 p-10 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black text-[#F7F6F7] mb-2">Pedido confirmado!</h1>
        <p className="text-[#8A8A85] text-sm mb-1">Número de orden:</p>
        <p className="text-2xl font-black text-[#B7D31A] bg-[#1A1F21] px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
        <p className="text-[#8A8A85] text-sm mb-8">
          En minutos nos vamos a contactar para que termines tu compra. Guardá este número para identificar el pedido.
        </p>
        <Link href="/" className="block border border-[#0D0F0F] py-3 rounded-xl font-bold text-sm text-[#C7C7C0] hover:bg-[#0C0C0C] transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
