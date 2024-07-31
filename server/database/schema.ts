import { 
    int, 
    mysqlEnum, 
    mysqlTable, 
    uniqueIndex, 
    varchar, 
    serial,
    datetime,
} from 'drizzle-orm/mysql-core';

export const messages = mysqlTable('messages', {
    id: serial('id').notNull().primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    message: varchar('message', { length: 255 }).notNull(),
    room: int('room_id').references(() => rooms.id),
    createddate: datetime('createddate', { mode: 'date' }).notNull(),
});

export const rooms = mysqlTable('rooms', {
    id: serial('id').notNull().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
});

