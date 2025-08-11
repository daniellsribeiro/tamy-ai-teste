import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Order, OrderItem, Product])],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
