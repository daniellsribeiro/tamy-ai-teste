'use client';
import Protected from '@/components/Protected';
import Navbar from '@/components/Navbar';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <Navbar />
      <div className="max-w-5xl mx-auto p-4">{children}</div>
    </Protected>
  );
}
