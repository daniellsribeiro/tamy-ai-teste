import {
  Entity,
  PrimaryKey,
  Property,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { OrderItem } from './order-item.entity';

export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';
export type OrderStatus = 'pago' | 'aberto' | 'cancelado';

@Entity({ tableName: 'orders' })
export class Order {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'decimal', precision: 10, scale: 2 })
  total!: string; // "123.45"

  @Property()
  paymentMethod!: PaymentMethod;

  @Property()
  status!: OrderStatus;

  @OneToMany(() => OrderItem, (oi) => oi.order, {
    cascade: [Cascade.PERSIST, Cascade.REMOVE],
    orphanRemoval: true,
  })
  items = new Collection<OrderItem>(this);

  @Property()
  createdAt!: Date;

  @Property()
  updatedAt!: Date;
}
