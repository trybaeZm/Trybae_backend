const mongo_db = require("../models/mongo_db");
const cinemas_static = require("../static/cinemas");
const Model = require("../models/TryBae_db");
const redisClient = require("../models/redis");

const insert_static = async (req, res) => {
	if (req.decoded["privs"] != "admin") {
		res.send("insufficient privileges");
	} else {
		try {
			const result = await mongo_db.Cinemas.insertMany(cinemas_static.cinemas);
			console.log(result);

			if (result.length == cinemas_static.cinemas.length) {
				return res.send({
					status: "SUCCESS",
					message: "updated cinemas success",
				});
			} else {
				return res.send({
					status: "FAILURE",
					message: "One or more errors occured, maybe data is inconsistent",
				});
			}
		} catch (err) {
			return res.send({ status: "FAILURE", message: "Unknown error" });
		}
	}
};

const get_seats_for_event = (req, res) => {
	const { event_id } = req.body;

	if (!event_id) {
		return res.send({ status: "FAILURE", message: "Missing parameters" });
	}

	const query = `SELECT seat_number, cinema_time, cinema_date FROM tickets WHERE event_id = ?`;

	try {
		Model.connection.query(query, [event_id], (err, results) => {
			if (!err && results) {
				return res.send({ status: "SUCCESS", data: results });
			} else {
				return res.send({ status: "FAILURE", message: "event not found" });
			}
		});
	} catch (err) {
		return res.send({ status: "FAILURE", message: "Unknown error" });
	}
};

const insert_cinema = async (req, res) => {
	const { cinema } = req.body;
	if (req.decoded["privs"] != "admin") {
		res.send("insufficient privileges");
	} else {
		if (!cinema) {
			return res.send({
				status: "FAILURE",
				message: "Please provide cinema",
			});
		} else {
			try {
				const newcinema = new mongo_db.Cinemas({
					cinema_id: cinema.cinema_id,
					cinema_name: cinema.cinema_name,
					cinema_seats: cinema.cinema_seats,
				});
				const result = await newcinema.save();
				if (result) {
					return res.send({
						status: "SUCCESS",
						message: "saved new cinema",
					});
				} else {
					return res.send({
						status: "FAILURE",
						message: "One or more errors occured, maybe data is inconsistent",
					});
				}
			} catch (err) {
				return res.send({ status: "FAILURE", message: "Unknown error" });
			}
		}
	}
};

const get_cinema_times_and_dates = async (req, res) => {
	const { cinema_id, event_id } = req.body;

	if ((!cinema_id, !event_id)) {
		return res.send({ status: "FAILURE", message: "Missing parameters" });
	} else {
		try {
			const found = await mongo_db.CinemaTimes.find({
				event_id: event_id,
				cinema_id: cinema_id,
			});

			if (found?.length > 0) {
				return res.send({ status: "SUCCESS", data: found });
			} else {
				return res.send({
					status: "FAILURE",
					message: "event times not found",
				});
			}
		} catch (error) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error",
			});
		}
	}
};

const insert_cinema_times_and_dates = async (req, res) => {
	const { cinema_id, event_id, cinema_date, cinema_times } = req.body;

	// if (req.decoded["privs"] == "admin") {
	// 	return res.send("insufficient privileges");
	// }

	if (
		!cinema_id ||
		!event_id ||
		!cinema_times ||
		cinema_times?.length < 1 ||
		!cinema_date
	) {
		return res.send({
			status: "FAILURE",
			message: "Missing details",
		});
	} else {
		const found = await mongo_db.CinemaTimes.findOne({
			cinema_id: cinema_id,
			event_id: event_id,
			cinema_date: cinema_date,
		});

		if (found) {
			await mongo_db.CinemaTimes.deleteOne({
				cinema_id: cinema_id,
				event_id: event_id,
				cinema_date: cinema_date,
			});
		}
		const newCinemaTimes = new mongo_db.CinemaTimes({
			cinema_id: cinema_id,
			event_id: event_id,
			cinema_date: cinema_date,
			cinema_times: cinema_times,
		});

		try {
			await newCinemaTimes.save();

			return res.send({
				status: "SUCCESS",
				message: "Saved these times successfully",
			});
		} catch (err) {
			return res.send({
				status: "FAILURE",
				message: "Unknown error",
			});
		}
	}
};

const get_cinema = async (req, res) => {
	if (req.body.cinema_id == undefined) {
		return res.send({ status: "FAILURE", message: "Please provide cinema id" });
	} else {
		try {
			const result = await mongo_db.Cinemas.findOne({
				cinema_id: req.body.cinema_id,
			});
			if (result) {
				return res.send({
					status: "SUCCESS",
					data: result,
				});
			} else {
				return res.send({
					status: "FAILURE",
					message: "Cinema Not found",
				});
			}
		} catch (err) {
			return res.send({ status: "FAILURE", message: "Unknown error" });
		}
	}
};

module.exports = {
	insert_static,
	get_cinema,
	insert_cinema,
	get_seats_for_event,
	insert_cinema_times_and_dates,
	get_cinema_times_and_dates,
};
