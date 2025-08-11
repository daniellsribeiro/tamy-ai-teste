'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm, { ProductFormData } from '../../ProductForm';
import { apiGet } from '@/lib/api';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const [initial, setInitial] = useState<ProductFormData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<ProductFormData>(`/products/${id}`)
      .then(setInitial)
      .catch(() => setError('Não foi possível carregar o produto'));
  }, [id]);

  if (error) return <main className="p-4 text-red-600">{error}</main>;
  if (!initial) return <main className="p-4">Carregando...</main>;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Editar Produto #{id}</h1>
      <ProductForm id={Number(id)} initial={initial} />
    </main>
  );
}