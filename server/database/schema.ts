import { create } from 'domain';
import { 
     
    integer,
    pgEnum, 
    pgTable, 
    uniqueIndex, 
    varchar, 
    serial,
    date,
} from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
    id: serial('id').notNull().primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    message: varchar('message', { length: 255 }).notNull(),
    game: integer('game_id').references(() => games.id),
    createddate: date('createddate', { mode: 'date' }).notNull(),
});

export const games = pgTable('games', {
    id: serial('id').notNull().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    created_by: varchar('created_by', { length: 255 }).notNull(),
    createddate: date('createddate', { mode: 'date' }).notNull(),
});

