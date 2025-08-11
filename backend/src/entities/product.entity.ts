import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export type Categoria = 'comida' | 'bebida' | 'sobremesa';

@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Property()
  category!: Categoria;

  @Property({ default: 0 })
  stock!: number;

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
