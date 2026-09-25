import { z } from 'zod';

const optionalAmount = z.coerce.number().min(0).default(0);

export const posSchema = z.object({
  channel: z.enum(['LOCAL', 'WHATSAPP', 'INSTAGRAM', 'SOCIAL', 'PHONE']),
  branchId: z.string().min(1, 'Elegí una sucursal'),
  customerId: z.string().optional(),
  customerName: z.string().max(120).optional(),
  customerEmail: z.union([z.string().email('Email inválido'), z.literal('')]).optional(),
  customerPhone: z.string().max(40).optional(),
  customerAddress: z.string().max(240).optional(),
  discountType: z.enum(['AMOUNT', 'PERCENTAGE']),
  discountValue: optionalAmount,
  shipping: optionalAmount,
  notes: z.string().max(1000).optional(),
  paymentMethod1: z.enum(['CASH', 'TRANSFER', 'CARD', 'DIGITAL_WALLET', 'EXTERNAL_TERMINAL']),
  paymentAmount1: optionalAmount,
  paymentReference1: z.string().max(160).optional(),
  paymentMethod2: z.enum([
    'NONE',
    'CASH',
    'TRANSFER',
    'CARD',
    'DIGITAL_WALLET',
    'EXTERNAL_TERMINAL',
  ]),
  paymentAmount2: optionalAmount,
  paymentReference2: z.string().max(160).optional(),
});

export type PosFormData = z.infer<typeof posSchema>;
