import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: 'database/schema.ts',
    out: 'database/migrations',
    dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        host: 'localhost',
        user: 'postgres',
        // password: '',
        database: 'scrabble_chat',
        port: 5435
    },
});
