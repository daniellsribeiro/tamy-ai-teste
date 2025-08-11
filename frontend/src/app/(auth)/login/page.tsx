'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const schema = z.object({
    email: z.string().email(),
    password: z.string().min(3),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data: FormData) {
        setError(null);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Credenciais inválidas');
            const json = await res.json();
            localStorage.setItem('token', json.accessToken);
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro ao logar';
            setError(msg);
        }
    }

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <Card className="w-full max-w-sm">
                <CardContent className="p-6 space-y-4">
                    <h1 className="text-xl font-semibold">Entrar</h1>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-sm">E-mail</label>
                            <Input type="email" placeholder="admin@tamy.com" {...register('email')} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm">Senha</label>
                            <Input type="password" placeholder="••••••" {...register('password')} />
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {isSubmitting ? 'Entrando...' : 'Entrar'}
                        </Button>
                        <p className="text-sm text-center text-gray-600">
                            Não tem conta? <Link className="underline" href="/register">Criar conta</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
