'use client';

import VariantEditor from './VariantEditor';
import ImagePanel from './product-form/ImagePanel';
import VariantPropertiesSection from './product-form/VariantPropertiesSection';
import PricingFields from './product-form/PricingFields';
import DiscountInstallmentsFields from './product-form/DiscountInstallmentsFields';
import { StockOrLeadTimeField, CategoryField, MadeToOrderField, BrandField } from './product-form/CategoryStockFields';
import StatusTogglesRow from './product-form/StatusTogglesRow';
import { useProductFormLogic } from './product-form/useProductFormLogic';
import { inputClass, labelClass, Props } from './product-form/schema';
import { useToast } from '@/components/ui/Toast';

export type { ProductFormData } from './product-form/schema';

export default function ProductForm({ defaultValues, onSave, onCancel, saving, categories, brands }: Props) {
  const { toast } = useToast();
  const { form, variants, setVariants, hasSalePrice, toggleSalePrice, imageState, handleFormSubmit, getImageUrl } = useProductFormLogic({ defaultValues, onSave });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const featured = watch('featured');
  const active = watch('active');
  const isNew = watch('isNew');
  const isOffer = watch('isOffer');
  const hasSize = watch('hasSize');
  const hasColor = watch('hasColor');
  const hasDimensions = watch('hasDimensions');
  const hasWeight = watch('hasWeight');
  const hasInstallmentsInterest = watch('hasInstallmentsInterest');
  const isMadeToOrder = watch('isMadeToOrder');

  const previewUrl = getImageUrl(imageState.mainImage);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col lg:flex-row gap-4 lg:gap-0">
      <ImagePanel
        mainImage={imageState.mainImage}
        setMainImage={imageState.setMainImage}
        previewUrl={previewUrl}
        uploading={imageState.uploading}
        onUpload={() => imageState.handleUpload((msg) => toast(msg, 'error'))}
        galleryImages={imageState.galleryImages}
        setGalleryImages={imageState.setGalleryImages}
      />

      <div className="hidden lg:block ml-7 mr-5 w-px bg-gray-200 self-stretch my-2" />

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 sm:gap-y-5 content-start">
        <div>
          <label className={labelClass}>Nombre *</label>
          <input {...register('name')} className={inputClass + ' mt-1'} />
          {errors.name && <p className="text-xs text-red-600 mt-0.5">{errors.name.message}</p>}
        </div>

        <VariantPropertiesSection register={register} hasSize={hasSize} hasColor={hasColor} hasDimensions={hasDimensions} hasWeight={hasWeight} />

        <div>
          <label className={labelClass}>SKU *</label>
          <input {...register('sku')} className={inputClass + ' mt-1'} />
          {errors.sku && <p className="text-xs text-red-600 mt-0.5">{errors.sku.message}</p>}
        </div>

        <PricingFields register={register} errors={errors} hasSalePrice={hasSalePrice} onToggleSalePrice={toggleSalePrice} />

        {!isMadeToOrder && (
          <DiscountInstallmentsFields register={register} hasInstallmentsInterest={hasInstallmentsInterest}
            onToggleInterest={() => setValue('hasInstallmentsInterest', !hasInstallmentsInterest, { shouldDirty: true })} />
        )}

        <StockOrLeadTimeField register={register} isMadeToOrder={isMadeToOrder} />
        <CategoryField register={register} errors={errors} categories={categories} />
        <MadeToOrderField isMadeToOrder={isMadeToOrder} onToggle={() => setValue('isMadeToOrder', !isMadeToOrder, { shouldDirty: true })} register={register} />
        <BrandField register={register} errors={errors} brands={brands} />

        <StatusTogglesRow active={active} isNew={isNew} isOffer={isOffer} featured={featured} setValue={setValue} />

        <VariantEditor variants={variants} onChange={setVariants} inputClass={inputClass} hasSize={hasSize} hasColor={hasColor} hasDimensions={hasDimensions} hasWeight={hasWeight} />

        <div className="sm:col-span-2 flex justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-100">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-[#C8FF00] text-[#0f172a] rounded-lg text-sm font-semibold hover:bg-[#b8ef00] disabled:opacity-50 transition-colors">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
}
