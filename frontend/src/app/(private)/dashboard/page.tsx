'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

type StatusFilter = 'pago' | 'aberto' | 'cancelado' | 'all';
type PaymentFilter = 'pix' | 'cartao' | 'dinheiro' | 'all';

type Summary = {
  from: string;
  to: string;
  filters: { status: StatusFilter; payment: PaymentFilter };
  orders: number;
  revenue: string;
  avgTicket: string;
};

export default function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [status, setStatus] = useState<StatusFilter>('pago');
  const [payment, setPayment] = useState<PaymentFilter>('all');

  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') ?? '';
      const qs = new URLSearchParams({ from, to, status, payment }).toString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erro ao carregar dashboard');
      const json = (await res.json()) as Summary;
      setData(json);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function setToday() {
    const t = new Date().toISOString().slice(0, 10);
    setFrom(t);
    setTo(t);
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Filtros */}
      <div className="grid gap-3 md:grid-cols-5">
        <div>
          <label className="text-sm">De</label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Até</label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Status</label>
          <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="aberto">Aberto</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm">Pagamento</label>
          <Select value={payment} onValueChange={(v) => setPayment(v as PaymentFilter)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" className="w-full" onClick={setToday}>Hoje</Button>
          <Button className="w-full" onClick={load} disabled={loading}>
            {loading ? 'Filtrando...' : 'Aplicar filtros'}
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Pedidos</p>
          <p className="text-2xl font-bold">{data?.orders ?? 0}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Faturamento</p>
          <p className="text-2xl font-bold">R$ {data?.revenue ?? '0.00'}</p>
        </CardContent></Card>

        <Card><CardContent className="p-4">
          <p className="text-sm text-gray-500">Ticket médio</p>
          <p className="text-2xl font-bold">R$ {data?.avgTicket ?? '0.00'}</p>
        </CardContent></Card>
      </div>
    </main>
  );
}
