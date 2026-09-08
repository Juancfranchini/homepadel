export interface TrackedOrder {
  number: string;
  status: string;
  total: number;
  createdAt: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerName?: string;
  items: { quantity: number; product: { name: string; images: string[] }; variant?: { sku: string; size: string; color?: string | null; dimensions?: string | null; weight?: number | null; weightUnit?: string | null } | null }[];
}
