ALTER TABLE "game_state" RENAME COLUMN "name" TO "game";--> statement-breakpoint
DROP INDEX IF EXISTS "gameUniqueIndex";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "gameUniqueIndex" ON "game_state" USING btree (lower("game"));