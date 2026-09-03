import {
  getBestSellers,
  getFeaturedProducts,
  getCategories,
  getBrands,
  getBanners,
  getHeroSlides,
  getBenefits,
  getTestimonials,
  getPromotions,
  getSiteSection,
} from '@/lib/api';

import HeroBanner from '@/components/home/HeroBanner';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import PromoDestacada from '@/components/home/PromoDestacada';
import CategoryCards from '@/components/home/CategoryCards';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanners from '@/components/home/PromoBanners';
import AboutSection from '@/components/home/AboutSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import BrandsSection from '@/components/home/BrandsSection';
import InstagramSection from '@/components/home/InstagramSection';
import FinalMessage from '@/components/home/FinalMessage';

import {
  Product,
  Category,
  Brand,
  Banner,
  HeroSlide,
  Benefit,
  Testimonial,
  Promotion,
  AboutSection as AboutData,
  InstagramConfig,
  FinalMessageData,
  SiteSection,
} from '@/types';

export const revalidate = 60;

function arr<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  const maybe = raw as { data?: T[] };
  return maybe?.data ?? [];
}

function sectionData<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as SiteSection;
  if (s.active === false) return null;
  return (s.data as T) ?? null;
}

async function fetchAll() {
  // Helper para hacer llamadas en lotes y evitar saturar el pool de conexiones
  const batch = async <T,>(items: (() => Promise<T>)[], size = 5): Promise<PromiseSettledResult<T>[]> => {
    const results: PromiseSettledResult<T>[] = [];
    for (let i = 0; i < items.length; i += size) {
      const batchItems = items.slice(i, i + size);
      const batchResults = await Promise.allSettled(batchItems.map(fn => fn()));
      results.push(...batchResults);
    }
    return results;
  };
  const [
    slidesRes,
    benefitsRes,
    bestSellersRes,
    featuredProductsRes,
    categoriesRes,
    brandsRes,
    bannersRes,
    testimonialsRes,
    promotionsRes,
    heroSectionRes,
    benefitsSectionRes,
    promoSectionRes,
    featuredSectionRes,
    bannersSectionRes,
    aboutRes,
    testimonialsSectionRes,
    brandsSectionRes,
    instagramRes,
    finalMsgRes,
    categoriesSectionRes,
  ] = await batch([
    () => getHeroSlides(),
    () => getBenefits(),
    () => getBestSellers(),
    () => getFeaturedProducts(),
    () => getCategories(),
    () => getBrands(),
    () => getBanners(),
    () => getTestimonials(),
    () => getPromotions(),
    () => getSiteSection('hero'),
    () => getSiteSection('benefits'),
    () => getSiteSection('promo_destacada'),
    () => getSiteSection('featured_products'),
    () => getSiteSection('banners'),
    () => getSiteSection('about'),
    () => getSiteSection('testimonials'),
    () => getSiteSection('brands'),
    () => getSiteSection('instagram'),
    () => getSiteSection('final_message'),
    () => getSiteSection('categories'),
  ]);

  const val = (r: PromiseSettledResult<unknown>) =>
    r.status === 'fulfilled' ? r.value : null;

  return {
    heroSlides: arr<HeroSlide>(val(slidesRes)),
    benefits: arr<Benefit>(val(benefitsRes)),
    bestSellers: arr<Product>(val(bestSellersRes)),
    featuredProducts: arr<Product>(val(featuredProductsRes)),
    categories: arr<Category>(val(categoriesRes)),
    brands: arr<Brand>(val(brandsRes)),
    banners: arr<Banner>(val(bannersRes)),
    testimonials: arr<Testimonial>(val(testimonialsRes)),
    promotions: arr<Promotion>(val(promotionsRes)),
    heroSection: sectionData(val(heroSectionRes)),
    benefitsSection: sectionData(val(benefitsSectionRes)),
    promoSection: sectionData(val(promoSectionRes)),
    featuredSection: sectionData(val(featuredSectionRes)),
    bannersSection: sectionData(val(bannersSectionRes)),
    aboutData: sectionData<AboutData>(val(aboutRes)),
    testimonialsSection: sectionData(val(testimonialsSectionRes)),
    brandsSection: sectionData(val(brandsSectionRes)),
    instagramConfig: sectionData<InstagramConfig>(val(instagramRes)),
    finalMessageData: sectionData<FinalMessageData>(val(finalMsgRes)),
    categoriesSection: sectionData<{ title?: string; description?: string }>(val(categoriesSectionRes)),
  };
}

export default async function HomePage() {
  const {
    heroSlides,
    benefits,
    bestSellers,
    featuredProducts,
    categories,
    brands,
    banners,
    testimonials,
    promotions,
    heroSection,
    benefitsSection,
    promoSection,
    featuredSection,
    bannersSection,
    aboutData,
    testimonialsSection,
    brandsSection,
    instagramConfig,
    finalMessageData,
    categoriesSection,
  } = await fetchAll();

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  const now = new Date();
  const activePromotion =
    promotions.find(
      (p) => p.active && p.endDate && new Date(p.endDate) > now
    ) ?? null;

  const showCategories = categoriesSection !== null && categories.length > 0;

  const hasBestSellers = bestSellers.length >= 5;
  const productsToShow = hasBestSellers ? bestSellers : featuredProducts;
  const productMode: 'best_sellers' | 'featured' = hasBestSellers ? 'best_sellers' : 'featured';

  return (
    <>
      {heroSection !== null && heroSlides.length > 0 && (
        <HeroBanner slides={heroSlides} />
      )}

      {benefitsSection !== null && benefits.length > 0 && (
        <BenefitsStrip benefits={benefits} />
      )}

      {promoSection !== null && activePromotion && (
        <PromoDestacada promotion={activePromotion} />
      )}

      {showCategories && (
        <CategoryCards
          categories={categories}
          title={categoriesSection?.title}
          description={categoriesSection?.description}
        />
      )}

      {featuredSection !== null && productsToShow.length > 0 && (
        <FeaturedProducts products={productsToShow} mode={productMode} />
      )}

      {bannersSection !== null && sortedBanners.length > 0 && (
        <PromoBanners banners={sortedBanners} />
      )}

      {aboutData !== null && (
        <AboutSection data={aboutData} />
      )}

      {testimonialsSection !== null && testimonials.length > 0 && (
        <TestimonialsSection testimonials={testimonials} />
      )}

      {brandsSection !== null && brands.length > 0 && (
        <BrandsSection brands={brands} />
      )}

      {instagramConfig !== null && (
        <InstagramSection config={instagramConfig} />
      )}

      {finalMessageData !== null && (
        <FinalMessage data={finalMessageData} />
      )}
    </>
  );
}
