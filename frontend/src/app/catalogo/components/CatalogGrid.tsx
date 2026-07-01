import { Product } from '@/types';
import ProductCard from '@/components/ui/ProductCard';

interface Props {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function CatalogGrid({ products, onAddToCart }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}
    </div>
  );
}