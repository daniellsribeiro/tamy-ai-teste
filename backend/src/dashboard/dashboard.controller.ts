import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Order } from '../entities/order.entity';

const toCents = (s: string) => Math.round(Number(String(s).replace(',', '.')) * 100);
const centsToMoney = (n: number) => (n / 100).toFixed(2);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay   = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);

// parse YYYY-MM-DD como data local (evita UTC)
function parseLocalDate(iso?: string) {
  if (!iso) return new Date();
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: EntityRepository<Order>,
  ) {}

  @Get('summary')
  async summary(@Query('date') date?: string) {
    const base = parseLocalDate(date);
    const from = startOfDay(base);
    const to   = endOfDay(base);

    const orders = await this.orderRepo.find({
      status: 'pago',
      createdAt: { $gte: from, $lt: to },
    });

    const count = orders.length;
    const totalCents = orders.reduce((acc, o) => acc + toCents(o.total), 0);
    return {
      date: from.toISOString().slice(0, 10),
      orders: count,
      revenue: centsToMoney(totalCents),
      avgTicket: count ? centsToMoney(Math.round(totalCents / count)) : '0.00',
    };
  }
}
