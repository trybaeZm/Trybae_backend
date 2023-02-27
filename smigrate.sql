-- Recommended database version : mysql v8.0 or greater

-- CREATE DATABASE IF NOT EXISTS trybae_test; USE trybae_test;

CREATE TABLE IF NOT EXISTS `tickets`(
    `ticket_id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `ticket_owner` VARCHAR(255) NULL,
    `ticket_description` VARCHAR(255) NULL,
    `show_under_participants` TINYINT(1) NOT NULL DEFAULT FALSE,
    `event_id` BIGINT UNSIGNED NULL,
    `Date_of_purchase` DATE NOT NULL,
    `time_of_purchase` TIME NOT NULL,
    `ticket_type` VARCHAR(255) NOT NULL DEFAULT "normal_price",
    `redeemed` TINYINT(1) NOT NULL DEFAULT FALSE,
    `seat_number` VARCHAR(255) NULL,
    `cinema_time` VARCHAR(255) NULL,
    `cinema_date` VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS `users`(
    `username` VARCHAR(255) NOT NULL PRIMARY KEY,
    `fullname` VARCHAR(255) NOT NULL,
    `DOB` DATE NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `age` INT NOT NULL,
    `phone` VARCHAR(255) NULL,
    `password` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NULL,
    `profile_pic_url` VARCHAR(255) NULL,
    `follower_count` BIGINT NOT NULL DEFAULT 0,
    `email_verified` TINYINT(1) NULL DEFAULT FALSE,
    `phone_verified` TINYINT(1) NULL DEFAULT FALSE,
    `affiliate_code` VARCHAR(100) NULL,
    `affiliated_by` VARCHAR(100) NULL,
    `2FA_enabled` TINYINT(1) NOT NULL DEFAULT FALSE,
    `private_profile` TINYINT(1) NOT NULL DEFAULT FALSE,
    `Expo_push_token` VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS `Banned_users`(
    `ban_id` VARCHAR(36) PRIMARY KEY,
    `username` VARCHAR(255) NULL,
    `reason` TEXT NOT NULL,
    `ban_date` DATE NOT NULL,
    `ban_time` TIME NOT NULL,
    `permanent` TINYINT(1) NULL,
    `ban_period_in_days` BIGINT NULL
);

CREATE TABLE IF NOT EXISTS `Banned_hosts`(
    `ban_id` VARCHAR(36) PRIMARY KEY,
    `host_username` VARCHAR(255) NULL,
    `reason` VARCHAR(255) NOT NULL,
    `ban_date` DATE NOT NULL,
    `ban_time` TIME NOT NULL,
    `permanent` TINYINT(1) NULL,
    `ban_period_in_days` BIGINT NULL
);

CREATE TABLE IF NOT EXISTS `event_categories`(
    `category_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(255) NOT NULL,
    `category_description` TEXT NULL
);

CREATE TABLE IF NOT EXISTS `User_interests`(
    `user_interest_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `interest_id` BIGINT UNSIGNED NULL,
    `username` VARCHAR(255) NULL
);
CREATE TABLE IF NOT EXISTS `events`(
    `event_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `event_name` VARCHAR(255) NOT NULL,
    `event_date` DATE NOT NULL,
    `event_time` TIME NOT NULL,
    `event_location` VARCHAR(255) NOT NULL,
    `cinema_id` VARCHAR(255) NULL,
    `About` TEXT NULL,
    `Image_url` VARCHAR(255) NULL,
    `Video_url` VARCHAR(255) NULL,
    `number_of_people` BIGINT NULL,
    `host_username` VARCHAR(255) NULL,
    `active` TINYINT(1) NULL DEFAULT TRUE,
    `normal_price` DOUBLE NOT NULL DEFAULT 100,
    `category` BIGINT UNSIGNED NULL,
    `like_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `Longitude` VARCHAR(255) NULL,
    `Latitude` VARCHAR(255) NULL,
    `event_passcode` VARCHAR(5) NULL
);

CREATE TABLE IF NOT EXISTS `featured_events`(
    `featured_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `event_id` BIGINT UNSIGNED NULL,
    `active` TINYINT(1) NOT NULL DEFAULT TRUE,
    `featured_from` DATETIME NOT NULL,
    `featured_to` DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS `ticket_transfer_logs`(
    `transfer_id` VARCHAR(36) NOT NULL PRIMARY KEY,
    `transfer_from` VARCHAR(255) NULL,
    `transfer_to` VARCHAR(255) NULL,
    `comment` TEXT NULL,
    `ticket_transfered` VARCHAR(36) NULL,
    `transfer_date` DATE NULL,
    `transfer_time` TIME NULL
);

CREATE TABLE IF NOT EXISTS `story_posts`(
    `story_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `image_url` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `username` VARCHAR(255) NULL,
    `date` DATE NULL,
    `time` TIME NULL,
    `view_count` BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `hosts`(
    `host_username` VARCHAR(255) NOT NULL PRIMARY KEY,
    `host_name` VARCHAR(255) NOT NULL,
    `host_description` TEXT NOT NULL,
    `host_email` VARCHAR(255) NOT NULL,
    `host_password` VARCHAR(255) NOT NULL,
    `host_phone` VARCHAR(255) NULL,
    `number_of_events_hosted` BIGINT NOT NULL,
    `profile_pic_url` VARCHAR(255) NULL,
    `follower_count` BIGINT NOT NULL DEFAULT 0,
    `email_verified` TINYINT(1) NULL DEFAULT FALSE,
    `phone_verified` TINYINT(1) NULL DEFAULT FALSE,
    `2FA_enabled` TINYINT(1) NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS `host_Bank_accounts`(
    `account_id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `host_username` VARCHAR(255) NULL,
    `bank_name` VARCHAR(255) NOT NULL,
    `bank_branch` VARCHAR(255) NOT NULL,
    `account_no` VARCHAR(255) NOT NULL
);

-- FOREIGN KEYS (This wont work on Planet scale coz it does not allow foreign keys !!!)

ALTER TABLE
    `tickets` ADD `tickets_event_id_foreign` FOREIGN KEY(`event_id`) REFERENCES `events`(`event_id`) 
	 

ALTER TABLE
    `featured_events` ADD `event_id_foreign` FOREIGN KEY(`event_id`) REFERENCES `events`(`event_id`) 
	 

ALTER TABLE
    `User_interests` ADD `fk_interest` FOREIGN KEY(`interest_id`) REFERENCES `event_categories`(`category_id`) 
	 
	 
ALTER TABLE
    `tickets` ADD `tickets_ticket_owner_foreign` FOREIGN KEY(`ticket_owner`) REFERENCES `users`(`username`) 
	 
	 
ALTER TABLE
    `events` ADD `events_host_username_foreign` FOREIGN KEY(`host_username`) REFERENCES `hosts`(`host_username`) 
	 
	 
ALTER TABLE
    `story_posts` ADD `story_post_username_foreign` FOREIGN KEY(`username`) REFERENCES `hosts`(`host_username`) 
	 

ALTER TABLE
    `Banned_users` ADD `banned_users_username_foreign` FOREIGN KEY(`username`) REFERENCES `users`(`username`)
    

ALTER TABLE
    `Banned_hosts` ADD `banned_hosts_host_username_foreign` FOREIGN KEY(`host_username`) REFERENCES 
    `hosts`(`host_username`) 
	 
ALTER TABLE
    `events` ADD `events_category_foreign` FOREIGN KEY(`category`) REFERENCES `event_categories`(`category_id`) 
	 
	 
ALTER TABLE
    `User_interests` ADD `user_interests_username_foreign` FOREIGN KEY(`username`) REFERENCES `users`(`username`) 
	 

ALTER TABLE
    `host_Bank_accounts` ADD `host_username_foreign` FOREIGN KEY(`host_username`) REFERENCES `hosts`(`host_username`) 
	 

ALTER TABLE `ticket_transfer_logs` ADD `username_foreign_to` FOREIGN KEY(`transfer_to`) REFERENCES `users`(`username`) 
	

ALTER TABLE
    `ticket_transfer_logs` ADD `username_foreign_from` FOREIGN KEY(`transfer_from`) REFERENCES `users`(`username`) 
	 

ALTER TABLE
    `ticket_transfer_logs` ADD `ticket_foreign` FOREIGN KEY(`ticket_transfered`) REFERENCES `tickets`(`ticket_id`) 
	 

-- inserting event_categories

INSERT INTO event_categories (category_name, category_description)
VALUES
	("Sports", "Activities involving physical exertion and skill"),
	("Festivals", "Gatherings of people for cultural or other events"),
	("Seminars", "Educational events focused on a specific topic"),
	("Concerts", "Live musical performances"),
	("Parties", "Social events where people gather to have fun"),
	("Webinars", "Online seminars or educational events"),
	("Movies", "Places where films are shown"),
	("Shows", "Performances or exhibitions of a particular kind"),
	("Other", "Miscellaneous or unspecified interests");
