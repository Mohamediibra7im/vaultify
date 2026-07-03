import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Use process.env directly — env() throws when var is missing, which breaks CI
    // prisma generate doesn't connect to DB, only migrations do
    url: process.env.DIRECT_URL || 'postgresql://user:pass@localhost:5432/dummy',
  },
});
