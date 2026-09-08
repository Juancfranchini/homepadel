'use client';

import { useProductForm } from './product-form/useProductForm';
import FormTopBar from './product-form/FormTopBar';
import BasicInfoSection from './product-form/BasicInfoSection';
import PricingSection from './product-form/PricingSection';
import ImagesSection from './product-form/ImagesSection';
import PerformanceSection from './product-form/PerformanceSection';
import FeaturesSection from './product-form/FeaturesSection';
import VideoSection from './product-form/VideoSection';
import HighlightsSection from './product-form/HighlightsSection';
import PaymentMethodsSection from './product-form/PaymentMethodsSection';
import StatusSidebar from './product-form/StatusSidebar';
import PricePreviewCard from './product-form/PricePreviewCard';
import SaveActions from './product-form/SaveActions';

interface Props {
  mode: 'create' | 'edit';
  productId?: string;
}

export default function ProductForm({ mode, productId }: Props) {
  const {
    router, categories, brands, loading, saving, newImageUrl, setNewImageUrl, newHighlight, setNewHighlight,
    register, handleSubmit, watch, setValue, errors, perfArray, featuresArray, imagesWatch, highlightsWatch, paymentWatch,
    addImage, removeImage, onSubmit,
  } = useProductForm(mode, productId);

  const goBack = () => router.push('/productos');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-[#C8FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormTopBar mode={mode} saving={saving} onBack={goBack} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <BasicInfoSection register={register} errors={errors} categories={categories} brands={brands} />
          <PricingSection register={register} errors={errors} />
          <ImagesSection imagesWatch={imagesWatch} newImageUrl={newImageUrl} setNewImageUrl={setNewImageUrl} onAdd={addImage} onRemove={removeImage} />
          <PerformanceSection register={register} watch={watch} perfArray={perfArray} />
          <FeaturesSection register={register} featuresArray={featuresArray} />
          <VideoSection register={register} watch={watch} />
          <HighlightsSection highlightsWatch={highlightsWatch} newHighlight={newHighlight} setNewHighlight={setNewHighlight} setValue={setValue} />
          <PaymentMethodsSection paymentWatch={paymentWatch} setValue={setValue} />
        </div>

        <div className="space-y-6">
          <StatusSidebar register={register} />
          <PricePreviewCard watch={watch} />
          <SaveActions mode={mode} saving={saving} onCancel={goBack} />
        </div>
      </div>
    </form>
  );
}
