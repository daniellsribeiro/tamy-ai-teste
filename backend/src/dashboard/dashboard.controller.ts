import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { FilterQuery } from '@mikro-orm/core';
import { Order } from '../entities/order.entity';

const toCents = (s: string) =>
  Math.round(Number(String(s).replace(',', '.')) * 100);
const centsToMoney = (n: number) => (n / 100).toFixed(2);

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);

// parse YYYY-MM-DD como data local (evita UTC)
function parseLocalDate(iso?: string) {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

const STATUS = ['pago', 'aberto', 'cancelado', 'all'] as const;
type StatusFilter = (typeof STATUS)[number];

const PAY = ['pix', 'cartao', 'dinheiro', 'all'] as const;
type PaymentFilter = (typeof PAY)[number];

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: EntityRepository<Order>,
  ) {}

  @Get('summary')
  async summary(
    @Query('from') fromQ?: string,
    @Query('to') toQ?: string,
    @Query('status') status: StatusFilter = 'pago',
    @Query('payment') payment: PaymentFilter = 'all',
  ) {
    // período
    const baseFrom = parseLocalDate(fromQ);
    const baseTo = parseLocalDate(toQ ?? fromQ); // se não vier "to", usa mesmo dia de "from"
    let from = startOfDay(baseFrom);
    let to = endOfDay(baseTo);
    // se inverteram as datas, corrige
    if (to < from) [from, to] = [to, from];

    // filtros dinâmicos
    const where: FilterQuery<Order> = { createdAt: { $gte: from, $lt: to } };
    if (status !== 'all') where.status = status as any;
    if (payment !== 'all') where.paymentMethod = payment as any;

    const orders = await this.orderRepo.find(where);

    const count = orders.length;
    const totalCents = orders.reduce((acc, o) => acc + toCents(o.total), 0);

    return {
      from: from.toISOString().slice(0, 10),
      to: new Date(to.getTime() - 1).toISOString().slice(0, 10), // ajusta fim do dia
      filters: { status, payment },
      orders: count,
      revenue: centsToMoney(totalCents),
      avgTicket: count ? centsToMoney(Math.round(totalCents / count)) : '0.00',
    };
  }
}
