// Tipos globales del frontend

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

export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color?: string | null;
  imageUrl?: string | null;
  images?: string[];
  stock: number;
  active: boolean;
}

export interface Product {
  variants?: ProductVariant[];
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
  discountPercentage?: number;
  installments?: number;
  installmentsInterest?: number;
  hasInstallmentsInterest?: boolean;
  isMadeToOrder?: boolean;
  estimatedDays?: number;
  requiredDeposit?: number;
  rating?: number;
  reviewCount?: number;
  paymentMethods?: unknown;
  category: Category;
  brand: Brand;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  number: string;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  createdAt: string;
  trackingNumber?: string;
  trackingUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  address?: string;
  items?: {
    id: string;
    quantity: number;
    price: number;
    product: { name: string; sku: string; images?: string[] };
  }[];
}

export interface Review {
  id: string;
  productId: string;
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
  active: boolean;
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
  id?: string;
  icon: string;
  title: string;
  description?: string;
  order?: number;
  active?: boolean;
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

export interface AboutSection {
  title: string;
  description?: string;
  image?: string;
  benefits: Benefit[];
}

export interface InstagramConfig {
  title: string;
  username: string;
  buttonText: string;
  buttonUrl: string;
  active?: boolean;
  posts?: unknown;
}

export interface FinalMessageData {
  title: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
  active?: boolean;
  footerText?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  newsletterTitle?: string;
  newsletterText?: string;
  newsletterPlaceholder?: string;
  newsletterFooterText?: string;
}

export interface SiteSection {
  key: string;
  data: unknown;
  active: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
}