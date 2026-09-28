'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useFavorito } from '@/store/favoritosStore';

export function useProductoActions(product: Product | null, selectedVariant: any, activeProductVariants: any[]) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState(1);
  const favorito = useFavorito(product?.id);
  const [added, setAdded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    if (activeProductVariants.length && !selectedVariant) {
      alert('Seleccioná las opciones de la variante antes de continuar');
      return;
    }
    addItem(product, quantity, selectedVariant ?? undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (activeProductVariants.length && !selectedVariant) {
      alert('Seleccioná las opciones de la variante antes de continuar');
      return;
    }
    addItem(product, quantity, selectedVariant ?? undefined);
    router.push('/carrito');
  };

  return {
    quantity, setQuantity, wished: favorito.marcado, toggleWish: favorito.alternar, added,
    showPaymentModal, setShowPaymentModal,
    handleAddToCart, handleBuyNow,
  };
}
