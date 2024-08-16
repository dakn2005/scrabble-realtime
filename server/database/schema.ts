import { SQL, sql } from 'drizzle-orm';
import {
    integer,
    pgEnum,
    pgTable,
    uniqueIndex,
    varchar,
    json,
    serial,
    date,
} from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
    id: serial('id').notNull().primaryKey(),
    username: varchar('username', { length: 255 }).notNull(),
    message: varchar('message', { length: 255 }).notNull(),
    game: integer('game').references(() => games.id),
    createddate: date('createddate', { mode: 'date' }).notNull(),
});

export const games = pgTable(
    'games',
    {
        id: serial('id').notNull().primaryKey(),
        name: varchar('name', { length: 255 }).notNull(),
        lang: varchar('lang', { length: 25 }).notNull(),
        last_login: date('last_login', { mode: 'date' }).notNull().default(sql`now()`),
        created_by: varchar('created_by', { length: 255 }).notNull(),
        createddate: date('createddate', { mode: 'date' }).notNull().default(sql`now()`),
    },
    (tab) => ({
        gameNameUniqueIndex: uniqueIndex('gameNameUniqueIndex').on(sql`lower(${tab.name})`),
    })
);

export const game_state = pgTable(
    'game_state',
    {
        game: varchar('name', { length: 255 }).primaryKey().notNull(),
        state: json('state').notNull(),
        
    }
)

