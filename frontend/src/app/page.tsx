import { getFeaturedProducts, getCategories, getBrands, getBanners } from '@/lib/api';
import HeroBanner from '@/components/home/HeroBanner';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import CategoryCards from '@/components/home/CategoryCards';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanners from '@/components/home/PromoBanners';
import BrandsSection from '@/components/home/BrandsSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import { Product, Category, Brand, Banner } from '@/types';

export const revalidate = 60;

function unwrapArray<ItemType>(raw: unknown): ItemType[] {
  if (Array.isArray(raw)) return raw as ItemType[];
  const maybe = raw as { data?: ItemType[] };
  return maybe?.data ?? [];
}

async function fetchAll() {
  const results = await Promise.allSettled([
    getFeaturedProducts(),
    getCategories(),
    getBrands(),
    getBanners(),
  ]);

  const getValue = (r: PromiseSettledResult<unknown>) =>
    r.status === 'fulfilled' ? r.value : [];

  return {
    featuredProducts: unwrapArray<Product>(getValue(results[0])),
    categories: unwrapArray<Category>(getValue(results[1])),
    brands: unwrapArray<Brand>(getValue(results[2])),
    banners: unwrapArray<Banner>(getValue(results[3])),
  };
}

export default async function HomePage() {
  const { featuredProducts, categories, brands, banners } = await fetchAll();

  const sortedBanners = [...banners].sort((a, b) => a.order - b.order);
  const heroBanner = sortedBanners[0] as Banner | undefined;
  const promoBanners = sortedBanners.slice(1, 3);

  return (
    <>
      <HeroBanner banner={heroBanner} />
      <BenefitsStrip />
      <CategoryCards categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <PromoBanners banners={promoBanners} />
      <BrandsSection brands={brands} />
      <NewsletterSection />
    </>
  );
}
