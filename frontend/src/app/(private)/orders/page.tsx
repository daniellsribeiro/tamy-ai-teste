'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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

// Ícones SVG inline (sem libs)
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </svg>
  );
}
function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    apiGet<Order[]>('/orders')
      .then(setData)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  async function markPaid(id: number) {
    await apiPatch<Order>(`/orders/${id}`, { status: 'pago' });
    load();
  }

  async function cancelOrder(id: number) {
    const ok = confirm(`Deseja realmente cancelar o pedido #${id}?`);
    if (!ok) return;
    await apiPatch<Order>(`/orders/${id}`, { status: 'cancelado' });
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
    <TooltipProvider>
      <main className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Faturamento hoje: <span className="font-semibold">R$ {totalHoje}</span>
            </div>
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
            {data.map(o => {
              const canMarkPaid = o.status !== 'pago';
              const canCancel = o.status !== 'cancelado';

              return (
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Marcar como pago: ícone, tooltip, sempre visível; desabilita quando já está pago */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              size="icon"
                              variant="outline"
                              aria-label="Marcar como pago"
                              disabled={!canMarkPaid}
                              onClick={() => canMarkPaid && markPaid(o.id)}
                              className="h-8 w-8"
                            >
                              <CheckIcon />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Marcar como pago</TooltipContent>
                      </Tooltip>

                      {/* Cancelar: vermelho (destructive), ícone, tooltip, sempre visível; desabilita quando já cancelado */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              size="icon"
                              variant="destructive"
                              aria-label="Cancelar pedido"
                              disabled={!canCancel}
                              onClick={() => canCancel && cancelOrder(o.id)}
                              className="h-8 w-8"
                            >
                              <TrashIcon />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>Cancelar pedido</TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </main>
    </TooltipProvider>
  );
}
