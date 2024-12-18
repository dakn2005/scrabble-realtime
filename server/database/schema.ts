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

export const supporter_messages = pgTable('supporter_messages', {
    id: serial('id').notNull().primaryKey(),
    username: varchar('username', { length: 150 }),
    message: varchar('message', { length: 255 }),
    socialat: varchar('socialat', { length: 25 }),
    phone: varchar('phone', { length: 15 }).notNull(),
    accountref: varchar('accountref', { length: 50 }).notNull(),
    createddate: date('createddate', { mode: 'date' }).default(sql`now()`).notNull(),
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
        currentplayer: varchar('current_player', { length: 255 }),
        letterbag: text('letterbag').array(),
        statistics: text('statistics'),
        createddate: date('createddate', { mode: 'date' }).notNull().default(sql`now()`),
        updatedate: date('updatedate', { mode: 'date' }).notNull()
    },
    (table) => ({
        gameUniqueIndex: uniqueIndex('gameUniqueIndex').on(sql`lower(${table.game})`),
    })
)

export const stkresponse = pgTable(
    'stkresponse',
    {
        stkresponse_id: varchar('stkresponse_id', { length: 100 }).primaryKey().notNull(),
        accountref: varchar('accountref', { length: 50 }),
        MerchantRequestID: varchar('MerchantRequestID', { length: 100 }).notNull(),
        CheckoutRequestID: varchar('CheckoutRequestID', { length: 100 }).notNull(),
        ResultCode: varchar('ResultCode', { length: 10 }).notNull(),
        ResultDesc: varchar('ResultDesc', { length: 250 }),
        CallbackMetadata: json('CallbackMetadata'),
        createddate: date('createddate', { mode: 'date' }).notNull().default(sql`now()`),
        updatedate: date('updatedate', { mode: 'date' })
    }
)
