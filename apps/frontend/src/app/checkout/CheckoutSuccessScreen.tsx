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
    <div className="min-h-screen bg-page flex items-center justify-center">
      <div className="max-w-md w-full mx-4 bg-card rounded-2xl border border-[#B7D31A]/30 p-10 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500 light:text-green-700" />
        </div>
        <h1 className="text-2xl font-black text-fg mb-2">Pedido confirmado!</h1>
        <p className="text-fg-muted text-sm mb-1">Número de orden:</p>
        <p className="text-2xl font-black text-brand-fg bg-chip px-6 py-2 rounded-lg mb-5 inline-block">#{orderNumber}</p>
        <p className="text-fg-muted text-sm mb-8">
          En minutos nos vamos a contactar para que termines tu compra. Guardá este número para identificar el pedido.
        </p>
        <Link href="/" className="block border border-line py-3 rounded-xl font-bold text-sm text-fg-soft hover:bg-panel transition-colors">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
