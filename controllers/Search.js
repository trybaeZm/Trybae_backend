const Model = require("../models/TryBae_db");
const mysql = require("mysql2");
const mongo_db = require("../models/mongo_db");

const Full_search = async (req, res) => {
	const { full_text_search } = req.body;

	console.log(req.body);
	if (!full_text_search) {
		return res.send({
			status: "FAILURE",
			message: "search payload not present",
		});
	} else {
		const results = await search("%" + full_text_search + "%");

		if (
			results.events?.length == 0 &&
			results.hosts?.length == 0 &&
			results.users?.length == 0
		) {
			return res.send({ status: "EMPTY", data: results });
		} else {
			return res.send({ status: "SUCCESS", data: results });
		}
	}
};

async function search(full_text_search) {
	let Search_results = {
		events: [],
		hosts: [],
		users: [],
	};

	const EventSearch = `SELECT * FROM events WHERE event_name LIKE ? OR event_location LIKE ?`;

	const HostSearch = `SELECT host_username, host_description, profile_pic_url FROM hosts WHERE host_username LIKE ? OR host_description LIKE ?`;

	const UserSearch = `SELECT username, fullname, profile_pic_url FROM users WHERE username LIKE ? OR fullname LIKE ?`;

	const eventResults = await new Promise((resolve, reject) => {
		Model.connection.query(
			EventSearch,
			[full_text_search, full_text_search],
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			},
		);
	});
	Search_results.events = eventResults;

	const hostResults = await new Promise((resolve, reject) => {
		Model.connection.query(
			HostSearch,
			[full_text_search, full_text_search],
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			},
		);
	});
	Search_results.hosts = hostResults;

	const userResults = await new Promise((resolve, reject) => {
		Model.connection.query(
			UserSearch,
			[full_text_search, full_text_search],
			(err, results) => {
				if (err) {
					reject(err);
				} else {
					resolve(results);
				}
			},
		);
	});
	Search_results.users = userResults;

	return Search_results;
}

module.exports = {
	Full_search,
};
