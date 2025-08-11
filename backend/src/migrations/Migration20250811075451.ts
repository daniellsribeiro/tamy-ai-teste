import { Migration } from '@mikro-orm/migrations';

export class Migration20250811075451 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table "products" add column "stock" int not null default 0;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "products" drop column "stock";`);
  }
}
