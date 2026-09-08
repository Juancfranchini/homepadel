import { CreditCard } from 'lucide-react';
import { SectionCard } from './shared';
import { PAYMENT_CATALOG, PAYMENT_GROUPS } from './schema';

export default function PaymentMethodsSection({ paymentWatch, setValue }: { paymentWatch: string[]; setValue: any }) {
  return (
    <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Medios de pago habilitados">
      <p className="text-xs text-gray-500 -mt-2 mb-3">
        Seleccioná los medios de pago disponibles para este producto. Se muestran en el botón &quot;Ver más detalles&quot; de la página del producto.
      </p>
      {PAYMENT_GROUPS.map((group) => {
        const methods = Object.entries(PAYMENT_CATALOG).filter(([, def]) => def.group === group.key);
        return (
          <div key={group.key} className="mb-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">{group.label}</p>
            <div className="flex flex-wrap gap-2">
              {methods.map(([key, def]) => {
                const checked = paymentWatch.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setValue('paymentMethods', checked ? paymentWatch.filter((k) => k !== key) : [...paymentWatch, key])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${checked
                      ? `${def.color} border-current ring-2 ring-offset-1 ring-current/30`
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {def.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      {paymentWatch.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-1">
          Sin medios de pago configurados - el botón &quot;Ver más detalles&quot; no se mostrará en el frontend.
        </p>
      )}
    </SectionCard>
  );
}
