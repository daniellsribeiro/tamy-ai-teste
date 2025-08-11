import type { Categoria } from '../../entities/product.entity';

export type CreateProductDto = {
  name: string;
  price: string;
  category: Categoria;
  stock: number;    
};