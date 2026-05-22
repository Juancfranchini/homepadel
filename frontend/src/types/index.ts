// Tipos globales del frontend — espejo de los modelos Prisma del backend
// Usados en toda la app para tipado fuerte de productos, carrito, usuario y órdenes

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
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
  link?: string;
  active: boolean;
  order: number;
}
