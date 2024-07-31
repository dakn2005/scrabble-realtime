import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2';
// import * as schema from './schema';

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'daudi2016',
    database: 'react_chat',
    // port: 3306,
    multipleStatements: true,
})

// let mode: Mode = 'development'

export { connection };
// export const db = drizzle(connection, { schema, mode });
export const db = drizzle(connection);