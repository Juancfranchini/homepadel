import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { schema, FormValues, Category, Brand } from './schema';

function useCatalogs() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const loadCatalogs = useCallback(async () => {
    try {
      const [cRes, bRes] = await Promise.all([api.get('/categories'), api.get('/brands')]);
      const c = cRes.data?.data ?? cRes.data;
      const b = bRes.data?.data ?? bRes.data;
      setCategories(Array.isArray(c) ? c : []);
      setBrands(Array.isArray(b) ? b : []);
    } catch {
      setCategories([]);
      setBrands([]);
    }
  }, []);

  return { categories, brands, loadCatalogs };
}

function useEditingProduct(mode: 'create' | 'edit', productId: string | undefined, reset: (v: FormValues) => void) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(mode === 'edit');

  const loadProduct = useCallback(async () => {
    if (mode !== 'edit' || !productId) return;
    setLoading(true);
    try {
      const res = await api.get(`/products/${productId}`);
      const p = res.data;
      reset({
        name: p.name, description: p.description ?? '', sku: p.sku,
        categoryId: p.category?.id ?? p.categoryId ?? '', brandId: p.brand?.id ?? p.brandId ?? '',
        featured: p.featured ?? false, isNew: p.isNew ?? false, isOffer: p.isOffer ?? false, active: p.active ?? true,
        price: p.price ?? 0, salePrice: p.salePrice ?? undefined, transferPrice: p.transferPrice ?? undefined,
        stock: p.stock ?? 0, images: Array.isArray(p.images) ? p.images : [],
        performanceStats: Array.isArray(p.performanceStats) ? p.performanceStats : [],
        features: Array.isArray(p.features) ? p.features : [],
        highlights: Array.isArray(p.highlights) ? p.highlights : [],
        paymentMethods: Array.isArray(p.paymentMethods) ? p.paymentMethods : [],
        videoUrl: p.videoUrl ?? '',
      });
    } catch {
      toast('Error al cargar el producto', 'error');
      router.push('/productos');
    } finally {
      setLoading(false);
    }
  }, [mode, productId, reset, toast, router]);

  return { loading, loadProduct };
}

export function useProductForm(mode: 'create' | 'edit', productId?: string) {
  const { toast } = useToast();
  const router = useRouter();
  const { categories, brands, loadCatalogs } = useCatalogs();
  const [saving, setSaving] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newHighlight, setNewHighlight] = useState('');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors }, control } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      active: true, featured: false, isNew: false, isOffer: false,
      stock: 0, price: 0, images: [], performanceStats: [], features: [],
    },
  });

  const { loading, loadProduct } = useEditingProduct(mode, productId, reset);
  const perfArray = useFieldArray({ control, name: 'performanceStats' });
  const featuresArray = useFieldArray({ control, name: 'features' });
  const imagesWatch = watch('images') ?? [];
  const highlightsWatch = watch('highlights') ?? [];
  const paymentWatch = watch('paymentMethods') ?? [];

  useEffect(() => { loadCatalogs(); loadProduct(); }, [loadCatalogs, loadProduct]);

  const addImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    setValue('images', [...imagesWatch, url]);
    setNewImageUrl('');
  };

  const removeImage = (idx: number) => setValue('images', imagesWatch.filter((_, i) => i !== idx));

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        ...data,
        salePrice: data.salePrice && data.salePrice > 0 ? data.salePrice : undefined,
        transferPrice: data.transferPrice && data.transferPrice > 0 ? data.transferPrice : undefined,
        videoUrl: data.videoUrl?.trim() || undefined,
        images: data.images ?? [], performanceStats: data.performanceStats ?? [], features: data.features ?? [],
        highlights: data.highlights ?? [], paymentMethods: data.paymentMethods ?? [],
      };
      if (mode === 'create') {
        await api.post('/products', payload);
        toast('Producto creado correctamente', 'success');
      } else {
        await api.patch(`/products/${productId}`, payload);
        toast('Producto actualizado correctamente', 'success');
      }
      router.push('/productos');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const raw = axiosErr.response?.data?.message ?? 'Error al guardar el producto';
      const msg = Array.isArray(raw) ? raw.join(' · ') : String(raw);
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    router, categories, brands, loading, saving, newImageUrl, setNewImageUrl, newHighlight, setNewHighlight,
    register, handleSubmit, watch, setValue, errors, perfArray, featuresArray, imagesWatch, highlightsWatch, paymentWatch,
    addImage, removeImage, onSubmit,
  };
}
