import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { PaymentMethodConfig } from '@/hooks/usePaymentMethods';
import CheckoutPersonalDataFields from './CheckoutPersonalDataFields';
import CheckoutShippingFields from './CheckoutShippingFields';
import CheckoutPaymentMethodFields from './CheckoutPaymentMethodFields';
import { CheckoutFormData } from './checkoutSchema';

interface Props {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  selectedShipping: CheckoutFormData['shippingMethod'];
  selectedPayment: CheckoutFormData['paymentMethod'];
  correoCost: number;
  shippingToCoordinate: boolean;
  mercadopago: PaymentMethodConfig;
  transferencia: PaymentMethodConfig;
}

export default function CheckoutFormSections(props: Props) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <CheckoutPersonalDataFields register={props.register} errors={props.errors} />
      <CheckoutShippingFields register={props.register} errors={props.errors} selectedMethod={props.selectedShipping} correoCost={props.correoCost} />
      {!props.shippingToCoordinate ? (
        <CheckoutPaymentMethodFields register={props.register} errors={props.errors} selectedPayment={props.selectedPayment} mercadopago={props.mercadopago} transferencia={props.transferencia} />
      ) : (
        <div className="bg-[#0F1111] rounded-2xl border border-amber-400/20 p-6 text-sm text-[#C7C7C0]">
          El pago queda en pausa hasta conocer el costo del transportista. Al continuar, abriremos WhatsApp con el pedido y los datos de entrega ya preparados.
        </div>
      )}
    </div>
  );
}
