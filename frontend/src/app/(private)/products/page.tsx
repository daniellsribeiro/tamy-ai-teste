'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { apiDelete, apiGet } from '@/lib/api';

type Category = 'comida' | 'bebida' | 'sobremesa';
type Product = { id: number; name: string; price: string; category: Category; stock: number };

export default function ProductsPage() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => apiGet<Product[]>('/products').then(setData).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  async function del(id: number) {
    if (!confirm(`Excluir produto #${id}?`)) return;
    await apiDelete(`/products/${id}`);
    load();
  }

  if (loading) return <main className="p-4">Carregando...</main>;

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Produtos</h1>
        <Button asChild><Link href="/products/new">Novo Produto</Link></Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Estoque</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{p.name}</TableCell>
              <TableCell className="capitalize">{p.category}</TableCell>
              <TableCell>{p.stock}</TableCell>
              <TableCell>R$ {p.price}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/products/${p.id}/edit`}>Editar</Link>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => del(p.id)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
