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
    text,
    boolean,
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
        name: varchar('name', { length: 50 }).notNull(),
        lang: varchar('lang', { length: 25 }).notNull(),
        use_scrabble_dictionary: boolean('use_scrabble_dictionary').notNull().default(false),
        last_login: date('last_login', { mode: 'date' }).notNull().default(sql`now()`),
        created_by: varchar('created_by', { length: 255 }).notNull(),
        createddate: date('createddate', { mode: 'date' }).notNull().default(sql`now()`),
    },
    (table) => ({
        gameNameUniqueIndex: uniqueIndex('gameNameUniqueIndex').on(sql`lower(${table.name})`),
    })
);

export const game_state = pgTable(
    'game_state',
    {
        game: varchar('game', { length: 255 }).primaryKey().notNull(),
        letterbag: text('letterbag').array().notNull(),
        statistics: json('statistics').notNull(),
        createddate: date('createddate', { mode: 'date' }).notNull().default(sql`now()`),
        updatedate: date('updatedate', { mode: 'date' }).notNull()
    },
    (table) => ({
        gameUniqueIndex: uniqueIndex('gameUniqueIndex').on(sql`lower(${table.game})`),
    })
)

