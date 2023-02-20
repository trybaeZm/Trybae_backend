const Model = require("../models/TryBae_db");
const Flutterwave = require("../middleware/flutterwave");
const mongodb = require("../models/mongo_db");
const mysql = require("mysql2");
const got = require("got");
const { getEventById } = require("./events");
const { Expo } = require("expo-server-sdk");

let expo = new Expo({ accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN });

const create_ticket_query = (record, cb) => {
	const {
		ticket_owner,
		ticket_description,
		show_under_participants,
		event_id,
		ticket_type,
		date_of_purchase,
		time_of_purchase,
		redeemed = 0,
		is_cinema_ticket = false,
		seat_number = null,
		cinema_time = null,
		cinema_date = null,
	} = record;

	if (is_cinema_ticket == false) {
		Model.connection.query(
			`INSERT INTO tickets (ticket_id, ticket_owner, ticket_description, show_under_participants, event_id, 
		ticket_type, Date_of_purchase, time_of_purchase, redeemed)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				ticket_owner,
				ticket_description,
				show_under_participants,
				event_id,
				ticket_type,
				date_of_purchase,
				time_of_purchase,
				redeemed,
			],
			(error, results) => {
				if (error) {
					return cb(error);
				}
				// Send the results back to the client
				cb(null, results);
			},
		);
	} else {
		Model.connection.query(
			`INSERT INTO tickets (ticket_id, ticket_owner, ticket_description, show_under_participants, event_id, 
		ticket_type, Date_of_purchase, time_of_purchase, redeemed, seat_number, cinema_time, cinema_date)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				ticket_owner,
				ticket_description,
				show_under_participants,
				event_id,
				ticket_type,
				date_of_purchase,
				time_of_purchase,
				redeemed,
				seat_number,
				cinema_time,
				cinema_date,
			],
			(error, results) => {
				if (error) {
					return cb(error);
				}
				// Send the results back to the client
				cb(null, results);
			},
		);
	}
};

const delete_ticket_by_id_query = (ticket_id, cb) => {
	Model.connection.query(
		`DELETE FROM tickets WHERE ticket_id = ?`,
		[ticket_id],
		(error, results) => {
			if (error) {
				return cb(error);
			}
			// Send the results back to the client
			cb(null, results);
		},
	);
};

// Update event by ID
function updateTicketQuery(field, value, event_id) {
	Model.connection.query(
		"UPDATE tickets SET ?? = ? WHERE ticket_id = ?",
		[field, value, event_id],
		function (err, results) {
			if (err) throw err;
		},
	);
}

// NOT APPLICABLE RN

const get_all_user_tickets_query = (username, cb) => {
	Model.connection.query(
		`SELECT events.event_id AS events_event_id, events.event_name AS events_event_name, 
		events.event_date AS events_event_date, events.event_time AS events_event_time, 
		events.event_location AS events_event_location, events.About AS events_About, 
		events.Image_url AS events_Image_url, events.Video_url AS events_Video_url, 
		events.number_of_people AS events_number_of_people, events.host_username AS events_host_username, 
		events.active AS events_active, events.normal_price AS events_normal_price, 
		events.category AS events_category, events.like_count AS events_like_count, 
		events.cinema_id AS events_cinema_id,
		tickets.ticket_id AS tickets_ticket_id, tickets.ticket_owner AS tickets_ticket_owner, 
		tickets.ticket_description AS tickets_ticket_description, 
		tickets.show_under_participants AS tickets_show_under_participants, 
		tickets.Date_of_purchase AS tickets_Date_of_purchase, 
		tickets.time_of_purchase AS tickets_time_of_purchase, tickets.ticket_type AS tickets_ticket_type, 
		tickets.cinema_time AS tickets_cinema_time, tickets.cinema_date AS tickets_cinema_date, tickets.seat_number AS tickets_seat_number,
		tickets.redeemed AS tickets_redeemed
		FROM events
		JOIN tickets
		ON events.event_id = tickets.event_id
		WHERE tickets.ticket_owner = ?;
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

const get_user_ticket_by_id_query = (username, ticket_id, cb) => {
	Model.connection.query(
		"SELECT * FROM tickets WHERE ticket_owner = ? AND ticket_id = ?",
		[username, ticket_id],
		(error, results) => {
			if (error) {
				return cb(error);
			}
			// Send the results back to the client
			cb(null, results);
		},
	);
};

const delete_ticket_by_id = (req, res) => {
	const { ticket_id } = req.body;

	if (!ticket_id || ticket_id == undefined || ticket_id == null) {
		return res.send({
			status: "FAILURE",
			message: "Please provide a ticket id.",
		});
	}
	try {
		get_user_ticket_by_id_query(
			(username = req.decoded["username"]),
			ticket_id,
			(err, tickets) => {
				if (err) {
					res.send({
						status: "FAILURE",
						message: err,
					});
				} else {
					if (tickets.length < 1) {
						return res.send({
							status: "FAILURE",
							message: "A ticket with this id not found on your account!",
						});
					} else {
						delete_ticket_by_id_query(ticket_id, (err, results) => {
							if (err) {
								res.send({
									status: "FAILURE",
									message: err,
								});
							} else {
								res.send({
									status: "SUCCESS",
									message: "Deleted successfully",
								});
							}
						});
					}
				}
			},
		);
	} catch (err) {
		return res.send({ status: "FAILURE", message: "Unknown error" });
	}
};

const get_participants = (req, res) => {
	const { event_id } = req.body;

	if (!event_id) {
		res.send({ status: "FAILURE", message: "event id required" });
	}

	const query = `SELECT DISTINCT tickets.ticket_owner, users.username, users.fullname, 
	users.profile_pic_url, users.follower_count FROM tickets
	JOIN users ON tickets.ticket_owner = users.username
	WHERE tickets.event_id = ? AND show_under_participants = 1;`;

	Model.connection.query(query, [event_id], (err, results) => {
		if (err) {
			res.send({ status: "FAILURE", message: "query failed" });
		}
		if (results) {
			res.send({ status: "SUCCESS", participants: results });
		}
	});
};

const check_if_redeemed_query = (ticket_id, cb) => {
	let query = `SELECT redeemed from tickets WHERE ticket_id = ?`;
	Model.connection.query(query, [ticket_id], (err, result) => {
		if (!err && result) {
			return cb(null, result);
		} else {
			return cb(null);
		}
	});
};

const verify_ticket = (req, res) => {
	try {
		const { ticket_id } = req.query;

		if (!ticket_id || ticket_id == undefined || ticket_id == null) {
			return res.send({
				status: "FAILURE",
				message: "Please provide a ticket id.",
			});
		}

		const query = `SELECT * FROM tickets WHERE ticket_id = ?`;

		Model.connection.query(query, [ticket_id], (err, results) => {
			if (!err && results.length > 0) {
				return res.send(
					`<h2 style="color:green;">Ticket is valid and belongs to user: <em>${results[0].ticket_owner}</em></h2>`,
				);
			} else {
				return res.send(
					`<h2 style="color:red;">Ticket not found, Report user immediately!</h2>`,
				);
			}
		});
	} catch (err) {
		return res.send(`<h2>Try again in a short while or contact support.</h2>`);
	}
};

const get_all_user_tickets = (req, res) => {
	// Get the user's username from the decoded token
	const username = req.decoded["username"];

	if (!username) {
		return res.send({ status: "FAILURE", message: "insufficient privileges" });
	} else {
		// Query the database for all the tickets belonging to the user
		get_all_user_tickets_query(username, (err, tickets) => {
			if (err) {
				return res.send({ message: "err" });
			} else {
				return res.send(tickets);
			}
		});
	}
};

const date_from_to_calc = (days_before = 2) => {
	const date = new Date();
	const year = date.getFullYear();
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	const TO_DATE = `${year}-${month}-${day}`;

	date.setDate(date.getDate() - days_before);
	const year2 = date.getFullYear();
	const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
	const day2 = date.getDate().toString().padStart(2, "0");
	const FROM_DATE = `${year2}-${month2}-${day2}`;

	return { FROM_DATE, TO_DATE };
};

const amount_calculator = async (
	ticket_type,
	qty = 1,
	event_id,
	normal_price = 0,
) => {
	let found = await mongodb.TicketTypes.findOne({
		event_id: event_id,
		ticket_type: ticket_type,
	});

	try {
		let price = 0;

		if (!found) {
			return normal_price == 0 ? false : (normal_price *= qty);
		} else {
			price = found.ticket_price;

			return price == 0 ? false : (price *= qty);
		}
	} catch (error) {
		return false;
	}
};

const checkObject = (obj) => {
	for (let key in obj) {
		if (obj[key] === undefined) return true;
		if (typeof obj[key] === "object") {
			if (checkObject(obj[key])) return true;
		}
	}
	return false;
};

const buy_ticket = async (req, res) => {
	const {
		ticket_owner,
		ticket_description,
		show_under_participants,
		event_id,
		ticket_type,
		time = new Date(),
		redeemed = false,
	} = req.body.ticket;
	const qty = req.body.qty || 1;

	if (
		ticket_owner === undefined ||
		ticket_description === undefined ||
		show_under_participants === undefined ||
		event_id === undefined ||
		ticket_type === undefined
	) {
		return res.send({
			status: "FAILURE",
			messgae: "Missing some ticket details",
		});
	} else {
		try {
			getEvent_query("event_id", event_id, async (err, result) => {
				if (!err && result) {
					const amount = await amount_calculator(
						req.body.ticket.ticket_type,
						qty,
						event_id,
						result.normal_price,
					);

					if (amount == false) {
						return res.send({
							status: "FAILURE",
							message:
								"invalid ticket type or event not found for ticket type comparison",
						});
					} else {
						const tx_ref = `user:'${
							req.decoded["username"]
						}_date:${new Date()}_event:${event_id}_qty:${qty}_type:${ticket_type}`;

						const Payment_payload = {
							headers: {
								Authorization: `Bearer ${process.env.FLW_SECRET_KEY_TEST}`,
							},
							json: {
								tx_ref: tx_ref,
								amount: amount + amount * 0.12,
								currency: "ZMW",
								redirect_url: "http://api.trybae.com/transactions/verifytxn",
								meta: {
									consumer_id: req.decoded["username"],
								},
								customer: {
									email: req.body.Payment_payload.customer.email,
									phonenumber: req.body.Payment_payload.customer.phone,
									name: req.decoded["username"],
								},
								customizations: {
									title: "TryBae tickets",
								},
							},
						};
						if (checkObject(Payment_payload) == false) {
							let response = await got.post(
								"https://api.flutterwave.com/v3/payments",
								Payment_payload,
							);
							let body = JSON.parse(response.body);

							if (body.status == "success") {
								const newPendingTicket = mongodb.Tickets({
									ticket_owner: ticket_owner,
									ticket_description: ticket_description,
									show_under_participants:
										show_under_participants !== false
											? true
											: show_under_participants,
									ticket_type: ticket_type,
									event_id: event_id,
									date_of_purchase: new Date().toISOString().slice(0, 10),
									time_of_purchase:
										("0" + time.getHours()).slice(-2) +
										":" +
										("0" + time.getMinutes()).slice(-2) +
										":" +
										("0" + time.getSeconds()).slice(-2),
									redeemed: redeemed,
									tx_ref: tx_ref,
									qty: qty,
								});

								await newPendingTicket.save();
								return res.send({
									status: "SUCCESS",
									message: "Redirect to payment link",
									link: body.data.link,
								});
							} else {
								return res.send({
									status: "FAILURE",
									message:
										"Middleware error, please contact support or try later",
								});
							}
						} else {
							return res.send({
								status: "FAILURE",
								message: "One or more properties of payment payload undefined",
							});
						}
					}
				} else {
					return res.send({
						status: "FAILURE",
						message: "Event not found, contact support to fix this",
					});
				}
			});
		} catch (err) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error, contact support, or try later.",
				code: "99",
			});
		}
	}
};

const buy_cinema_ticket = async (req, res) => {
	const {
		ticket_owner,
		ticket_description,
		show_under_participants,
		event_id,
		ticket_type,
		time = new Date(),
		redeemed = false,
	} = req.body.ticket;
	const qty = req.body.qty || 1;
	const { seatsChosen } = req.body;
	const { cinema_time } = req.body;
	const { cinema_date } = req.body;

	if (
		ticket_owner === undefined ||
		ticket_description === undefined ||
		show_under_participants === undefined ||
		event_id === undefined ||
		ticket_type === undefined ||
		seatsChosen?.length < 1 ||
		seatsChosen == undefined ||
		cinema_time == undefined ||
		cinema_date == undefined
	) {
		return res.send({
			status: "FAILURE",
			messgae: "Missing some ticket details",
		});
	} else {
		try {
			getEvent_query("event_id", event_id, async (err, result) => {
				if (!err && result) {
					const amount = await amount_calculator(
						req.body.ticket.ticket_type,
						qty,
						event_id,
						result.normal_price,
					);

					if (amount == false) {
						return res.send({
							status: "FAILURE",
							message:
								"invalid ticket type or event not found for ticket type comparison",
						});
					} else {
						const tx_ref = `user:'${
							req.decoded["username"]
						}_date:${new Date()}_event:${event_id}_qty:${
							seatsChosen?.length || qty
						}_type:${ticket_type}_seats_${seatsChosen}`;

						const Payment_payload = {
							headers: {
								Authorization: `Bearer ${process.env.FLW_SECRET_KEY_TEST}`,
							},
							json: {
								tx_ref: tx_ref,
								amount: amount + amount * 0.12, //Service cost
								currency: "ZMW",
								redirect_url: "http://api.trybae.com/transactions/verifytxn",
								meta: {
									consumer_id: req.decoded["username"],
								},
								customer: {
									email: req.body.Payment_payload.customer.email,
									phonenumber: req.body.Payment_payload.customer.phone,
									name: req.decoded["username"],
								},
								customizations: {
									title: "TryBae tickets",
								},
							},
						};
						if (checkObject(Payment_payload) == false) {
							let response = await got.post(
								"https://api.flutterwave.com/v3/payments",
								Payment_payload,
							);
							let body = JSON.parse(response.body);

							if (body.status == "success") {
								const newPendingTicket = mongodb.Tickets({
									ticket_owner: ticket_owner,
									ticket_description: ticket_description,
									show_under_participants:
										show_under_participants !== false
											? true
											: show_under_participants,
									ticket_type: ticket_type,
									event_id: event_id,
									date_of_purchase: new Date().toISOString().slice(0, 10),
									time_of_purchase:
										("0" + time.getHours()).slice(-2) +
										":" +
										("0" + time.getMinutes()).slice(-2) +
										":" +
										("0" + time.getSeconds()).slice(-2),
									redeemed: redeemed,
									tx_ref: tx_ref,
									qty: qty,
									seatsChosen: seatsChosen,
									is_cinema_ticket: true,
									cinema_time: cinema_time,
									cinema_date: cinema_date,
								});

								await newPendingTicket.save();
								return res.send({
									status: "SUCCESS",
									message: "Redirect to payment link",
									link: body.data.link,
								});
							} else {
								return res.send({
									status: "FAILURE",
									message:
										"Middleware error, please contact support or try later",
								});
							}
						} else {
							return res.send({
								status: "FAILURE",
								message: "One or more properties of payment payload undefined",
							});
						}
					}
				} else {
					return res.send({
						status: "FAILURE",
						message: "Event not found, contact support to fix this",
					});
				}
			});
		} catch (err) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error, contact support, or try later.",
				code: "99",
			});
		}
	}
};

function getEvent_query(field, value, callback) {
	const query = mysql.format("SELECT * FROM events WHERE ?? = ?", [
		field,
		value,
	]);
	Model.connection.query(query, function (error, results) {
		if (error) {
			callback(error, null);
		} else {
			callback(null, results[0]);
		}
	});
}

const getUserByUsername = (username, cb) => {
	const query = `SELECT * FROM users WHERE username = ?`;
	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return cb(error);
		}
		cb(null, results[0]);
	});
};

const new_transfer_log = (data, cb) => {
	const time = new Date();
	const {
		transfer_to,
		transfer_from,
		comment = null,
		ticket_transfered,
		transfer_date = new Date().toISOString().slice(0, 10),
		transfer_time = ("0" + time.getHours()).slice(-2) +
			":" +
			("0" + time.getMinutes()).slice(-2) +
			":" +
			("0" + time.getSeconds()).slice(-2),
	} = data;

	const query = `INSERT INTO ticket_transfer_logs 
	(transfer_id, transfer_from, transfer_to, comment, ticket_transfered, transfer_date, transfer_time)
	VALUES(UUID(), ?, ?, ?, ?, ?, ?)`;
	Model.connection.query(
		query,
		[
			transfer_from,
			transfer_to,
			comment,
			ticket_transfered,
			transfer_date,
			transfer_time,
		],
		(err, results) => {
			if (err || !results) {
				return cb(err);
			} else {
				cb(null, results);
			}
		},
	);
};

const transfer_ticket = (req, res) => {
	const { ticket_id, transfer_to, comment } = req.body;

	const username = req.decoded["username"];

	if (username == transfer_to) {
		return res.send({
			status: "FAILURE",
			message: "Cannot transfer to self",
		});
	}

	try {
		get_user_ticket_by_id_query(username, ticket_id, async (err, result) => {
			if (!err && result[0] !== undefined) {
				getUserByUsername(transfer_to, (err, result) => {
					if (!err && result) {
						try {
							updateTicketQuery("ticket_owner", transfer_to, ticket_id);

							try {
								new_transfer_log(
									{
										ticket_transfered: ticket_id,
										transfer_to: transfer_to,
										transfer_from: username,
										comment: comment,
									},
									(err, results) => {
										if (err) {
											console.log(err);
										} else {
											console.log("Transfer log saved successfully!");
										}
									},
								);

								if (!Expo.isExpoPushToken(result.Expo_push_token)) {
									console.error(
										`Push token ${result.Expo_push_token} is not a valid Expo push token`,
									);
								}
							} catch (err) {}
						} catch (err) {
							console.log(err);
							return res.send({
								status: "FAILURE",
								message: "Unknown error, ticket might have been transfered, restart app to confirm",
							});
						}

						return res.send({
							status: "SUCCESS",
							message: `Ticket with id: '${ticket_id}' transferred to user: '${transfer_to}'`,
						});
					} else {
						return res.send({
							status: "FAILURE",
							message: "The user you want to transfer to, is not found.",
						});
					}
				});
			} else {
				return res.send({
					status: "FAILURE",
					message: "Either ticket doesnt exist, or you dont own it.",
				});
			}
		});
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: "Unknown error, try later, or contact support.",
		});
	}
};

const get_ticket_by_id = (req, res) => {
	const { ticket_id } = req.body;
	const username = req.decoded["username"];

	// Query the database for all the tickets belonging to the user
	get_user_ticket_by_id_query(username, ticket_id, (err, tickets) => {
		if (err) {
			return res.send(err);
		} else {
			if (tickets.length < 1) {
				return res.send({
					status: "FAILURE",
					message: "A ticket with this id not found on this account",
				});
			} else {
				return res.send({ status: "SUCCESS", ticket: tickets[0] });
			}
		}
	});
};

module.exports = {
	get_all_user_tickets,
	get_ticket_by_id,
	buy_ticket,
	buy_cinema_ticket,
	delete_ticket_by_id,
	verify_ticket,
	get_participants,
	transfer_ticket,
	create_ticket_query,
};
