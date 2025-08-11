'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { apiPatch, apiPost } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Informe o nome'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Use formato 00.00'),
  category: z.enum(['comida', 'bebida', 'sobremesa']),
  // use number puro + valueAsNumber no register (evita stock: unknown)
  stock: z.number().int().min(0, 'Estoque não pode ser negativo'),
});
export type ProductFormData = z.infer<typeof schema>;

export default function ProductForm({
  initial,
  id,
  onCancel,
}: {
  initial?: Partial<ProductFormData>;
  id?: number;
  onCancel?: () => void;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: { stock: 0, ...initial },
  });

  const cancel = useCallback(() => {
    if (isDirty) {
      const ok = confirm('Deseja realmente cancelar? As alterações não serão salvas.');
      if (!ok) return;
    }
    if (onCancel) onCancel();
    else router.push('/products');
  }, [isDirty, onCancel, router]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancel();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [cancel]);

  async function onSubmit(data: ProductFormData) {
    if (id) await apiPatch(`/products/${id}`, data);
    else await apiPost('/products', data);
    router.push('/products');
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 max-w-md">
          <div>
            <label className="text-sm">Nome</label>
            <Input {...register('name')} />
            <p className="text-xs text-red-600">{errors.name?.message}</p>
          </div>

          <div>
            <label className="text-sm">Preço (ex: 25.90)</label>
            <Input {...register('price')} />
            <p className="text-xs text-red-600">{errors.price?.message}</p>
          </div>

          <div>
            <label className="text-sm">Categoria</label>
            <Select
              defaultValue={initial?.category}
              onValueChange={(v) => setValue('category', v as ProductFormData['category'])}
            >
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="comida">Comida</SelectItem>
                <SelectItem value="bebida">Bebida</SelectItem>
                <SelectItem value="sobremesa">Sobremesa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-red-600">{errors.category?.message}</p>
          </div>

          <div>
            <label className="text-sm">Estoque</label>
            {/* transforma para número no RHF */}
            <Input type="number" min={0} {...register('stock', { valueAsNumber: true })} />
            <p className="text-xs text-red-600">{errors.stock?.message}</p>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="w-full" onClick={cancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {id ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
