'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type Summary = { date: string; orders: number; revenue: string; avgTicket: string };

export default function DashboardPage() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${t ?? ''}` },
    })
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <main className="grid gap-4 md:grid-cols-3">
      <Card><CardContent className="p-4">
        <p className="text-sm text-gray-500">Faturamento (hoje)</p>
        <p className="text-2xl font-bold">R$ {data?.revenue ?? '0,00'}</p>
      </CardContent></Card>
      <Card><CardContent className="p-4">
        <p className="text-sm text-gray-500">Pedidos (hoje)</p>
        <p className="text-2xl font-bold">{data?.orders ?? 0}</p>
      </CardContent></Card>
      <Card><CardContent className="p-4">
        <p className="text-sm text-gray-500">Ticket médio</p>
        <p className="text-2xl font-bold">R$ {data?.avgTicket ?? '0,00'}</p>
      </CardContent></Card>
    </main>
  );
}
