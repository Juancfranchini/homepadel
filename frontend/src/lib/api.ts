// Cliente Axios configurado para el backend
// Base URL leída de variable de entorno NEXT_PUBLIC_API_URL
// Incluye interceptor para agregar JWT automáticamente en cada request

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

// ── Funciones de productos ─────────────────────────────────────────────────
export const getProducts = (params?: Record<string, unknown>) =>
  api.get('/products', { params }).then((r) => r.data);

export const getFeaturedProducts = () =>
  api.get('/products/featured').then((r) => r.data);

export const getProduct = (slug: string) =>
  api.get(`/products/${slug}`).then((r) => r.data);

// ── Categorías y marcas ────────────────────────────────────────────────────
export const getCategories = () =>
  api.get('/categories').then((r) => r.data);

export const getBrands = () =>
  api.get('/brands').then((r) => r.data);

// ── Autenticación ──────────────────────────────────────────────────────────
export const login = (data: { email: string; password: string }) =>
  api.post('/auth/login', data).then((r) => r.data);

export const register = (data: { name: string; email: string; password: string }) =>
  api.post('/auth/register', data).then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

// ── Órdenes ────────────────────────────────────────────────────────────────
export const createOrder = (data: Record<string, unknown>) =>
  api.post('/orders', data).then((r) => r.data);

export const getMyOrders = () =>
  api.get('/orders/my').then((r) => r.data);

// ── Banners ────────────────────────────────────────────────────────────────
export const getBanners = () =>
  api.get('/banners').then((r) => r.data);
