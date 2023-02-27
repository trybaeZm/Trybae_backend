const Model = require("../models/TryBae_db");
const mysql = require("mysql2");
const mongo_db = require("../models/mongo_db");
const { createMulter } = require("../middleware/multer-upload");

const getUserByUsername = (username, cb) => {
	const query = `SELECT * FROM users WHERE username = ?`;
	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return cb(error);
		}
		cb(null, results[0]);
	});
};

const get_all_user_tickets_query = (username, cb) => {
	Model.connection.query(
		`SELECT events.event_id AS events_event_id, events.event_name AS events_event_name,
events.event_date AS events_event_date, events.event_time AS events_event_time,
events.event_location AS events_event_location, events.About AS events_About,
events.Image_url AS events_Image_url, events.Video_url AS events_Video_url,
events.number_of_people AS events_number_of_people, events.host_username AS events_host_username,
events.active AS events_active, events.normal_price AS events_normal_price,
events.category AS events_category, events.like_count AS events_like_count,
tickets.ticket_id AS tickets_ticket_id,
tickets.Date_of_purchase AS tickets_Date_of_purchase,
tickets.time_of_purchase AS tickets_time_of_purchase, tickets.ticket_type AS tickets_ticket_type,
tickets.redeemed AS tickets_redeemed,
(SELECT COUNT(*)
FROM tickets t
WHERE t.event_id = tickets.event_id
AND t.ticket_owner = tickets.ticket_owner) AS tickets_bought
FROM events
JOIN tickets
ON events.event_id = tickets.event_id
WHERE tickets.ticket_owner = ?
AND tickets.ticket_id = (SELECT MIN(ticket_id)
FROM tickets t
WHERE t.event_id = tickets.event_id
AND t.ticket_owner = tickets.ticket_owner);
		`,
		[username],
		(error, results) => {
			if (error) {
				return cb(error);
			}
			// Send the results back to the client
			cb(null, results);
		},
	);
};

const getTickets = (req, res) => {
	// Get the user's username from the decoded token
	const { profileusername } = req.body;

	console.log(req.body);
	const username = req.decoded["username"];

	if (!username || !profileusername) {
		return res.send({ status: "FAILURE", message: "insufficient privileges" });
	} else {
		try {
			getUserByUsername(profileusername, async (err, result) => {
				if (!err && result) {
					const found = await mongo_db.Followers.findOne({
						follower_id: username,
						following_id: profileusername,
						follower_type: "user",
						following_type: "user",
					});
					if (
						result.private_profile == 0 ||
						result.private_profile == false ||
						found
					) {
						// Query the database for all the tickets belonging to the user
						get_all_user_tickets_query(profileusername, (err, tickets) => {
							if (err) {
								return res.send({ status: "FAILURE", message: "err" });
							} else {
								return res.send({ status: "SUCCESS", data: tickets });
							}
						});
					} else {
						return res.send({
							status: "FAILURE",
							message: "User has private profile",
						});
					}
				} else {
					return res.send({
						status: "FAILURE",
						message: "User not found",
					});
				}
			});
		} catch (err) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error",
			});
		}
	}
};

function getProfile(req, res) {
	const { profileusername } = req.body;
	const username = req.decoded["username"];

	if (!profileusername) {
		return res.send("No username specified");
	} else {
		try {
			getUserByUsername(profileusername, async (err, result) => {
				if (!err && result) {
					const found = await mongo_db.Followers.findOne({
						follower_id: username,
						following_id: profileusername,
						follower_type: "user",
						following_type: "user",
					});
					if (
						result.private_profile == 0 ||
						result.private_profile == false ||
						found
					) {
						const query = `SELECT username, fullname, DOB, email, age, phone, location, profile_pic_url, follower_count, 
                email_verified, phone_verified FROM users WHERE username = ?`;

						Model.connection.query(query, [profileusername], (err, result) => {
							if (!err && result) {
								return res.send({ status: "SUCCESS", data: result });
							} else {
								return res.send({
									status: "FAILURE",
									message: "Error retrieving user data",
								});
							}
						});
					} else {
						return res.send({
							status: "FAILURE",
							message: "User has private profile",
						});
					}
				} else {
					return res.send({
						status: "FAILURE",
						message: "User not found",
					});
				}
			});
		} catch (err) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error",
			});
		}
	}
}

module.exports = {
	getProfile,
	getTickets,
};
