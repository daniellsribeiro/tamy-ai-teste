import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/postgresql';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import type { CreateOrderDto } from './dto/create-order.dto';
import type { UpdateOrderDto } from './dto/update-order.dto';

function toCents(price: string) {
  return Math.round(Number(String(price).replace(',', '.')) * 100);
}
function centsToMoney(cents: number) {
  return (cents / 100).toFixed(2);
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: EntityRepository<Order>,
    @InjectRepository(OrderItem) private readonly itemRepo: EntityRepository<OrderItem>,
    @InjectRepository(Product) private readonly prodRepo: EntityRepository<Product>,
  ) { }

  async create(dto: CreateOrderDto) {
    if (!dto.items?.length) throw new BadRequestException('Pedido sem itens');

    const ids = dto.items.map(i => i.productId);
    const products = await this.prodRepo.find({ id: { $in: ids } });
    const map = new Map(products.map(p => [p.id, p]));

    const now = new Date();
    let totalCents = 0;

    const order = this.orderRepo.create({
      total: '0.00',
      paymentMethod: dto.paymentMethod,
      status: dto.status ?? 'pago',
      createdAt: now,
      updatedAt: now,
    });

    for (const it of dto.items) {
      const prod = map.get(it.productId);
      if (!prod) throw new BadRequestException(`Produto ${it.productId} não encontrado`);
      if (it.quantity <= 0) throw new BadRequestException('Quantidade inválida');

      if (prod.stock < it.quantity) {
        throw new BadRequestException(`Estoque insuficiente de ${prod.name} (disp: ${prod.stock})`);
      }
      prod.stock -= it.quantity;

      const unitCents = toCents(prod.price);
      const lineCents = unitCents * it.quantity;
      totalCents += lineCents;

      const item = this.itemRepo.create({
        order,
        product: prod,
        quantity: it.quantity,
        unitPrice: centsToMoney(unitCents),
        lineTotal: centsToMoney(lineCents),
        createdAt: now,
      });

      order.items.add(item);
    }

    order.total = centsToMoney(totalCents);

    const em = this.orderRepo.getEntityManager();
    em.persist(order);
    await em.flush();

    // retorna pedido com itens e produto populado
    return this.findOne(order.id);
  }

  async findAll() {
    return this.orderRepo.findAll({
      populate: ['items', 'items.product'],
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepo.findOne(
      { id },
      { populate: ['items', 'items.product'] },
    );
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

 async update(id: number, dto: { status?: 'aberto'|'pago'|'cancelado'; paymentMethod?: 'pix'|'cartao'|'dinheiro' }) {
    const em = this.orderRepo.getEntityManager();

    return em.transactional(async (tem) => {
      // carregar pedido + itens + produto (precisamos do stock)
      const order = await tem.findOne(Order, id, { populate: ['items', 'items.product'] });
      if (!order) throw new NotFoundException('Order not found');

      const prev = order.status;
      const next = dto.status ?? prev;

      // Se mudou o status, ajusta estoque conforme a transição
      if (dto.status && next !== prev) {
        if (prev !== 'cancelado' && next === 'cancelado') {
          // Pedido foi cancelado agora -> devolver estoque
          for (const it of order.items) {
            it.product.stock += it.quantity;
          }
        } else if (prev === 'cancelado' && next !== 'cancelado') {
          // Pedido “reaberto” (aberto/pago) -> consumir estoque de novo
          for (const it of order.items) {
            if (it.product.stock < it.quantity) {
              throw new BadRequestException(
                `Estoque insuficiente de ${it.product.name} (disp: ${it.product.stock}, necessário: ${it.quantity})`,
              );
            }
            it.product.stock -= it.quantity;
          }
        }
        order.status = next;
      }

      if (dto.paymentMethod) {
        order.paymentMethod = dto.paymentMethod;
      }

      order.updatedAt = new Date();
      await tem.flush();

      return order;
    });
  }
}
