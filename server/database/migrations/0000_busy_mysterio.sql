CREATE TABLE `messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`message` varchar(255) NOT NULL,
	`room_id` int,
	`createddate` datetime NOT NULL,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rooms` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	CONSTRAINT `rooms_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_room_id_rooms_id_fk` FOREIGN KEY (`room_id`) REFERENCES `rooms`(`id`) ON DELETE no action ON UPDATE no action;