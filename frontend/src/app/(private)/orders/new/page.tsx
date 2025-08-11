'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useRouter } from 'next/navigation';

type Category = 'comida' | 'bebida' | 'sobremesa';
type Product = { id:number; name:string; price:string; category: Category };
type CartItem = { productId:number; name:string; unitPrice:string; quantity:number };

export default function NewOrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [qty, setQty] = useState<Record<number, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pay, setPay] = useState<'pix'|'cartao'|'dinheiro'>('pix');
  const router = useRouter();

  useEffect(() => { apiGet<Product[]>('/products').then(setProducts); }, []);

  function add(p: Product) {
    const q = Math.max(1, qty[p.id] ?? 1);
    setCart((c) => {
      const i = c.findIndex(ci => ci.productId === p.id);
      if (i >= 0) {
        const c2 = [...c];
        c2[i] = { ...c2[i], quantity: c2[i].quantity + q };
        return c2;
      }
      return [...c, { productId: p.id, name: p.name, unitPrice: p.price, quantity: q }];
    });
    setQty(s => ({ ...s, [p.id]: 1 }));
  }

  const total = useMemo(() => {
    const cents = cart.reduce((acc, it) => acc + Math.round(Number(it.unitPrice) * 100) * it.quantity, 0);
    return (cents / 100).toFixed(2);
  }, [cart]);

  async function submit() {
    if (!cart.length) return;
    const items = cart.map(c => ({ productId: c.productId, quantity: c.quantity }));
    await apiPost('/orders', { paymentMethod: pay, status: 'pago', items });
    router.push('/orders');
  }

  return (
    <main className="grid gap-6 md:grid-cols-2">
      {/* Produtos */}
      <section className="space-y-3">
        <h2 className="font-semibold">Produtos</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell className="capitalize">{p.category}</TableCell>
                <TableCell>R$ {p.price}</TableCell>
                <TableCell className="w-24">
                  <Input
                    type="number"
                    min={1}
                    value={qty[p.id] ?? 1}
                    onChange={(e) => setQty(s => ({ ...s, [p.id]: Number(e.target.value) }))}
                  />
                </TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => add(p)}>Adicionar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {/* Resumo */}
      <section className="space-y-3">
        <h2 className="font-semibold">Resumo</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cart.map(ci => (
              <TableRow key={ci.productId}>
                <TableCell>{ci.name}</TableCell>
                <TableCell>{ci.quantity}</TableCell>
                <TableCell>R$ {(Number(ci.unitPrice) * ci.quantity).toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCart(cart.filter(c => c.productId !== ci.productId))}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center gap-3">
          <span className="text-sm">Pagamento:</span>
          <Select value={pay} onValueChange={(v) => setPay(v as 'pix'|'cartao'|'dinheiro')}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pix">PIX</SelectItem>
              <SelectItem value="cartao">Cartão</SelectItem>
              <SelectItem value="dinheiro">Dinheiro</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto text-lg font-semibold">Total: R$ {total}</div>
        </div>

        <Button className="w-full" onClick={submit} disabled={!cart.length}>
          Finalizar pedido
        </Button>
      </section>
    </main>
  );
}
