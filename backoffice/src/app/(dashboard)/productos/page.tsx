'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, ArrowUpDown, ArrowRight, ImageIcon, Star } from 'lucide-react';
import api from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/components/ui/Toast';
import Toggle from '../testimonios/components/Toggle';
import ProductSearchBar from './components/ProductSearchBar';
import ProductAdvancedSearchModal, { ProductAdvancedFilters } from './components/ProductAdvancedSearchModal';
import ProductDetailModal from './components/ProductDetailModal';
import ProductForm, { ProductFormData } from './components/ProductForm';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  return API_BASE + (path.startsWith('/') ? '' : '/') + path;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  active: boolean;
  featured: boolean;
  isNew?: boolean;
  isOffer?: boolean;
  images: string[];
  category?: { id: string; name: string };
  brand?: { id: string; name: string };
  categoryId?: string;
  brandId?: string;
  description?: string;
}

interface Category { id: string; name: string }
interface Brand { id: string; name: string }

export default function ProductosPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<ProductAdvancedFilters | null>(null);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products?showAll=1&limit=200'),
        api.get('/categories'),
        api.get('/brands'),
      ]);
      setProducts(Array.isArray(pRes.data?.items) ? pRes.data.items : Array.isArray(pRes.data?.data) ? pRes.data.data : Array.isArray(pRes.data) ? pRes.data : []);
      setCategories(Array.isArray(cRes.data?.data) ? cRes.data.data : Array.isArray(cRes.data) ? cRes.data : []);
      setBrands(Array.isArray(bRes.data?.data) ? bRes.data.data : Array.isArray(bRes.data) ? bRes.data : []);
    } catch { setProducts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditItem(p); setModalOpen(true); };

  const handleSave = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = { ...data, images: data.images ? [data.images] : [] };
      if (editItem) {
        await api.patch('/products/' + editItem.id, payload);
        toast('Producto actualizado', 'success');
      } else {
        await api.post('/products', payload);
        toast('Producto creado', 'success');
      }
      setModalOpen(false);
      load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleActive = async (p: Product) => {
    try { await api.patch('/products/' + p.id, { active: !p.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const toggleFeatured = async (p: Product) => {
    try { await api.patch('/products/' + p.id, { featured: !p.featured }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/products/' + deleteTarget.id); toast('Eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error', 'error'); } finally { setDeleting(false); }
  };

  const handleSort = (field: string) => {
    if (sortField === field) { setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 cursor-pointer flex-shrink-0 ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} onClick={() => handleSort(field)} />
  );

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    if (!advancedFilters) return matchSearch;
    const matchCat = advancedFilters.categoryId ? (p.categoryId === advancedFilters.categoryId || p.category?.id === advancedFilters.categoryId) : true;
    const matchBrand = advancedFilters.brandId ? (p.brandId === advancedFilters.brandId || p.brand?.id === advancedFilters.brandId) : true;
    const matchActive = advancedFilters.active !== null ? p.active === advancedFilters.active : true;
    const matchFeatured = advancedFilters.featured !== null ? p.featured === advancedFilters.featured : true;
    return matchSearch && matchCat && matchBrand && matchActive && matchFeatured;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = (a as any)[sortField] || '';
    const bVal = (b as any)[sortField] || '';
    if (sortField === 'price') return sortDir === 'asc' ? a.price - b.price : b.price - a.price;
    if (sortField === 'stock') return sortDir === 'asc' ? a.stock - b.stock : b.stock - a.stock;
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const defaultFormValues = editItem ? {
    name: editItem.name, sku: editItem.sku, price: editItem.price, salePrice: editItem.salePrice || 0,
    stock: editItem.stock, active: editItem.active, featured: editItem.featured,
    isNew: editItem.isNew || false, isOffer: editItem.isOffer || false,
    categoryId: editItem.category?.id || editItem.categoryId || '',
    brandId: editItem.brand?.id || editItem.brandId || '',
    description: editItem.description || '',
    images: editItem.images?.[0] || '',
  } : undefined;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} registros</p>
        </div>
        <div className="flex items-center gap-2">
          <ProductSearchBar
            value={search}
            onChange={setSearch}
            onAdvancedSearch={() => setAdvancedOpen(true)}
            hasAdvancedFilters={advancedFilters !== null}
            onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }}
          />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors">
            <Plus className="w-4 h-4" />Nuevo producto
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron productos</p></div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Imagen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1">Nombre {sortIcon('name')}</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Categoria</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1">Precio {sortIcon('price')}</span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio Oferta</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1">Stock {sortIcon('stock')}</span>
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Destacado</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Activo</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Opciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => {
                const imgSrc = getImageUrl(p.images?.[0]);
                return (
                <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3"><p className="text-gray-900 font-medium text-sm">{p.name}</p></td>
                  <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-center"><p className="text-gray-900 font-semibold text-sm">{formatPrice(p.price)}</p></td>
                  <td className="px-4 py-3 text-center">
                    {p.salePrice && p.salePrice < p.price ? (
                      <p className="text-green-600 font-semibold text-sm">{formatPrice(p.salePrice)}</p>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center"><span className={'text-sm font-medium ' + (p.stock <= 5 ? 'text-red-500' : 'text-gray-700')}>{p.stock}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleFeatured(p)} className="focus:outline-none" title={p.featured ? 'Quitar destacado' : 'Destacar'}>
                      {p.featured ? (
                        <Star className="w-5 h-5 text-[#C8FF00] fill-[#C8FF00]" />
                      ) : (
                        <Star className="w-5 h-5 text-[#C8FF00]" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Toggle checked={p.active} onChange={() => toggleActive(p)} />
                      <span className={'text-xs font-medium ' + (p.active ? 'text-green-600' : 'text-gray-400')}>{p.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10 transition-colors" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                      <button onClick={() => setDetailItem(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={'w-8 h-8 rounded-lg text-sm font-medium ' + (i + 1 === currentPage ? 'bg-[#C8FF00] text-[#0f172a]' : 'text-gray-500 hover:bg-gray-50')}>{i + 1}</button>
          ))}
        </div>
      )}

      {detailItem && <ProductDetailModal product={detailItem} onClose={() => setDetailItem(null)} />}

      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar producto' : 'Nuevo producto'} size="lg">
          <ProductForm
            defaultValues={defaultFormValues}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
            saving={saving}
            categories={categories}
            brands={brands}
          />
        </Modal>
      )}

      <ProductAdvancedSearchModal
        isOpen={advancedOpen}
        onClose={() => setAdvancedOpen(false)}
        onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }}
        categories={categories}
        brands={brands}
      />

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Eliminar producto" description={'Eliminar ' + (deleteTarget?.name || '') + '?'} isLoading={deleting} />
    </div>
  );
}
