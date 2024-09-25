import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

config({ path: '.env' });

export default defineConfig({
    schema: 'database/schema.ts',
    out: 'database/migrations',
    dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
