import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: 'database/schema.ts',
    out: 'database/migrations',
    dialect: 'mysql', // 'postgresql' | 'mysql' | 'sqlite'
    dbCredentials: {
        host: 'localhost',
        user: 'root',
        password: 'daudi2016',
        database: 'react_chat'
    },
});
