ALTER TABLE "messages" RENAME TO "supporter_messages";--> statement-breakpoint
ALTER TABLE "supporter_messages" DROP CONSTRAINT "messages_game_games_id_fk";
--> statement-breakpoint
ALTER TABLE "supporter_messages" ALTER COLUMN "username" SET DATA TYPE varchar(150);--> statement-breakpoint
ALTER TABLE "supporter_messages" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "supporter_messages" ALTER COLUMN "message" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "supporter_messages" ALTER COLUMN "createddate" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "supporter_messages" ADD COLUMN "socialat" varchar(25);--> statement-breakpoint
ALTER TABLE "supporter_messages" ADD COLUMN "accountref" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "stkresponse" ADD COLUMN "accountref" varchar(50);--> statement-breakpoint
ALTER TABLE "supporter_messages" DROP COLUMN IF EXISTS "game";