'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null); // null = checando

  useEffect(() => {
    // roda só no client
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace('/login');
    }
  }, [router]);

  // Enquanto checa, não renderiza (evita flash)
  if (allowed === null) return null;

  // Se não permitido, não renderiza nada (redirecionamento já foi disparado)
  if (!allowed) return null;

  return <>{children}</>;
}
