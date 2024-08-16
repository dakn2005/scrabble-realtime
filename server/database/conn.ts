import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from "pg";
// import mysql from 'mysql2';
// import * as schema from './schema';

export const client = new Client({
    host: 'localhost',
    port: 5435,
    user: 'postgres',
    // password: 'daudi2016',
    database: 'scrabble_game',
    // multipleStatements: true,
});

// let mode: Mode = 'development'

// export { client as connection };
// export const db = drizzle(connection, { schema, mode });

(async() => {
    await client.connect();
})()

export const db = drizzle(client);