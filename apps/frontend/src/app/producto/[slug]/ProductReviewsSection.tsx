import OverallCustomerOpinions from './components/OverallCustomerOpinions';
import ProductReviews from './components/ProductReviews';

export default function ProductReviewsSection({ productId }: { productId: string }) {
  return (
    <section className="border-t border-[#0D0F0F] py-4 sm:py-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-semibold uppercase tracking-tight text-[#F7F6F7] mb-6">
          LO QUE DICEN NUESTROS CLIENTES
        </h2>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-[30%] flex-shrink-0">
            <OverallCustomerOpinions productId={productId} />
          </div>
          <div className="flex-1 min-w-0">
            <ProductReviews productId={productId} />
          </div>
        </div>
      </div>
    </section>
  );
}
