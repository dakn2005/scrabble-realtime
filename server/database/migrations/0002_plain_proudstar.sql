ALTER TABLE "game_state" ADD COLUMN "letterbag" text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "game_state" ADD COLUMN "statistics" json NOT NULL;--> statement-breakpoint
ALTER TABLE "game_state" ADD COLUMN "createddate" date DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "game_state" ADD COLUMN "updatedate" date NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "gameUniqueIndex" ON "game_state" USING btree (lower("name"));--> statement-breakpoint
ALTER TABLE "game_state" DROP COLUMN IF EXISTS "state";