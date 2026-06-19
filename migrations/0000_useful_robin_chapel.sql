CREATE TABLE "conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "group_trip_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"number_of_people" integer NOT NULL,
	"number_of_days" integer NOT NULL,
	"preferences" text[] NOT NULL,
	"country" text NOT NULL,
	"arrival_date" text NOT NULL,
	"destination_preference" text NOT NULL,
	"selected_governorate" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tour_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"guide_id" integer NOT NULL,
	"user_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"group_size" integer NOT NULL,
	"hours" integer NOT NULL,
	"trip_date" text NOT NULL,
	"destination" text NOT NULL,
	"details" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;