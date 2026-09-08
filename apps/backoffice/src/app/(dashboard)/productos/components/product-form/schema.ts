import { z } from 'zod';

const optionalNumber = z.preprocess((val) => val === '' || val === null ? undefined : val, z.coerce.number().finite().optional());

export const schema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  sku: z.string().min(2, 'SKU requerido'),
  price: z.coerce.number().min(1, 'Precio requerido'),
  salePrice: optionalNumber,
  transferPrice: optionalNumber,
  stock: z.coerce.number().int().min(0).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  hasSize: z.boolean().default(false),
  hasColor: z.boolean().default(false),
  hasDimensions: z.boolean().default(false),
  hasWeight: z.boolean().default(false),
  size: z.string().optional(),
  color: z.string().optional(),
  dimensionLength: optionalNumber,
  dimensionWidth: optionalNumber,
  dimensionHeight: optionalNumber,
  dimensionUnit: z.string().optional(),
  weight: optionalNumber,
  weightUnit: z.string().optional(),
  categoryId: z.string().min(1, 'Categoria requerida'),
  brandId: z.string().min(1, 'Marca requerida'),
  images: z.array(z.string()).optional(),
  discountPercentage: optionalNumber,
  installments: optionalNumber,
  installmentsInterest: optionalNumber,
  hasInstallmentsInterest: z.boolean().default(false),
  isMadeToOrder: z.boolean().default(false),
  estimatedDays: optionalNumber,
  requiredDeposit: optionalNumber,
});

export interface Variant {
  id?: string; sku: string; size: string; color?: string; dimensions?: string;
  dimensionLength?: number; dimensionWidth?: number; dimensionHeight?: number; dimensionUnit?: string;
  weight?: number; weightUnit?: string; imageUrl?: string; images?: string[]; stock: number;
}

export type ProductFormData = z.infer<typeof schema> & {
  images?: string[];
  salePrice?: number;
  variants?: Variant[];
};

export interface Category { id: string; name: string }
export interface Brand { id: string; name: string }

export interface Props {
  defaultValues?: Partial<ProductFormData>;
  onSave: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  categories: Category[];
  brands: Brand[];
}

export const inputClass = 'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]';
export const labelClass = 'text-xs font-medium text-gray-400 uppercase tracking-wider';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

/** Extrae el mensaje que devolvió el backend; si no hay, usa uno genérico. */
export function mensajeDeError(err: unknown, porDefecto: string): string {
  const respuesta = (err as { response?: { data?: { message?: string | string[] } } })?.response;
  const mensaje = respuesta?.data?.message;
  if (Array.isArray(mensaje)) return mensaje.join('. ');
  return mensaje || porDefecto;
}
