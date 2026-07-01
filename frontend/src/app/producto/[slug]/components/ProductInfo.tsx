import Link from 'next/link';

interface Props {
  brandName: string;
  brandSlug: string;
  productName: string;
}

export default function ProductInfo({ brandName, brandSlug, productName }: Props) {
  return (
    <>
      <Link
        href={'/catalogo?marca=' + brandSlug}
        className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] hover:opacity-80 transition-opacity"
      >
        {brandName}
      </Link>
      <h1 className="text-2xl md:text-3xl xl:text-4xl font-semibold text-[#F7F6F7] leading-tight">
        {productName}
      </h1>
    </>
  );
}