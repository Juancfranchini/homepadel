import { z } from 'zod';

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().min(8, 'Teléfono inválido').regex(/^[0-9+\s()-]+$/, 'Teléfono inválido'),
  street: z.string().trim().min(5, 'La dirección es requerida'),
  city: z.string().trim().min(2, 'La ciudad es requerida'),
  province: z.string().min(2, 'La provincia es requerida'),
  postalCode: z.string().trim().min(4, 'El código postal es requerido').max(8, 'Código postal inválido'),
  shippingMethod: z.enum(['correo_argentino', 'andreani', 'oca']),
  paymentMethod: z.enum(['mercadopago', 'transfer'], { required_error: 'Seleccioná un método de pago' }),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
