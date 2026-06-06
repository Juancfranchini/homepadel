import {
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

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// ─── data fetching ────────────────────────────────────────────────────────────

async function fetchAll() {
  const [
    slidesRes,
    benefitsRes,
    productsRes,
    categoriesRes,
    brandsRes,
    bannersRes,
    testimonialsRes,
    promotionsRes,
    aboutRes,
    instagramRes,
    finalMsgRes,
  ] = await Promise.allSettled([
    getHeroSlides(),
    getBenefits(),
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
    getBanners(),
    getTestimonials(),
    getPromotions(),
    getSiteSection('about'),
    getSiteSection('instagram'),
    getSiteSection('final_message'),
  ]);

  const val = (r: PromiseSettledResult<unknown>) =>
    r.status === 'fulfilled' ? r.value : null;

  return {
    heroSlides: arr<HeroSlide>(val(slidesRes)),
    benefits: arr<Benefit>(val(benefitsRes)),
    featuredProducts: arr<Product>(val(productsRes)),
    categories: arr<Category>(val(categoriesRes)),
    brands: arr<Brand>(val(brandsRes)),
    banners: arr<Banner>(val(bannersRes)),
    testimonials: arr<Testimonial>(val(testimonialsRes)),
    promotions: arr<Promotion>(val(promotionsRes)),
    aboutData: sectionData<AboutData>(val(aboutRes)),
    instagramConfig: sectionData<InstagramConfig>(val(instagramRes)),
    finalMessageData: sectionData<FinalMessageData>(val(finalMsgRes)),
  };
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const {
    heroSlides,
    benefits,
    featuredProducts,
    categories,
    brands,
    banners,
    testimonials,
    promotions,
    aboutData,
    instagramConfig,
    finalMessageData,
  } = await fetchAll();

  // Banners secundarios (PromoBanners) — todos los banners ordenados
  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);

  // Promoción destacada — la primera activa y no expirada
  const now = new Date();
  const activePromotion =
    promotions.find(
      (p) => p.active && p.endDate && new Date(p.endDate) > now
    ) ?? null;

  return (
    <>
      {/* 1 · Carrusel hero */}
      <HeroBanner slides={heroSlides} />

      {/* 2 · Barra de beneficios */}
      <BenefitsStrip benefits={benefits} />

      {/* 3 · Promoción destacada con countdown */}
      <PromoDestacada promotion={activePromotion} />

      {/* 4 · Categorías */}
      <CategoryCards categories={categories} />

      {/* 5 · Productos destacados */}
      <FeaturedProducts products={featuredProducts} />

      {/* 6 · Banners secundarios */}
      <PromoBanners banners={sortedBanners} />

      {/* 7 · Quiénes somos */}
      <AboutSection data={aboutData} />

      {/* 8 · Testimonios */}
      <TestimonialsSection testimonials={testimonials} />

      {/* 9 · Marcas (slider) */}
      <BrandsSection brands={brands} />

      {/* 10 · Instagram */}
      <InstagramSection config={instagramConfig} />

      {/* 11 · Mensaje final / CTA */}
      <FinalMessage data={finalMessageData} />
    </>
  );
}
