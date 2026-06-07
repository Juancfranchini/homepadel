// Products management page for the Home Pádel BackOffice.
// Full CRUD with TanStack Table for listing (with pagination, search, category filter),
// a modal form for create/edit (react-hook-form + Zod), and a delete confirmation dialog.
// All API calls go to /api/products and /api/categories, /api/brands.

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, Star, ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { ActiveBadge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  images?: string[];
  description?: string;
}

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

// ─── Form schema ──────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'El precio debe ser positivo'),
  salePrice: z.coerce.number().min(0).optional(),
  sku: z.string().min(1, 'El SKU es requerido'),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isOffer: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
type ProductForm = z.infer<typeof productSchema>;

// ─── Column helper ────────────────────────────────────────────────────────────
const col = createColumnHelper<Product>();

// ─── Page component ───────────────────────────────────────────────────────────
export default function ProductosPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({ resolver: zodResolver(productSchema) });

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/brands'),
      ]);
      const p = pRes.data?.data ?? pRes.data;
      const c = cRes.data?.data ?? cRes.data;
      const b = bRes.data?.data ?? bRes.data;
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
      setBrands(Array.isArray(b) ? b : []);
    } catch {
      // Fall back to empty arrays — show mock placeholders
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
      setBrands(MOCK_BRANDS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtered data ───────────────────────────────────────────────────────────
  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category?.id === categoryFilter;
    return matchSearch && matchCat;
  });

  // ── Table ────────────────────────────────────────────────────────────────────
  const columns = [
    col.accessor('images', {
      header: 'Imagen',
      cell: (info) => {
        const img = (info.getValue() ?? [])[0];
        return img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="producto" className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-gray-400" />
          </div>
        );
      },
    }),
    col.accessor('name', { header: 'Nombre', cell: (i) => <span className="font-medium text-gray-900">{i.getValue()}</span> }),
    col.accessor('sku', { header: 'SKU', cell: (i) => <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{i.getValue()}</code> }),
    col.accessor('category', { header: 'Categoría', cell: (i) => i.getValue()?.name ?? '—' }),
    col.accessor('brand', { header: 'Marca', cell: (i) => i.getValue()?.name ?? '—' }),
    col.accessor('price', { header: 'Precio', cell: (i) => <span className="font-semibold">{formatPrice(i.getValue())}</span> }),
    col.accessor('stock', {
      header: 'Stock',
      cell: (i) => (
        <span className={`font-medium ${i.getValue() === 0 ? 'text-red-500' : i.getValue() < 5 ? 'text-yellow-600' : 'text-gray-700'}`}>
          {i.getValue()}
        </span>
      ),
    }),
    col.accessor('isFeatured', {
      header: 'Destacado',
      cell: (i) => i.getValue() ? <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> : <span className="text-gray-300">—</span>,
    }),
    col.accessor('isActive', { header: 'Activo', cell: (i) => <ActiveBadge active={i.getValue()} /> }),
    col.display({
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openEdit(row.original)}
            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row.original)}
            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // ── CRUD helpers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditProduct(null);
    reset({ isActive: true, isFeatured: false, isNew: false, isOffer: false, stock: 0, price: 0 });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    reset({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      salePrice: p.salePrice,
      sku: p.sku,
      stock: p.stock,
      categoryId: p.category?.id ?? '',
      brandId: p.brand?.id ?? '',
      isFeatured: p.isFeatured,
      isNew: p.isNew ?? false,
      isOffer: p.isOffer ?? false,
      isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: ProductForm) => {
    setSaving(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, data);
        toast('Producto actualizado correctamente', 'success');
      } else {
        await api.post('/products', data);
        toast('Producto creado correctamente', 'success');
      }
      setModalOpen(false);
      loadData();
    } catch {
      toast('Error al guardar el producto', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      toast('Producto eliminado', 'success');
      setDeleteTarget(null);
      loadData();
    } catch {
      toast('Error al eliminar el producto', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{filtered.length} productos encontrados</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40 focus:border-[#C8FF00]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#C8FF00]/40"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? 'Editar producto' : 'Nuevo producto'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input {...register('name')} className="input-field" placeholder="Pala Bullpadel Vertex..." />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea {...register('description')} rows={3} className="input-field resize-none" placeholder="Descripción del producto..." />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <input type="number" {...register('price')} className="input-field" placeholder="0" />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
            </div>

            {/* Sale price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio oferta</label>
              <input type="number" {...register('salePrice')} className="input-field" placeholder="0" />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
              <input {...register('sku')} className="input-field" placeholder="BP-VTX-03" />
              {errors.sku && <p className="text-xs text-red-600 mt-1">{errors.sku.message}</p>}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
              <input type="number" {...register('stock')} className="input-field" placeholder="0" />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Seleccionar categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <select {...register('brandId')} className="input-field">
                <option value="">Seleccionar marca</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Image upload placeholder */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
              <label className="flex items-center justify-center gap-2 w-full py-8 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#C8FF00] transition-colors text-gray-400 hover:text-gray-600">
                <ImageIcon className="w-5 h-5" />
                <span className="text-sm">Hacer clic para subir imagen</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isFeatured" {...register('isFeatured')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">Destacado</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isNew" {...register('isNew')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isNew" className="text-sm text-gray-700">Badge NUEVO</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isOffer" {...register('isOffer')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isOffer" className="text-sm text-gray-700">Badge OFERTA</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" {...register('isActive')} className="w-4 h-4 rounded accent-[#C8FF00]" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Activo</label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Guardando...' : editProduct ? 'Actualizar' : 'Crear producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description={`¿Estás seguro de que querés eliminar "${deleteTarget?.name}"? Esta acción no se puede deshacer.`}
        isLoading={deleting}
      />

      {/* Global btn/input styles via style tag (Tailwind JIT classes) */}
      <style jsx global>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #111827;
          outline: none;
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .input-field:focus {
          border-color: #C8FF00;
          box-shadow: 0 0 0 3px rgba(200, 255, 0, 0.15);
        }
        .btn-primary {
          padding: 0.5rem 1rem;
          background: #C8FF00;
          color: #0f172a;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          transition: background 0.15s;
        }
        .btn-primary:hover { background: #b8ef00; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-secondary {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          color: #374151;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: background 0.15s;
        }
        .btn-secondary:hover { background: #f9fafb; }
      `}</style>
    </div>
  );
}

// ─── Mock fallback data ───────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Pala Bullpadel Vertex 03', sku: 'BP-VTX-03', price: 85000, stock: 12, isActive: true, isFeatured: true, category: { id: '1', name: 'Palas' }, brand: { id: '1', name: 'Bullpadel' } },
  { id: '2', name: 'Zapatillas Nox AT10 Lux', sku: 'NOX-AT10-L', price: 52000, stock: 8, isActive: true, isFeatured: false, category: { id: '2', name: 'Zapatillas' }, brand: { id: '2', name: 'Nox' } },
  { id: '3', name: 'Pelotas Dunlop Pro x3', sku: 'DUN-PRO-3', price: 3200, stock: 50, isActive: true, isFeatured: false, category: { id: '3', name: 'Pelotas' }, brand: { id: '3', name: 'Dunlop' } },
];
const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Palas' },
  { id: '2', name: 'Zapatillas' },
  { id: '3', name: 'Pelotas' },
  { id: '4', name: 'Accesorios' },
];
const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Bullpadel' },
  { id: '2', name: 'Nox' },
  { id: '3', name: 'Dunlop' },
  { id: '4', name: 'Adidas' },
];
