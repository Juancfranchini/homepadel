// Cliente Axios configurado para el backend
// Base URL leída de variable de entorno NEXT_PUBLIC_API_URL

import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Agrega JWT al header Authorization si existe en localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// Productos
export const getProducts = (params?: Record<string, unknown>) =>
  api.get('/products', { params }).then((r) => r.data);

export const getBestSellers = () =>
  api.get('/products/best-sellers').then((r) => r.data);

export const getFeaturedProducts = () =>
  api.get('/products/featured').then((r) => r.data);

export const getProduct = (slug: string) =>
  api.get(`/products/${slug}`).then((r) => r.data);

// Categorías y marcas
export const getCategories = () =>
  api.get('/categories').then((r) => r.data);

export const getBrands = () =>
  api.get('/brands').then((r) => r.data);

// Autenticación
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then((r) => r.data);

export const register = (data: { name: string; email: string; password: string; acceptTerms: boolean; acceptMarketing: boolean }) =>
  api.post('/auth/register', data).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

// Órdenes
export const createOrder = (data: Record<string, unknown>) =>
  api.post('/orders', data).then((r) => r.data);

export const getMyOrders = () =>
  api.get('/orders/my').then((r) => r.data);

/** Estado real de una orden por su número. Lo usan las pantallas de vuelta de Mercado Pago. */
export const trackOrder = (orderNumber: string) =>
  api.get(`/orders/track/${encodeURIComponent(orderNumber)}`).then((r) => r.data);

export const createPaymentPreference = (data: Record<string, unknown>) =>
  api.post('/payments/create-preference', data).then((r) => r.data);

/** Registra el carrito de quien empezó el checkout y todavía no compró. */
export const saveAbandonedCart = (data: Record<string, unknown>) =>
  api.post('/abandoned-carts', data).then((r) => r.data);

/**
 * Pide al servidor que consulte el pago en Mercado Pago y registre la venta.
 * No espera el aviso de Mercado Pago, que es un solo canal y puede fallar.
 */
export const confirmPayment = (orderNumber: string) =>
  api.post('/payments/confirm', { orderNumber }).then((r) => r.data);

export const getSalesLink = (token: string) =>
  api.get(`/sales-links/${encodeURIComponent(token)}`).then((r) => r.data);

// Banners
export const getBanners = () =>
  api.get('/banners').then((r) => r.data);

// Secciones homepage
export const getHeroSlides = () =>
  api.get('/hero-slides').then((r) => r.data);

export const getBenefits = () =>
  api.get('/benefits').then((r) => r.data);

export const getTestimonials = () =>
  api.get('/testimonials').then((r) => r.data);

export const getPromotions = () =>
  api.get('/promotions').then((r) => r.data);

export const getSiteSection = (key: string) =>
  api.get(`/site-sections/${key}`).then((r) => r.data);

// Cupones — el descuento SIEMPRE lo calcula el servidor (P2)
export const validateCoupon = (code: string, subtotal: number) =>
  api.post('/coupons/validate', { code, subtotal }).then((r) => r.data);

// Mi cuenta — favoritos y direcciones (requieren sesión)
export interface DireccionGuardada {
  id: string;
  label: string | null;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string | null;
}
export type DireccionInput = Omit<DireccionGuardada, 'id' | 'label' | 'phone'> & { label?: string; phone?: string };

export const getFavoritosIds = () => api.get<string[]>('/mi-cuenta/favoritos/ids').then((r) => r.data);
export const getFavoritos = () => api.get('/mi-cuenta/favoritos').then((r) => r.data);
export const agregarFavorito = (productId: string) => api.put(`/mi-cuenta/favoritos/${encodeURIComponent(productId)}`);
export const quitarFavorito = (productId: string) => api.delete(`/mi-cuenta/favoritos/${encodeURIComponent(productId)}`);
export const sincronizarFavoritos = (productIds: string[]) =>
  api.post<string[]>('/mi-cuenta/favoritos/sincronizar', { productIds }).then((r) => r.data);

export const getDirecciones = () => api.get<DireccionGuardada[]>('/mi-cuenta/direcciones').then((r) => r.data);
export const crearDireccion = (data: DireccionInput) => api.post<DireccionGuardada>('/mi-cuenta/direcciones', data).then((r) => r.data);
export const actualizarDireccion = (id: string, data: DireccionInput) =>
  api.patch<DireccionGuardada>(`/mi-cuenta/direcciones/${encodeURIComponent(id)}`, data).then((r) => r.data);
export const borrarDireccion = (id: string) => api.delete(`/mi-cuenta/direcciones/${encodeURIComponent(id)}`);
