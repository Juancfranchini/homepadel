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
  transferPrice?: number;
  discountPercentage?: number;
  installments?: number;
  installmentsInterest?: number;
  hasInstallmentsInterest?: boolean;
  isMadeToOrder?: boolean;
  estimatedDays?: number;
  requiredDeposit?: number;
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
  variants?: { sku: string; size: string; color?: string; imageUrl?: string; images?: string[]; stock: number }[];
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
  const [isMobile, setIsMobile] = useState(false);
  const pageSize = isMobile ? 3 : 10;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes, bRes] = await Promise.all([
        api.get('/products?showAll=1&limit=200'),
        api.get('/categories/admin/all'),
        api.get('/brands/admin/all'),
      ]);
      const pData = pRes.data?.items || pRes.data?.data || pRes.data || [];
      setProducts(Array.isArray(pData) ? pData : []);
      setCategories(Array.isArray(cRes.data) ? cRes.data : []);
      setBrands(Array.isArray(bRes.data) ? bRes.data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditItem(p); setModalOpen(true); };

  const handleSave = async (data: ProductFormData) => {
    setSaving(true);
    try {
      if (editItem) { await api.patch('/products/' + editItem.id, data); toast('Producto actualizado', 'success'); }
      else { await api.post('/products', data); toast('Producto creado', 'success'); }
      setModalOpen(false); load();
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const toggleFeatured = async (p: Product) => {
    try { await api.patch('/products/' + p.id, { featured: !p.featured }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const toggleActive = async (p: Product) => {
    try { await api.patch('/products/' + p.id, { active: !p.active }); toast('Actualizado', 'success'); load(); }
    catch { toast('Error', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try { await api.delete('/products/' + deleteTarget.id); toast('Producto eliminado', 'success'); setDeleteTarget(null); load(); }
    catch { toast('Error al eliminar', 'error'); } finally { setDeleting(false); }
  };

  const sortIcon = (field: string) => (
    <ArrowUpDown className={'w-3 h-3 inline-block ' + (sortField === field ? 'text-[#C8FF00]' : 'text-gray-400')} />
  );

  const filtered = products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField as keyof Product] ?? '';
    const bVal = b[sortField as keyof Product] ?? '';
    if (sortField === 'price') return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    if (sortField === 'stock') return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const defaultFormValues = editItem ? {
    name: editItem.name, sku: editItem.sku, price: editItem.price, salePrice: editItem.salePrice || undefined,
    transferPrice: editItem.transferPrice || undefined,
    stock: editItem.stock, active: editItem.active, featured: editItem.featured,
    isNew: editItem.isNew || false, isOffer: editItem.isOffer || false,
    categoryId: editItem.category?.id || editItem.categoryId || '',
    brandId: editItem.brand?.id || editItem.brandId || '',
    description: editItem.description || '',
    images: editItem.images || [],
    discountPercentage: editItem.discountPercentage || undefined,
    installments: editItem.installments || undefined,
    installmentsInterest: editItem.installmentsInterest || undefined,
    hasInstallmentsInterest: editItem.hasInstallmentsInterest || false,
    isMadeToOrder: editItem.isMadeToOrder || false,
    estimatedDays: editItem.estimatedDays || undefined,
    requiredDeposit: editItem.requiredDeposit || undefined,
    variants: editItem.variants || [],
  } : undefined;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center justify-between lg:justify-start gap-3 lg:shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm">{filtered.length} registros</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto lg:flex-1 lg:max-w-2xl lg:justify-end">
          <div className="flex-1 min-w-0">
            <ProductSearchBar
              value={search}
              onChange={setSearch}
              onAdvancedSearch={() => setAdvancedOpen(true)}
              hasAdvancedFilters={advancedFilters !== null}
              onClearFilters={() => { setAdvancedFilters(null); setAdvancedOpen(false); }}
            />
          </div>
          <button onClick={openCreate} className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg font-semibold text-sm hover:bg-[#b8ef00] transition-colors whitespace-nowrap shrink-0">
            <Plus className="w-4 h-4" />
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {paginated.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center"><p className="text-gray-400 text-sm">No se encontraron productos</p></div>
      ) : (
        <div>
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Imagen</th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                      <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => { setSortField('name'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>Nombre {sortIcon('name')}</span>
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                      <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => { setSortField('price'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>Precio {sortIcon('price')}</span>
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Promo</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Transf.</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                      <span className="inline-flex items-center gap-1 cursor-pointer" onClick={() => { setSortField('stock'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>Stock {sortIcon('stock')}</span>
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Destacado</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Activo</th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase">Opciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => {
                    const imgSrc = getImageUrl(p.images?.[0]);
                    return (
                      <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-3">
                          {imgSrc ? (
                            <img src={imgSrc} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                          )}
                        </td>
                        <td className="px-3 py-3"><p className="text-gray-900 font-medium text-sm">{p.name}</p></td>
                        <td className="px-3 py-3 text-sm text-gray-500">{p.category?.name || '-'}</td>
                        <td className="px-3 py-3 text-center font-semibold text-sm">{formatPrice(p.price)}</td>
                        <td className="px-3 py-3 text-center">
                          {p.salePrice && p.salePrice < p.price ? (
                            <p className="text-green-600 font-semibold text-sm">{formatPrice(p.salePrice)}</p>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-3 py-3 text-center">
                          {p.transferPrice && p.transferPrice > 0 ? (
                            <p className="text-blue-600 font-semibold text-sm">{formatPrice(p.transferPrice)}</p>
                          ) : <span className="text-gray-400">-</span>}
                        </td>
                        <td className="px-3 py-3 text-center"><span className={'text-sm font-medium ' + (p.stock <= 5 ? 'text-red-500' : 'text-gray-700')}>{p.stock}</span></td>
                        <td className="px-3 py-3 text-center">
                          <button onClick={() => toggleFeatured(p)} className="focus:outline-none" title={p.featured ? 'Quitar destacado' : 'Destacar'}>
                            <Star className={'w-5 h-5 ' + (p.featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
                          </button>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Toggle checked={p.active} onChange={() => toggleActive(p)} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                            <button onClick={() => setDetailItem(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50" title="Ver detalle"><ArrowRight className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3">
            {paginated.map((p) => {
              const imgSrc = getImageUrl(p.images?.[0]);
              return (
                <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {imgSrc ? (
                        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.category?.name || '-'}</p>
                    </div>
                    <div className="shrink-0">
                      <Toggle checked={p.active} onChange={() => toggleActive(p)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Precio</p>
                      <p className="font-semibold text-gray-900">{formatPrice(p.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Precio Promo</p>
                      {p.salePrice && p.salePrice < p.price ? (
                        <p className="font-semibold text-green-600">{formatPrice(p.salePrice)}</p>
                      ) : <p className="text-gray-400">-</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Transf./Dep.</p>
                      {p.transferPrice && p.transferPrice > 0 ? (
                        <p className="font-semibold text-blue-600">{formatPrice(p.transferPrice)}</p>
                      ) : <p className="text-gray-400">-</p>}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Stock</p>
                      <p className={'font-semibold ' + (p.stock <= 5 ? 'text-red-500' : 'text-gray-900')}>{p.stock}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <button onClick={() => toggleFeatured(p)} className="focus:outline-none" title={p.featured ? 'Quitar destacado' : 'Destacar'}>
                      <Star className={'w-6 h-6 ' + (p.featured ? 'text-[#C8FF00] fill-[#C8FF00]' : 'text-gray-300')} />
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg text-[#C8FF00] hover:bg-[#C8FF00]/10" title="Editar"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-red-400 hover:bg-red-400/10" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Editar producto' : 'Nuevo producto'} size="xl">
          <ProductForm
            key={editItem?.id || 'nuevo'}
            defaultValues={defaultFormValues}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
            saving={saving}
            categories={categories}
            brands={brands}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description={'Eliminar "' + (deleteTarget?.name || '') + '"? Esta accion no se puede deshacer.'}
        isLoading={deleting}
      />

      {advancedOpen && (
        <ProductAdvancedSearchModal
          isOpen={advancedOpen}
          onClose={() => setAdvancedOpen(false)}
          onApply={(filters) => { setAdvancedFilters(filters); setAdvancedOpen(false); }}
          categories={categories}
          brands={brands}
        />
      )}
    </div>
  );
}
