'use client';
import { useRouter } from 'next/navigation';
import ProductForm from '../ProductForm';

export default function NewProduct() {
  const router = useRouter();
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Novo Produto</h1>
      <ProductForm onCancel={() => router.push('/products')} />
    </main>
  );
}
