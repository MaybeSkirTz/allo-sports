ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "image_credit" text;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "views" integer DEFAULT 0 NOT NULL;