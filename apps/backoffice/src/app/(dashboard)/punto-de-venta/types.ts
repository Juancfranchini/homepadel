export interface PosVariant {
  id: string;
  sku: string;
  barcode?: string | null;
  size: string;
  color?: string | null;
  stock: number;
  active: boolean;
  isDefault: boolean;
}

export interface PosProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  stock: number;
  effectivePrice: number;
  images: string[];
  isMadeToOrder: boolean;
  variants: PosVariant[];
  category?: { name: string };
  brand?: { name: string };
}

export interface PosCartItem {
  key: string;
  product: PosProduct;
  variant?: PosVariant;
  quantity: number;
}

export interface PosRegister {
  id: string;
  name: string;
  code: string;
}

export interface PosBranch {
  id: string;
  name: string;
  code: string;
  registers: PosRegister[];
}

export interface PosCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface SavedCart {
  id: string;
  name: string;
  channel: string;
  branchId?: string;
  items: { productId: string; variantId?: string; quantity: number }[];
  customer?: Record<string, string>;
  discountType?: 'AMOUNT' | 'PERCENTAGE';
  discountValue: number;
  shipping: number;
  notes?: string;
  updatedAt: string;
}

export interface SalesLink {
  id: string;
  channel: string;
  status: 'OPEN' | 'CHECKOUT' | 'CONVERTED' | 'EXPIRED' | 'CANCELLED';
  checkoutUrl: string;
  expiresAt: string;
  order?: { id: string; number: string; paymentStatus: string };
}

export interface CashSession {
  id: string;
  status: string;
  register: { id: string; name: string; branch: { id: string; name: string } };
}

export interface CreatedSale {
  id: string;
  number: string;
  total: number;
  paymentStatus: string;
}
