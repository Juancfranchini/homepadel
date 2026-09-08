import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { schema, ProductFormData, Variant, Props, getImageUrl, mensajeDeError } from './schema';

function useImageState(defaultValues?: Partial<ProductFormData>) {
  const [uploading, setUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(Array.isArray(defaultValues?.images) ? (defaultValues.images as string[]).slice(1) : []);
  const [mainImage, setMainImage] = useState<string>(Array.isArray(defaultValues?.images) ? (defaultValues.images as string[])[0] || '' : '');

  const handleUpload = async (onError: (msg: string) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/uploads/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMainImage(res.data?.url || res.data?.imageUrl || '');
      } catch (err) {
        onError(mensajeDeError(err, 'No se pudo subir la imagen'));
      } finally { setUploading(false); }
    };
    input.click();
  };

  return { uploading, galleryImages, setGalleryImages, mainImage, setMainImage, handleUpload };
}

function validateVariants(variants: Variant[], hasSize: boolean, hasColor: boolean, hasDimensions: boolean, hasWeight: boolean): string | null {
  const skuSet = new Set<string>();
  for (const v of variants) {
    if (hasSize && !v.size.trim()) return 'Todas las variantes deben tener talle';
    if (hasColor && !v.color?.trim()) return 'Todas las variantes deben tener color';
    if (hasDimensions && (!v.dimensionLength || !v.dimensionWidth || !v.dimensionHeight || !v.dimensionUnit)) return 'Todas las variantes deben tener largo, ancho, alto y unidad';
    if (hasWeight && (!v.weight || !v.weightUnit)) return 'Todas las variantes deben tener peso y unidad';
    if (v.sku && v.sku.trim()) {
      const skuLower = v.sku.trim().toLowerCase();
      if (skuSet.has(skuLower)) return 'SKU duplicado en variantes: ' + v.sku;
      skuSet.add(skuLower);
    }
  }
  return null;
}

export function useProductFormLogic({ defaultValues, onSave }: Pick<Props, 'defaultValues' | 'onSave'>) {
  const { toast } = useToast();
  const [variants, setVariants] = useState<Variant[]>(() => defaultValues?.variants || []);
  const [hasSalePrice, setHasSalePrice] = useState<boolean>(() => !!defaultValues?.salePrice && defaultValues.salePrice > 0);
  const salePriceTempRef = useRef<number | undefined>(defaultValues?.salePrice);
  const imageState = useImageState(defaultValues);
  const { setGalleryImages, setMainImage } = imageState;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { active: true, featured: false, isNew: false, isOffer: false, stock: 0, price: 0, categoryId: '', brandId: '' },
  });
  const { reset, watch, setValue, setError, clearErrors } = form;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      setGalleryImages(Array.isArray(defaultValues.images) ? (defaultValues.images as string[]).slice(1) : []);
      setMainImage(Array.isArray(defaultValues.images) ? (defaultValues.images as string[])[0] || '' : '');
      salePriceTempRef.current = defaultValues?.salePrice;
      setVariants(defaultValues?.variants || []);
    }
  }, [defaultValues, reset, setGalleryImages, setMainImage]);

  const toggleSalePrice = (checked: boolean) => {
    setHasSalePrice(checked);
    if (!checked) {
      clearErrors('salePrice');
      const currentVal = watch('salePrice');
      salePriceTempRef.current = typeof currentVal === 'number' ? currentVal : Number(currentVal);
      setValue('salePrice', undefined as any, { shouldDirty: true, shouldValidate: false });
    } else if (salePriceTempRef.current) {
      setValue('salePrice', salePriceTempRef.current, { shouldDirty: true });
    }
  };

  const handleFormSubmit = (data: ProductFormData) => {
    if (hasSalePrice) {
      const numVal = Number((data as any).salePrice);
      if ((data as any).salePrice === undefined || (data as any).salePrice === null || (data as any).salePrice === '' || isNaN(numVal) || numVal <= 0) {
        setError('salePrice', { type: 'manual', message: 'El precio promocional es obligatorio' });
        return;
      }
    }

    const validationError = validateVariants(variants, watch('hasSize'), watch('hasColor'), watch('hasDimensions'), watch('hasWeight'));
    if (validationError) { toast(validationError, 'error'); return; }

    const allImages = [imageState.mainImage, ...imageState.galleryImages].filter(Boolean) as string[];
    if (!hasSalePrice) {
      const cleanData: any = { ...data, salePrice: undefined };
      onSave({ ...cleanData, images: allImages, variants });
    } else {
      onSave({ ...data, images: allImages, variants });
    }
  };

  return { form, variants, setVariants, hasSalePrice, toggleSalePrice, imageState, handleFormSubmit, getImageUrl };
}
