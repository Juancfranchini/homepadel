import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { PaymentMethodConfig } from '@/hooks/usePaymentMethods';
import CheckoutPersonalDataFields from './CheckoutPersonalDataFields';
import CheckoutShippingFields from './CheckoutShippingFields';
import CheckoutPaymentMethodFields from './CheckoutPaymentMethodFields';
import { CheckoutFormData } from './checkoutSchema';
import { CheckoutFlex } from './useCheckoutFlex';
import { DireccionGuardada } from '@/lib/api';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedShipping: CheckoutFormData['shippingMethod'];
  selectedPayment: CheckoutFormData['paymentMethod'];
  correoCost: number;
  andreaniGratis: boolean;
  shippingToCoordinate: boolean;
  mercadopago: PaymentMethodConfig;
  transferencia: PaymentMethodConfig;
  storeAddress?: string;
  flex: CheckoutFlex;
  direcciones: DireccionGuardada[];
  onUsarDireccion: (d: DireccionGuardada) => void;
}

export default function CheckoutFormSections(props: Props) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <CheckoutPersonalDataFields register={props.register} errors={props.errors} />
      <CheckoutShippingFields register={props.register} errors={props.errors} selectedMethod={props.selectedShipping} correoCost={props.correoCost} andreaniGratis={props.andreaniGratis} storeAddress={props.storeAddress} flex={props.flex} direcciones={props.direcciones} onUsarDireccion={props.onUsarDireccion} />
      {!props.shippingToCoordinate ? (
        <CheckoutPaymentMethodFields register={props.register} errors={props.errors} selectedPayment={props.selectedPayment} mercadopago={props.mercadopago} transferencia={props.transferencia} />
      ) : (
        <div className="bg-card rounded-2xl border border-amber-400/20 p-6 text-sm text-fg-soft">
          El pago queda en pausa hasta conocer el costo del transportista. Al continuar, abriremos WhatsApp con el pedido y los datos de entrega ya preparados.
        </div>
      )}
    </div>
  );
}
