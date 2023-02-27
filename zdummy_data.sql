
-- DUMMY DATA KEEP SAFE FOR TESTING

INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user7', 'Greta Smith', '1993-07-19', 'greta@example.com', 29, '123-456-7896', 'password7', 'San Francisco', '', 0, 0, 1, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user6', 'Frank Thompson', '1994-06-12', 'frank@example.com', 28, '123-456-7895', 'password6', 'Phoenix', '', 0, 0, 0, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user5', 'Emily Williams', '1999-05-05', 'emily@example.com', 23, '123-456-7894', 'password5', 'Philadelphia', '', 0, 1, 1, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user4', 'Diana Johnson', '1998-04-28', 'diana@example.com', 24, '123-456-7893', 'password4', 'Houston', '', 0, 1, 0, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user3', 'Charlie Brown', '1996-03-21', 'charlie@example.com', 26, '123-456-7892', 'password3', 'Los Angeles', '', 0, 0, 1, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user2', 'Bob Johnson', '1995-02-14', 'bob@example.com', 27, '123-456-7891', 'password2', 'Chicago', '', 0, 1, 0, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('user1', 'Alice Smith', '1997-01-01', 'kasjdkasjd', 25, '123-456-7890', 'password1', 'New York', '', 0, 1, 1, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('test2', 'Shiha  Mirz', '2003-10-10', 'kindl3rst1@outlook.com', 19, '8383838382', '$2b$10$N1BNqDfsHgMP7L/WnHMjm.fRQ/LqPAWyAu4v3i9I6y8DtCxLgU5mi', '{"timestamp":1676018275527,"mocked":false,"coords":{"altitude":1287.800048828125,"heading":0,"altitudeAccuracy":7.641275405883789,"latitude":-15.4303867,"speed":0,"longitude":28.3073389,"accuracy":52.400001525878906}}', NULL, 0, 1, 0, NULL, NULL, 0, 0);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('test', 'test test', '2003-10-10', 'mirzashihab2@outlook.com', 19, '2727272727', '$2b$10$itgOPxDJwSzKdWdTYMCUaucIKdI6YpUTslk8g4IdYghYQISwIuezW', NULL, NULL, 0, 0, 0, NULL, NULL, 0, 1);
INSERT INTO `users` (`username`, `fullname`, `DOB`, `email`, `age`, `phone`, `password`, `location`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `affiliate_code`, `affiliated_by`, `2FA_enabled`, `private_profile`) VALUES ('slide', 'Shihab  Mirheb', '2003-10-10', 'Mirzashihab2@gmail.com', 19, '2883329293', '$2b$10$16tZgxGR9/G.2fCP0HkIn.fXL6gqiELDPLx4Y0gv7aMLi45x1fY7a', NULL, '', 0, 0, 0, NULL, NULL, 0, 1);

INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe1', 'John Doe 1', 'John is an experienced event host', 'john1@example.com', 'password1', '1234567890', 5, 'https://example.com/john1.jpg', 100, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe10', 'John Doe 10', 'John is an expert event host', 'john10@example.com', 'password10', '0123456789', 9, 'https://example.com/john10.jpg', 85, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe2', 'John Doe 2', 'John is an event host who loves hosting events', 'john2@example.com', 'password2', '2345678901', 3, 'https://example.com/john2.jpg', 90, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe3', 'John Doe 3', 'John is a professional event host', 'john3@example.com', 'password3', '3456789012', 10, 'https://example.com/john3.jpg', 120, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe4', 'John Doe 4', 'John is an enthusiastic event host', 'john4@example.com', 'password4', '4567890123', 8, 'https://example.com/john4.jpg', 110, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe5', 'John Doe 5', 'John is an event host with great skills', 'john5@example.com', 'password5', '5678901234', 6, 'https://example.com/john5.jpg', 95, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe6', 'John Doe 6', 'John is a creative event host', 'john6@example.com', 'password6', '6789012345', 4, 'https://example.com/john6.jpg', 80, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe7', 'John Doe 7', 'John is a talented event host', 'john7@example.com', 'password7', '7890123456', 2, 'https://example.com/john7.jpg', 70, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe8', 'John Doe 8', 'John is a passionate event host', 'john8@example.com', 'password8', '8901234567', 1, 'https://example.com/john8.jpg', 65, 1, 1, 1);
INSERT INTO `hosts` (`host_username`, `host_name`, `host_description`, `host_email`, `host_password`, `host_phone`, `number_of_events_hosted`, `profile_pic_url`, `follower_count`, `email_verified`, `phone_verified`, `2FA_enabled`) VALUES ('john_doe9', 'John Doe 9', 'John is a seasoned event host', 'john9@example.com', 'password9', '9012345678', 7, 'https://example.com/john9.jpg', 75, 1, 1, 1);

INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (1, 'Sports', 'Activities involving physical exertion and skill');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (2, 'Festivals', 'Gatherings of people for cultural or other events');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (3, 'Seminars', 'Educational events focused on a specific topic');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (4, 'Concerts', 'Live musical performances');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (5, 'Parties', 'Social events where people gather to have fun');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (6, 'Webinars', 'Online seminars or educational events');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (7, 'Movies', 'Places where films are shown');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (8, 'Shows', 'Performances or exhibitions of a particular kind');
INSERT INTO `event_categories` (`category_id`, `category_name`, `category_description`) VALUES (9, 'Other', 'Miscellaneous or unspecified interests');

INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (15, 'Comedy Night', '2023-03-07', '00:00:00', 'Lusaka Comedy Club', 'A comedy night featuring local comedians', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A06.091Z.jpg', 'https://video.com/comedynight', 300, 'john_doe2', 1, 70, 7, 11, '28.2967', '-15.3936', '2');
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (13, 'Dance Festival', '2023-03-05', '22:00:00', 'Lusaka Dance Studios', 'A dance festival showcasing local dance groups', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-05T16%3A15%3A26.279Z.jpg', 'https://video.com/dancefest', 400, 'john_doe5', 1, 80, 5, 15, '28.3183', '-15.3937', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (12, 'Film Festival', '2023-03-04', '21:00:00', 'Lusaka Cinemas', 'A film festival showcasing local films', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T10%3A46%3A55.716Z.jpg', 'https://video.com/filmfest', 800, 'john_doe3', 1, 90, 4, 20, '28.2980', '-15.3890', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (14, 'Theatre Show', '2023-03-06', '23:00:00', 'Lusaka Theatre', 'A theatre show featuring local actors', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A04%3A19.858Z.jpg', 'https://video.com/theatreshow', 600, 'john_doe9', 1, 110, 6, 20, '28.3760', '-15.3857', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (9, 'Music Festival', '2023-03-01', '18:00:00', 'Lusaka Stadium', 'A music festival showcasing local talent', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A05%3A16.369Z.jpg', 'https://video.com/musicfest', 1000, 'john_doe1', 1, 120, 1, 21, '28.4536', '-15.3258', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (11, 'Food Festival', '2023-03-03', '20:00:00', 'Lusaka Showgrounds', 'A food festival showcasing local cuisine', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A04%3A50.362Z.jpg', 'https://video.com/foodfest', 1500, 'john_doe1', 1, 100, 3, 25, '28.3287', '-15.3967', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (16, 'Sports Tournament', '2023-03-08', '01:00:00', 'Lusaka Sports Complex', 'A sports tournament featuring local teams', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-05T16%3A15%3A26.279Z.jpg', 'https://video.com/sportstourn', 2000, 'john_doe2', 1, 140, 8, 25, '23.3238', '-15.3967', NULL);
INSERT INTO `events` (`event_id`, `event_name`, `event_date`, `event_time`, `event_location`, `About`, `Image_url`, `Video_url`, `number_of_people`, `host_username`, `active`, `normal_price`, `category`, `like_count`, `Longitude`, `Latitude`, `cinema_id`) VALUES (10, 'Art Show', '2023-03-02', '19:00:00', 'National Museum', 'An art show featuring local artists', 'https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'https://video.com/artshow', 500, 'john_doe2', 1, 150, 2, 30, '28.3279', '-15.3907', NULL);


INSERT INTO `featured_events` (`featured_id`, `event_id`, `active`, `featured_from`, `featured_to`) VALUES (1, 9, 1, '2023-02-05 12:03:30', '2023-02-05 12:03:31');
INSERT INTO `featured_events` (`featured_id`, `event_id`, `active`, `featured_from`, `featured_to`) VALUES (2, 15, 1, '2023-02-05 12:03:40', '2023-02-05 12:03:41');
INSERT INTO `featured_events` (`featured_id`, `event_id`, `active`, `featured_from`, `featured_to`) VALUES (3, 16, 1, '2023-02-05 12:03:52', '2023-02-05 12:03:53');


INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('1e69f0da-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 15, '2023-02-11', '12:53:42', 'normal_price', 0, 'A6', '11:30 AM');
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2a3e4fc0-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 15, '2023-02-11', '12:53:42', 'normal_price', 0, 'B7', '11:30 AM');
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2a74348a-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 15, '2023-02-10', '07:37:14', 'normal_price', 0, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2a904356-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 15, '2023-02-10', '07:37:14', 'normal_price', 0, 'B3', '11:30 AM');
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2aab3346-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 15, '2023-02-09', '15:23:58', 'normal_price', 0, 'A4', '17:00 PM');
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2b4da921-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 9, '2023-02-08', '09:13:21', 'normal_price', 0, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2b6872e4-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 9, '2023-02-08', '09:13:21', 'normal_price', 0, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2b8499fb-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 0, 9, '2023-02-08', '09:09:50', 'normal_price', 0, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2ae2240e-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 1, 9, '2023-02-08', '09:13:21', 'normal_price', 1, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2b17b243-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 0, 9, '2023-02-08', '09:09:50', 'normal_price', 1, NULL, NULL);
INSERT INTO `tickets` (`ticket_id`, `ticket_owner`, `ticket_description`, `show_under_participants`, `event_id`, `Date_of_purchase`, `time_of_purchase`, `ticket_type`, `redeemed`, `seat_number`, `cinema_time`) VALUES ('2b32cc04-ab6a-11ed-a7c1-ec8eb5541b18', 'slide', 'askjdaskdjaksjdasd', 0, 9, '2023-02-08', '09:09:50', 'normal_price', 1, NULL, NULL);

INSERT INTO `story_posts` (`image_url`, `description`, `title`, `username`, `date`, `time`, `view_count`) VALUES
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A06.091Z.jpg', 'Description for story', 'Title for image 1', 'john_doe1', '2023-02-18', '08:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 2', 'john_doe1', '2023-02-18', '09:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 3', 'john_doe2', '2023-02-18', '10:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 4', 'john_doe2', '2023-02-18', '11:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 5', 'john_doe3', '2023-02-18', '12:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 6', 'john_doe3', '2023-02-18', '13:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 7', 'john_doe4', '2023-02-18', '14:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 8', 'john_doe4', '2023-02-18', '15:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 9', 'john_doe5', '2023-02-18', '16:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 10', 'john_doe5', '2023-02-18', '17:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 11', 'john_doe6', '2023-02-18', '18:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 12', 'john_doe6', '2023-02-18', '19:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 13', 'john_doe7', '2023-02-18', '20:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 14', 'john_doe7', '2023-02-18', '21:30:00', 0),
('https://trybae-test.s3.amazonaws.com/Events/images/event_image_2023-01-30T11%3A06%3A54.620Z.jpg', 'Description for story', 'Title for image 15', 'john_doe8', '2023-02-18', '22:30:00', 0)