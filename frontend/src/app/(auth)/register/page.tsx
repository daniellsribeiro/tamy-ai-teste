'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  confirm: z.string().min(6),
}).refine((v) => v.password === v.confirm, {
  message: 'As senhas não conferem',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormData) {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // envia só o que o backend espera
        body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
      });
      if (!res.ok) {
        let msg = 'Erro ao cadastrar';
        try {
          const j = await res.json();
          if (typeof j?.message === 'string') msg = j.message;
        } catch {}
        throw new Error(msg);
      }
      const json = await res.json();
      localStorage.setItem('token', json.accessToken);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao cadastrar';
      setError(msg);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-semibold">Criar conta</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm">Nome</label>
              <Input {...register('name')} />
              <p className="text-xs text-red-600">{errors.name?.message}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm">E-mail</label>
              <Input type="email" {...register('email')} />
              <p className="text-xs text-red-600">{errors.email?.message}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Senha</label>
              <Input type="password" {...register('password')} />
              <p className="text-xs text-red-600">{errors.password?.message}</p>
            </div>
            <div className="space-y-1">
              <label className="text-sm">Confirmar senha</label>
              <Input type="password" {...register('confirm')} />
              <p className="text-xs text-red-600">{errors.confirm?.message}</p>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>

          <p className="text-sm text-center text-gray-600">
            Já tem conta?{' '}
            <Link className="underline" href="/login">Entrar</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
