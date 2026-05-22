// Store de carrito con Zustand
// Persiste en localStorage bajo la clave 'homepadel-cart'
// Permite agregar, eliminar y actualizar items, y calcular totales

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Agrega un producto al carrito; si ya existe, incrementa la cantidad
      addItem: (product, quantity = 1) => {
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, { product, quantity }] }));
        }
      },

      // Elimina un producto del carrito por su ID
      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        }));
      },

      // Actualiza la cantidad de un producto; si es 0 o menos, lo elimina
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      // Suma total de unidades en el carrito
      totalItems: () => get().items.reduce((acc, i) => acc + i.quantity, 0),

      // Precio total usando salePrice si existe, sino price regular
      totalPrice: () =>
        get().items.reduce((acc, i) => {
          const price = i.product.salePrice ?? i.product.price;
          return acc + price * i.quantity;
        }, 0),
    }),
    { name: 'homepadel-cart' }
  )
);
