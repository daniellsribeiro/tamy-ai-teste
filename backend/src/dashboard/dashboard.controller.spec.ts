import { DashboardController } from './dashboard.controller';
import type { EntityRepository } from '@mikro-orm/postgresql';
import type { Order } from '../entities/order.entity';

type Status = 'pago' | 'aberto' | 'cancelado';
type Payment = 'pix' | 'cartao' | 'dinheiro';

type WhereMock = {
  createdAt?: { $gte?: Date; $lt?: Date };
  status?: Status;
  paymentMethod?: Payment;
};

// helper para criar pedidos fake
const makeOrder = (
  total: string,
  status: Status,
  paymentMethod: Payment,
  createdAt: Date,
): Order =>
  ({
    total,
    status,
    paymentMethod,
    createdAt,
  }) as Order;

describe('DashboardController (unit)', () => {
  let controller: DashboardController;
  let repo: Pick<EntityRepository<Order>, 'find'>;

  beforeEach(() => {
    // mocka só o que o controller usa
    repo = { find: jest.fn() } as unknown as EntityRepository<Order>;
    controller = new DashboardController(repo as EntityRepository<Order>);
  });

  it('summary calcula revenue/orders/avgTicket com filtro status=pago e payment=all', async () => {
    const baseDay = '2025-08-11';

    const data: ReadonlyArray<Order> = [
      makeOrder('25,90', 'pago', 'pix', new Date(`${baseDay}T10:00:00`)),
      makeOrder('6,50', 'pago', 'dinheiro', new Date(`${baseDay}T11:00:00`)),
      makeOrder('8,90', 'aberto', 'pix', new Date(`${baseDay}T12:00:00`)), // deve ser excluído (status aberto)
    ];

    // Simula o comportamento do MikroORM respeitando o "where"
    (repo.find as jest.Mock).mockImplementation((where: WhereMock) => {
      const from = where?.createdAt?.$gte;
      const to = where?.createdAt?.$lt;
      const status = where?.status;
      const payment = where?.paymentMethod;

      return Promise.resolve(
        data.filter((o: Order) => {
          if (from && !(o.createdAt >= from)) return false;
          if (to && !(o.createdAt < to)) return false;
          if (status && o.status !== status) return false;
          if (payment && o.paymentMethod !== payment) return false;
          return true;
        }),
      );
    });

    const res = await controller.summary(baseDay, undefined, 'pago', 'all');

    expect(res.orders).toBe(2);
    expect(res.revenue).toBe('32.40'); // 25,90 + 6,50
    expect(res.avgTicket).toBe('16.20');
    expect(res.filters).toEqual({ status: 'pago', payment: 'all' });
  });

  it('summary filtra por método de pagamento (cartao) além do status', async () => {
    const baseDay = '2025-08-11';

    const data: ReadonlyArray<Order> = [
      makeOrder('10,00', 'pago', 'cartao', new Date(`${baseDay}T09:00:00`)), // entra
      makeOrder('20,00', 'pago', 'pix', new Date(`${baseDay}T10:00:00`)), // sai (payment)
      makeOrder('30,00', 'aberto', 'cartao', new Date(`${baseDay}T11:00:00`)), // sai (status)
    ];

    (repo.find as jest.Mock).mockImplementation((where: WhereMock) => {
      const from = where?.createdAt?.$gte;
      const to = where?.createdAt?.$lt;
      const status = where?.status;
      const payment = where?.paymentMethod;

      return Promise.resolve(
        data.filter((o: Order) => {
          if (from && !(o.createdAt >= from)) return false;
          if (to && !(o.createdAt < to)) return false;
          if (status && o.status !== status) return false;
          if (payment && o.paymentMethod !== payment) return false;
          return true;
        }),
      );
    });

    const res = await controller.summary(baseDay, undefined, 'pago', 'cartao');

    expect(res.orders).toBe(1);
    expect(res.revenue).toBe('10.00');
    expect(res.avgTicket).toBe('10.00');
    expect(res.filters).toEqual({ status: 'pago', payment: 'cartao' });
  });
});
