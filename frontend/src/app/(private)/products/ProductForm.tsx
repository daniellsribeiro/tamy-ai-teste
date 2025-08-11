'use client';

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
});
export type ProductFormData = z.infer<typeof schema>;

export default function ProductForm({
  initial,
  id,
}: {
  initial?: Partial<ProductFormData>;
  id?: number;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

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
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comida">Comida</SelectItem>
                <SelectItem value="bebida">Bebida</SelectItem>
                <SelectItem value="sobremesa">Sobremesa</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-red-600">{errors.category?.message}</p>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {id ? 'Salvar' : 'Criar'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
