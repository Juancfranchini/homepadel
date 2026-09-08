import { z } from 'zod';

export const perfStatSchema = z.object({
  label: z.string().min(1),
  value: z.coerce.number().min(0).max(100),
});

export const featureSchema = z.object({
  icon: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
});

export const schema = z.object({
  // Básico
  name: z.string().min(2, 'Nombre requerido (mí­n. 2 caracteres)'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU requerido'),
  categoryId: z.string().min(1, 'Seleccioná una categorí­a'),
  brandId: z.string().min(1, 'Seleccioná una marca'),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  active: z.boolean().default(true),

  // Precios
  price: z.coerce.number().min(0, 'Precio requerido'),
  salePrice: z.coerce.number().min(0).optional(),
  transferPrice: z.coerce.number().min(0).optional(),

  // Stock
  stock: z.coerce.number().int().min(0),

  // Imágenes (URLs)
  images: z.array(z.string().url('URL de imagen inválida')).optional(),

  // Rendimiento (performance stats)
  performanceStats: z.array(perfStatSchema).optional(),

  // Caracterí­sticas
  features: z.array(featureSchema).optional(),

  // DESTACADOS — bullets por producto
  highlights: z.array(z.string().min(1)).optional(),

  // Medios de pago habilitados
  paymentMethods: z.array(z.string()).optional(),

  // Video
  videoUrl: z.string().optional(),
});

export type FormValues = z.infer<typeof schema>;

export interface PaymentMethodDef { label: string; group: 'credit' | 'debit' | 'transfer' | 'wallet'; color: string }

export const PAYMENT_CATALOG: Record<string, PaymentMethodDef> = {
  visa: { label: 'Visa', group: 'credit', color: 'bg-blue-100 text-blue-800' },
  mastercard: { label: 'Mastercard', group: 'credit', color: 'bg-orange-100 text-orange-800' },
  amex: { label: 'Amex', group: 'credit', color: 'bg-blue-100 text-blue-900' },
  naranja_x: { label: 'Naranja X', group: 'credit', color: 'bg-orange-100 text-orange-700' },
  nativa: { label: 'Nativa', group: 'credit', color: 'bg-yellow-100 text-yellow-800' },
  cabal: { label: 'Cabal', group: 'credit', color: 'bg-red-100 text-red-800' },
  argencard: { label: 'Argencard', group: 'credit', color: 'bg-green-100 text-green-800' },
  visa_deb: { label: 'Visa Débito', group: 'debit', color: 'bg-blue-50 text-blue-700' },
  mc_deb: { label: 'MC Débito', group: 'debit', color: 'bg-orange-50 text-orange-700' },
  cabal_deb: { label: 'Cabal Débito', group: 'debit', color: 'bg-red-50 text-red-700' },
  transferencia: { label: 'Transferencia', group: 'transfer', color: 'bg-green-100 text-green-900' },
  banelco: { label: 'Banelco', group: 'transfer', color: 'bg-green-100 text-green-800' },
  link: { label: 'Link Pagos', group: 'transfer', color: 'bg-emerald-100 text-emerald-800' },
  mercadopago: { label: 'Mercado Pago', group: 'wallet', color: 'bg-sky-100 text-sky-800' },
  cuenta_dni: { label: 'Cuenta DNI', group: 'wallet', color: 'bg-slate-100 text-slate-800' },
};

export const PAYMENT_GROUPS: { key: 'credit' | 'debit' | 'transfer' | 'wallet'; label: string }[] = [
  { key: 'credit', label: 'Tarjetas de crédito' },
  { key: 'debit', label: 'Tarjetas de débito' },
  { key: 'transfer', label: 'Transferencia / depósito' },
  { key: 'wallet', label: 'Billetera virtual' },
];

export interface Category { id: string; name: string }
export interface Brand { id: string; name: string }
