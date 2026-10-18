CREATE TABLE `audit_leads` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`name` text NOT NULL,
	`brokerage` text NOT NULL,
	`email` text NOT NULL,
	`profile` text DEFAULT '' NOT NULL,
	`role` text NOT NULL,
	`enquiry_volume` text NOT NULL,
	`challenge` text NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`whatsapp_consent` integer DEFAULT false NOT NULL,
	`attribution` text NOT NULL,
	`priority` text DEFAULT 'low' NOT NULL,
	`review_status` text DEFAULT 'NEW' NOT NULL,
	`delivery_status` text DEFAULT 'PENDING' NOT NULL,
	`contact_confirmed_at` text,
	`acknowledgement_id` text
);
--> statement-breakpoint
CREATE TABLE `audit_rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` integer NOT NULL
);
