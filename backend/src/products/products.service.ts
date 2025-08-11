import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Product } from '../entities/product.entity';
import type { CreateProductDto } from './dto/create-product.dto';
import type { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: EntityRepository<Product>,
  ) {}

  async create(dto: CreateProductDto) {
    const now = new Date();
    const product = this.repo.create({ ...dto, createdAt: now, updatedAt: now });
    const em = this.repo.getEntityManager();
    em.persist(product);
    await em.flush();
    return product;
  }

  async findAll() {
    return this.repo.findAll({ orderBy: { id: 'desc' } });
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ id });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto, { updatedAt: new Date() });
    await this.repo.getEntityManager().flush();
    return product;
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.repo.getEntityManager().removeAndFlush(product);
    return { ok: true };
  }
}
