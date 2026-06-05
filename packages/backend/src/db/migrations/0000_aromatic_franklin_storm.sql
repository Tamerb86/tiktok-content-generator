CREATE TABLE `api_keys` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`key` varchar(64) NOT NULL,
	`label` varchar(100),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_used_at` timestamp,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `generated_contents` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`type` enum('script','creative_angle','hook','caption','hashtags','thumbnail_text','full_package') NOT NULL,
	`language` varchar(10) NOT NULL,
	`input_params` json DEFAULT ('{}'),
	`output` longtext NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generated_contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` varchar(36) NOT NULL,
	`code` enum('free','pro','business') NOT NULL,
	`name` varchar(100) NOT NULL,
	`stripe_price_id` varchar(255),
	`monthly_limit_requests` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plans_id` PRIMARY KEY(`id`),
	CONSTRAINT `plans_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`source` varchar(50) NOT NULL,
	`source_url` text,
	`title` varchar(500),
	`raw_description` text,
	`images` json DEFAULT ('[]'),
	`price_raw` varchar(50),
	`currency` varchar(10),
	`language_detected` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`plan_id` varchar(36) NOT NULL,
	`stripe_customer_id` varchar(255),
	`stripe_subscription_id` varchar(255),
	`status` enum('active','canceled','past_due','trialing','incomplete','incomplete_expired','unpaid') NOT NULL DEFAULT 'active',
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_logs` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`product_id` varchar(36),
	`generated_content_id` varchar(36),
	`tokens_used` int DEFAULT 0,
	`request_time_ms` int DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`supabase_uid` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_supabase_uid_unique` UNIQUE(`supabase_uid`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `api_keys_user_id_idx` ON `api_keys` (`user_id`);--> statement-breakpoint
CREATE INDEX `key_idx` ON `api_keys` (`key`);--> statement-breakpoint
CREATE INDEX `is_active_idx` ON `api_keys` (`is_active`);--> statement-breakpoint
CREATE INDEX `generated_user_id_idx` ON `generated_contents` (`user_id`);--> statement-breakpoint
CREATE INDEX `product_id_idx` ON `generated_contents` (`product_id`);--> statement-breakpoint
CREATE INDEX `type_idx` ON `generated_contents` (`type`);--> statement-breakpoint
CREATE INDEX `language_idx` ON `generated_contents` (`language`);--> statement-breakpoint
CREATE INDEX `generated_created_at_idx` ON `generated_contents` (`created_at`);--> statement-breakpoint
CREATE INDEX `code_idx` ON `plans` (`code`);--> statement-breakpoint
CREATE INDEX `products_user_id_idx` ON `products` (`user_id`);--> statement-breakpoint
CREATE INDEX `source_idx` ON `products` (`source`);--> statement-breakpoint
CREATE INDEX `products_created_at_idx` ON `products` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `stripe_customer_id_idx` ON `subscriptions` (`stripe_customer_id`);--> statement-breakpoint
CREATE INDEX `stripe_subscription_id_idx` ON `subscriptions` (`stripe_subscription_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX `usage_user_id_idx` ON `usage_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `usage_product_id_idx` ON `usage_logs` (`product_id`);--> statement-breakpoint
CREATE INDEX `generated_content_id_idx` ON `usage_logs` (`generated_content_id`);--> statement-breakpoint
CREATE INDEX `usage_created_at_idx` ON `usage_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `supabase_uid_idx` ON `users` (`supabase_uid`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_contents` ADD CONSTRAINT `generated_contents_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `generated_contents` ADD CONSTRAINT `generated_contents_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_plan_id_plans_id_fk` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_logs` ADD CONSTRAINT `usage_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_logs` ADD CONSTRAINT `usage_logs_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_logs` ADD CONSTRAINT `usage_logs_generated_content_id_generated_contents_id_fk` FOREIGN KEY (`generated_content_id`) REFERENCES `generated_contents`(`id`) ON DELETE set null ON UPDATE no action;