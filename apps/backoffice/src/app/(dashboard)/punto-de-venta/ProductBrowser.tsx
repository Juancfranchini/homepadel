'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { PackagePlus, Plus, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { BarcodeScanner } from './BarcodeScanner';
import { PosProduct, PosVariant } from './types';

interface Props {
  products: PosProduct[];
  onSearch: (value: string) => void;
  onAdd: (product: PosProduct, variant?: PosVariant) => void;
}

export function ProductBrowser({ products, onSearch, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch(query);
  };
  const scan = (value: string) => {
    setQuery(value);
    onSearch(value);
  };
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-gray-900">Productos</h2>
          <p className="text-xs text-gray-500">Buscá por nombre, SKU o código de barras</p>
        </div>
        <Link
          href="/productos/nuevo"
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <PackagePlus className="h-4 w-4" /> Crear
        </Link>
      </div>
      <form onSubmit={submit} className="mb-4 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar producto</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-[#C8FF00] focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/20"
            placeholder="Producto, SKU o código…"
          />
        </label>
        <BarcodeScanner onDetected={scan} />
      </form>
      <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
        {products.map((product) => (
          <ProductRow key={product.id} product={product} onAdd={onAdd} />
        ))}
        {!products.length && (
          <p className="py-16 text-center text-sm text-gray-400">No se encontraron productos</p>
        )}
      </div>
    </section>
  );
}

function ProductRow({ product, onAdd }: { product: PosProduct; onAdd: Props['onAdd'] }) {
  const variants = product.variants.filter((variant) => !variant.isDefault && variant.active);
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-500">
            {product.sku} · Stock {product.isMadeToOrder ? 'por encargo' : product.stock}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold text-gray-900">
          {formatPrice(product.effectivePrice)}
        </p>
      </div>
      {variants.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {variants.map((variant) => (
            <button
              type="button"
              key={variant.id}
              disabled={!product.isMadeToOrder && variant.stock < 1}
              onClick={() => onAdd(product, variant)}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium hover:border-[#C8FF00] disabled:opacity-40"
            >
              <Plus className="mr-1 inline h-3 w-3" />
              {[variant.size, variant.color].filter(Boolean).join(' / ') || variant.sku} (
              {variant.stock})
            </button>
          ))}
        </div>
      ) : (
        <button
          type="button"
          disabled={!product.isMadeToOrder && product.stock < 1}
          onClick={() => onAdd(product)}
          className="mt-2 flex items-center gap-1 rounded-lg bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1e293b] disabled:opacity-40"
        >
          <Plus className="h-3 w-3" /> Agregar
        </button>
      )}
    </div>
  );
}
