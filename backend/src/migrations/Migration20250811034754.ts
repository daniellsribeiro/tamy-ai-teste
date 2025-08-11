import { Migration } from '@mikro-orm/migrations';

export class Migration20250811034754 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "products" ("id" serial primary key, "name" varchar(255) not null, "price" numeric(10,2) not null, "category" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "products" cascade;`);
  }

}
