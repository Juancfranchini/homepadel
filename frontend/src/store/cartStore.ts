// Store de carrito con Zustand
// Persiste en localStorage bajo la clave 'homepadel-cart'
// Permite agregar, eliminar y actualizar items, y calcular totales

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';
import { trackMetaEvent } from '@/lib/metaPixel';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, variant?: { id: string; sku: string; size: string; color?: string | null; imageUrl?: string | null }) => void;
  removeItem: (itemKey: string) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Agrega un producto al carrito; si ya existe, incrementa la cantidad
      addItem: (product, quantity = 1, variant) => {
        const existing = get().items.find((i) => 
          i.product.id === product.id && i.variantId === variant?.id
        );

        trackMetaEvent('AddToCart', {
          content_ids: [product.id],
          content_type: 'product',
          value: (product.salePrice ?? product.price) * quantity,
          currency: 'ARS',
          contents: [{ id: product.id, quantity, item_price: product.salePrice ?? product.price }],
        });

        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.product.id === product.id && i.variantId === variant?.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ 
            items: [...state.items, { 
              product, 
              quantity,
              variantId: variant?.id,
              variantSku: variant?.sku,
              variantSize: variant?.size,
              variantColor: variant?.color,
              variantImageUrl: variant?.imageUrl,
            }] 
          }));
        }
      },

      // Elimina un producto del carrito por su ID
      removeItem: (itemKey) => {
        set((state) => ({
          items: state.items.filter((i) => getItemKey(i) !== itemKey),
        }));
      },

      // Actualiza la cantidad de un producto; si es 0 o menos, lo elimina
      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            getItemKey(i) === itemKey ? { ...i, quantity } : i
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

export function getItemKey(item: Pick<CartItem, 'product' | 'variantId'>): string {
  return item.product.id + '-' + (item.variantId ?? 'base');
}