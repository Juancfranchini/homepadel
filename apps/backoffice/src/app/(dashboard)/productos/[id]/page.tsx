'use client';

import { use } from 'react';
import ProductForm from '../_components/ProductForm';

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductForm mode="edit" productId={id} />;
}
