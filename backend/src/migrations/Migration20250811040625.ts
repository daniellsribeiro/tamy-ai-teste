import { Migration } from '@mikro-orm/migrations';

export class Migration20250811040625 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "orders" ("id" serial primary key, "total" numeric(10,2) not null, "payment_method" varchar(255) not null, "status" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);

    this.addSql(`create table "order_items" ("id" serial primary key, "order_id" int not null, "product_id" int not null, "quantity" int not null, "unit_price" numeric(10,2) not null, "line_total" numeric(10,2) not null, "created_at" timestamptz not null);`);

    this.addSql(`alter table "order_items" add constraint "order_items_order_id_foreign" foreign key ("order_id") references "orders" ("id") on update cascade;`);
    this.addSql(`alter table "order_items" add constraint "order_items_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "order_items" drop constraint "order_items_order_id_foreign";`);

    this.addSql(`drop table if exists "orders" cascade;`);

    this.addSql(`drop table if exists "order_items" cascade;`);
  }

}
