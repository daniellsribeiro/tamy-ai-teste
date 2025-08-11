import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

export type Categoria = 'comida' | 'bebida' | 'sobremesa';

@Entity({ tableName: 'products' })
export class Product {
  @PrimaryKey()
  id!: number;

  @Property()
  name!: string;

  // decimal(10,2) no Postgres — use string no TS p/ não perder precisão
  @Property({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Property()
  category!: Categoria;

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
