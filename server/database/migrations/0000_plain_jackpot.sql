CREATE TABLE IF NOT EXISTS "game_state" (
	"name" varchar(255) PRIMARY KEY NOT NULL,
	"state" json NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(25) NOT NULL,
	"last_login" date DEFAULT now() NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"createddate" date DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"message" varchar(255) NOT NULL,
	"game" integer,
	"createddate" date NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "messages" ADD CONSTRAINT "messages_game_games_id_fk" FOREIGN KEY ("game") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "gameNameUniqueIndex" ON "games" USING btree (lower("name"));