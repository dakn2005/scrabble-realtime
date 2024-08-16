ALTER TABLE "games" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "lang" varchar(25) NOT NULL;