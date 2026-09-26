import { z } from 'zod';

// Con retiro en el local no hace falta domicilio: se recibe el pedido en el
// local, no se le entrega a ningún transportista.
const checkoutBaseSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  email: z.string().trim().email('Email inválido'),
  phone: z.string().trim().min(8, 'Teléfono inválido').regex(/^[0-9+\s()-]+$/, 'Teléfono inválido'),
  street: z.string().trim().optional(),
  city: z.string().trim().optional(),
  province: z.string().optional(),
  postalCode: z.string().trim().optional(),
  shippingMethod: z.enum(['correo_argentino', 'andreani', 'oca', 'retiro_local']),
  paymentMethod: z.enum(['mercadopago', 'transfer'], { required_error: 'Seleccioná un método de pago' }),
});

export const checkoutSchema = checkoutBaseSchema.superRefine((data, ctx) => {
  if (data.shippingMethod === 'retiro_local') return;

  if (!data.street || data.street.length < 5) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['street'], message: 'La dirección es requerida' });
  }
  if (!data.city || data.city.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['city'], message: 'La ciudad es requerida' });
  }
  if (!data.province || data.province.length < 2) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['province'], message: 'La provincia es requerida' });
  }
  if (!data.postalCode || data.postalCode.length < 4 || data.postalCode.length > 8) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['postalCode'], message: 'El código postal es requerido' });
  }
});

export type CheckoutFormData = z.infer<typeof checkoutBaseSchema>;
