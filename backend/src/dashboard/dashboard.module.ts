import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Order } from '../entities/order.entity';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [MikroOrmModule.forFeature([Order])],
  controllers: [DashboardController],
})
export class DashboardModule {}
