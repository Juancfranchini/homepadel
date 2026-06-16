// Tipos globales del frontend — espejo de los modelos Prisma del backend

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  order?: number;
  active?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  url?: string;
  order?: number;
  active?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  images: string[];
  featured: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  active?: boolean;
  videoUrl?: string;
  performanceStats?: unknown;
  features?: unknown;
  highlights?: unknown;
  transferPrice?: number;
  paymentMethods?: unknown;
  category: Category;
  brand: Brand;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Order {
  id: string;
  number: string;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  imageMobile?: string;
  ctaText?: string;
  link?: string;
  active: boolean;
  order: number;
}

// ─── Nuevos tipos para homepage dinámica ────────────────────────────────────

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  imageMobile?: string;
  ctaPrimary?: string;
  ctaPrimaryUrl?: string;
  ctaSecondary?: string;
  ctaSecondaryUrl?: string;
  order: number;
  active: boolean;
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description?: string;
  order: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  comment: string;
  rating: number;
  photo?: string;
  order: number;
  active: boolean;
}

export interface AboutSection {
  title: string;
  description: string;
  image?: string;
  benefits: Array<{ icon: string; title: string; description: string }>;
}

export interface InstagramConfig {
  title: string;
  username: string;
  buttonText: string;
  buttonUrl: string;
}

export interface FinalMessageData {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaSecondaryText?: string;
  ctaSecondaryUrl?: string;
  active?: boolean;
}

export interface SiteSection {
  key: string;
  data: Record<string, unknown>;
  active: boolean;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  discount: number;
  ctaText?: string;
  ctaUrl?: string;
  active: boolean;
  startDate: string;
  endDate: string;
}
