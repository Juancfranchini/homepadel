'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { PosFormData } from './posSchema';
import {
  CashSession,
  CreatedSale,
  PosBranch,
  PosCartItem,
  PosCustomer,
  PosProduct,
  PosVariant,
  SalesLink,
  SavedCart,
} from './types';

function errorMessage(error: unknown): string {
  const message = (error as { response?: { data?: { message?: string | string[] } } })?.response
    ?.data?.message;
  return Array.isArray(message)
    ? message.join('. ')
    : message || 'No se pudo completar la operación';
}

function buildPayload(data: PosFormData, cart: PosCartItem[], session: CashSession | null) {
  return {
    items: cart.map((item) => ({
      productId: item.product.id,
      variantId: item.variant?.id,
      quantity: item.quantity,
    })),
    channel: data.channel,
    branchId: data.branchId,
    cashSessionId: session?.id,
    customerId: data.customerId || undefined,
    customer:
      !data.customerId && data.customerName
        ? {
            name: data.customerName,
            email: data.customerEmail || undefined,
            phone: data.customerPhone || undefined,
            address: data.customerAddress || undefined,
          }
        : undefined,
    discountType: data.discountValue > 0 ? data.discountType : undefined,
    discountValue: data.discountValue,
    shipping: data.shipping,
    notes: data.notes || undefined,
    payments: [
      data.paymentAmount1 > 0
        ? {
            method: data.paymentMethod1,
            amount: data.paymentAmount1,
            reference: data.paymentReference1 || undefined,
          }
        : null,
      data.paymentMethod2 !== 'NONE' && data.paymentAmount2 > 0
        ? {
            method: data.paymentMethod2,
            amount: data.paymentAmount2,
            reference: data.paymentReference2 || undefined,
          }
        : null,
    ].filter(Boolean),
  };
}

function usePosData() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [branches, setBranches] = useState<PosBranch[]>([]);
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [savedCarts, setSavedCarts] = useState<SavedCart[]>([]);
  const [salesLinks, setSalesLinks] = useState<SalesLink[]>([]);
  const [session, setSession] = useState<CashSession | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    const [config, carts, customerList, current, links] = await Promise.all([
      api.get('/pos/config'),
      api.get('/pos/carts'),
      api.get('/pos/customers'),
      api.get('/cash/sessions/current'),
      api.get('/pos/links'),
    ]);
    setBranches(config.data);
    setSavedCarts(carts.data);
    setCustomers(customerList.data);
    setSession(current.data || null);
    setSalesLinks(links.data);
  }, []);
  const search = useCallback(async (value: string) => {
    try {
      const response = await api.get('/pos/catalog', { params: { search: value } });
      setProducts(response.data);
      setError('');
    } catch (requestError) {
      setError(errorMessage(requestError));
    }
  }, []);
  useEffect(() => {
    refresh().catch((requestError) => setError(errorMessage(requestError)));
  }, [refresh]);
  useEffect(() => {
    search('');
  }, [search]);
  return {
    products,
    branches,
    customers,
    savedCarts,
    salesLinks,
    session,
    error,
    setError,
    refresh,
    search,
  };
}

function usePosCart() {
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const addItem = (product: PosProduct, variant?: PosVariant) => {
    const key = `${product.id}-${variant?.id || 'base'}`;
    setCart((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { key, product, variant, quantity: 1 }];
    });
  };
  const updateQuantity = (key: string, quantity: number) => {
    setCart((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, quantity } : item)),
    );
  };
  const resumeCart = async (saved: SavedCart) => {
    const items = await Promise.all(
      saved.items.map(async (item) => {
        const response = await api.get(`/products/${item.productId}`);
        const product = response.data as PosProduct;
        return {
          key: `${product.id}-${item.variantId || 'base'}`,
          product,
          variant: product.variants.find((variant) => variant.id === item.variantId),
          quantity: item.quantity,
        };
      }),
    );
    setCart(items);
  };
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.effectivePrice * item.quantity, 0),
    [cart],
  );
  return { cart, setCart, addItem, updateQuantity, resumeCart, subtotal };
}

function useSell(
  cart: PosCartItem[],
  session: CashSession | null,
  setCart: (items: PosCartItem[]) => void,
  search: (value: string) => Promise<void>,
  setError: (message: string) => void,
) {
  const [busy, setBusy] = useState(false);
  const [lastSale, setLastSale] = useState<CreatedSale | null>(null);
  const sell = async (data: PosFormData) => {
    if (!cart.length) return setError('Agregá al menos un producto');
    setBusy(true);
    setError('');
    try {
      const response = await api.post('/pos/sales', buildPayload(data, cart, session));
      setLastSale(response.data);
      setCart([]);
      await search('');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  return { busy, lastSale, sell };
}

function useSavedCart(
  cart: PosCartItem[],
  session: CashSession | null,
  customers: PosCustomer[],
  refresh: () => Promise<void>,
) {
  return async (name: string, data: PosFormData) => {
    if (!cart.length || !name.trim()) return;
    const sale = buildPayload(data, cart, session);
    const selected = customers.find((customer) => customer.id === data.customerId);
    await api.post('/pos/carts', {
      name,
      items: sale.items,
      channel: sale.channel,
      branchId: sale.branchId,
      customer: selected
        ? {
            name: selected.name,
            email: selected.email,
            phone: selected.phone,
            address: selected.address,
          }
        : sale.customer,
      discountType: sale.discountType,
      discountValue: sale.discountValue,
      shipping: sale.shipping,
      notes: sale.notes,
    });
    await refresh();
  };
}

function useSalesLink(
  cart: PosCartItem[],
  session: CashSession | null,
  setError: (message: string) => void,
) {
  const [busy, setBusy] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const createLink = async (data: PosFormData) => {
    if (!cart.length) return setError('Agregá productos antes de generar el enlace');
    setBusy(true);
    setError('');
    try {
      const sale = buildPayload(data, cart, session);
      const response = await api.post('/pos/links', {
        items: sale.items,
        channel: data.channel,
        branchId: data.branchId,
        customer: sale.customer,
        notes: sale.notes,
      });
      setCheckoutUrl(response.data.checkoutUrl);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  return { busy, checkoutUrl, setCheckoutUrl, createLink };
}

export function usePos() {
  const data = usePosData();
  const cart = usePosCart();
  const sale = useSell(cart.cart, data.session, cart.setCart, data.search, data.setError);
  const saveCart = useSavedCart(cart.cart, data.session, data.customers, data.refresh);
  const link = useSalesLink(cart.cart, data.session, data.setError);
  const sell = async (form: PosFormData) => {
    link.setCheckoutUrl('');
    await sale.sell(form);
  };
  return {
    ...data,
    ...cart,
    busy: sale.busy || link.busy,
    lastSale: sale.lastSale,
    checkoutUrl: link.checkoutUrl,
    sell,
    saveCart,
    createLink: link.createLink,
  };
}
