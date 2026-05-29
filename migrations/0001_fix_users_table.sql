-- Drop dependent tables first (due to foreign key constraints)
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Recreate users table with correct id type (varchar, not serial)
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

-- Recreate messages table
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"(id) ON DELETE cascade ON UPDATE no action;
