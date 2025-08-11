import { defineConfig } from '@mikro-orm/postgresql';
import { config as dotenv } from 'dotenv';
import { User } from './entities/user.entity';
dotenv();

export default defineConfig({
  entities: [User],              
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
});
