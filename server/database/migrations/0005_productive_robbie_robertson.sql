ALTER TABLE "games" ALTER COLUMN "name" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "game_state" ADD COLUMN "current_player" varchar(255) NOT NULL;