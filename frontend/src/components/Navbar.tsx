'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const active = (p: string) => pathname?.startsWith(p) ? 'font-semibold' : 'text-gray-600';

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center gap-4 p-3">
        <span className="text-lg font-bold">Tamy AI</span>
        <nav className="flex gap-4 text-sm">
          <Link className={active('/dashboard')} href="/dashboard">Dashboard</Link>
          <Link className={active('/products')} href="/products">Produtos</Link>
          <Link className={active('/orders')} href="/orders">Pedidos</Link>
        </nav>
        <div className="ml-auto">
          <Button variant="outline" onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}>
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
