'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) router.replace('/login');
  }, [router]);
  return <>{children}</>;
}
