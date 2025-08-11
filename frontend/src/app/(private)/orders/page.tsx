'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiGet, apiPatch } from '@/lib/api';

type Payment = 'pix' | 'cartao' | 'dinheiro';
type Status = 'pago' | 'aberto' | 'cancelado';

type Product = { id:number; name:string; price:string; category:string };
type Item = { id:number; product: Product; quantity:number; unitPrice:string; lineTotal:string };
type Order = {
  id:number;
  total:string;
  paymentMethod: Payment;
  status: Status;
  createdAt:string;
  items: Item[];
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    apiGet<Order[]>('/orders')
      .then(setData)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function marcarPago(id: number) {
    await apiPatch<Order>(`/orders/${id}`, { status: 'pago' });
    load();
  }

  const totalHoje = useMemo(() => {
    const today = new Date(); today.setHours(0,0,0,0);
    const cents = data
      .filter(o => new Date(o.createdAt) >= today && o.status === 'pago')
      .reduce((acc, o) => acc + Math.round(Number(o.total) * 100), 0);
    return (cents/100).toFixed(2);
  }, [data]);

  if (loading) return <main className="p-4">Carregando...</main>;

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Pedidos</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">Faturamento hoje: <span className="font-semibold">R$ {totalHoje}</span></div>
          <Button asChild><Link href="/orders/new">Novo Pedido</Link></Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Itens</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(o => (
            <TableRow key={o.id}>
              <TableCell>#{o.id}</TableCell>
              <TableCell>{fmtDate(o.createdAt)}</TableCell>
              <TableCell className="capitalize">{o.paymentMethod}</TableCell>
              <TableCell>
                {o.status === 'pago' && <Badge className="bg-green-600 hover:bg-green-600">Pago</Badge>}
                {o.status === 'aberto' && <Badge className="bg-yellow-500 hover:bg-yellow-500">Aberto</Badge>}
                {o.status === 'cancelado' && <Badge className="bg-gray-500 hover:bg-gray-500">Cancelado</Badge>}
              </TableCell>
              <TableCell>{o.items.length}</TableCell>
              <TableCell>R$ {o.total}</TableCell>
              <TableCell className="text-right space-x-2">
                {o.status !== 'pago' && (
                  <Button size="sm" onClick={() => marcarPago(o.id)}>Marcar pago</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
