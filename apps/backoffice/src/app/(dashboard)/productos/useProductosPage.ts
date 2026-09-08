import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useToast } from '@/components/ui/Toast';
import { ProductAdvancedFilters } from './components/ProductAdvancedSearchModal';
import { ProductFormData } from './components/ProductForm';

export interface Product {
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
  hasSize?: boolean;
  hasColor?: boolean;
  hasDimensions?: boolean;
  hasWeight?: boolean;
  size?: string;
  color?: string;
  dimensionLength?: number;
  dimensionWidth?: number;
  dimensionHeight?: number;
  dimensionUnit?: string;
  weight?: number;
  weightUnit?: string;
  variants?: { sku: string; size: string; color?: string; dimensions?: string; dimensionLength?: number; dimensionWidth?: number; dimensionHeight?: number; dimensionUnit?: string; weight?: number; weightUnit?: string; imageUrl?: string; images?: string[]; stock: number }[];
}

export interface Category { id: string; name: string }
export interface Brand { id: string; name: string }

function useProductsData() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch {
      toast('No se pudieron cargar los productos. Revisá la conexión con el servidor.', 'error');
    } finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return { products, categories, brands, loading, load };
}

function buildDefaultFormValues(editItem: Product | null) {
  if (!editItem) return undefined;
  return {
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
    hasSize: editItem.hasSize || false,
    hasColor: editItem.hasColor || false,
    hasDimensions: editItem.hasDimensions || false,
    hasWeight: editItem.hasWeight || false,
    size: editItem.size || '',
    color: editItem.color || '',
    dimensionLength: editItem.dimensionLength || undefined,
    dimensionWidth: editItem.dimensionWidth || undefined,
    dimensionHeight: editItem.dimensionHeight || undefined,
    dimensionUnit: editItem.dimensionUnit || 'cm',
    weight: editItem.weight || undefined,
    weightUnit: editItem.weightUnit || 'kg',
    variants: editItem.variants?.filter((variant: any) => variant.id !== `${editItem.id}-base`) || [],
  };
}

export function useProductosPage() {
  const { toast } = useToast();
  const { products, categories, brands, loading, load } = useProductsData();
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
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 3 : 10;
  useEffect(() => { setCurrentPage(1); }, [isMobile]);

  const openCreate = () => { setEditItem(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditItem(p); setModalOpen(true); };

  const handleSave = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = editItem
        ? { ...data, variants: data.variants?.filter((variant) => variant.id !== `${editItem.id}-base`) }
        : data;
      if (editItem) { await api.patch('/products/' + editItem.id, payload); toast('Producto actualizado', 'success'); }
      else { await api.post('/products', payload); toast('Producto creado', 'success'); }
      setModalOpen(false); load();
    } catch (error: any) {
      const rawMessage = error?.response?.data?.message;
      const message = Array.isArray(rawMessage) ? rawMessage.join(' · ') : rawMessage;
      toast(message || 'Error al guardar', 'error');
    } finally { setSaving(false); }
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

  const toggleSort = (field: string) => { setSortField(field); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); };

  const filtered = products.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField as keyof Product] ?? '';
    const bVal = b[sortField as keyof Product] ?? '';
    if (sortField === 'price' || sortField === 'stock') return sortDir === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const defaultFormValues = buildDefaultFormValues(editItem);

  return {
    products, categories, brands, loading, modalOpen, setModalOpen, editItem, deleteTarget, setDeleteTarget,
    detailItem, setDetailItem, deleting, saving, search, setSearch, advancedOpen, setAdvancedOpen,
    advancedFilters, setAdvancedFilters, sortField, sortDir, currentPage, setCurrentPage,
    openCreate, openEdit, handleSave, toggleFeatured, toggleActive, handleDelete, toggleSort,
    filtered, totalPages, paginated, defaultFormValues,
  };
}
