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
    aboutRes,
    instagramRes,
    finalMsgRes,
    categoriesSectionRes,
  ] = await Promise.allSettled([
    getHeroSlides(),
    getBenefits(),
    getBestSellers(),
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
    getBanners(),
    getTestimonials(),
    getPromotions(),
    getSiteSection('about'),
    getSiteSection('instagram'),
    getSiteSection('final_message'),
    getSiteSection('categories'),
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
    aboutData: sectionData<AboutData>(val(aboutRes)),
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
    aboutData,
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
      <HeroBanner slides={heroSlides} />

      <BenefitsStrip benefits={benefits} />

      <PromoDestacada promotion={activePromotion} />

      {showCategories && (
        <CategoryCards
          categories={categories}
          title={categoriesSection?.title}
          description={categoriesSection?.description}
        />
      )}

      <FeaturedProducts products={productsToShow} mode={productMode} />

      <PromoBanners banners={sortedBanners} />

      <AboutSection data={aboutData} />

      <TestimonialsSection testimonials={testimonials} />

      <BrandsSection brands={brands} />

      <InstagramSection config={instagramConfig} />

      <FinalMessage data={finalMessageData} />
    </>
  );
}
