const Model = require("../models/TryBae_db");

// Select all banned hosts
function getAllBannedHosts(req, res) {
	Model.connection.query(
		"SELECT * FROM Banned_hosts",
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Select banned host by ID
function getBannedHostById(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"SELECT * FROM Banned_hosts WHERE ban_id = ?",
		id,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

function getBannedHostByUsername(login, callback) {
	Model.connection.query(
		"SELECT * FROM Banned_hosts WHERE host_username = ?",
		login,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {

				callback(results);
			}
		},
	);
}

// Add new banned host
function addBannedHost(req, res) {
	const bannedHost = req.body;
	Model.connection.query(
		"INSERT INTO Banned_hosts SET ?",
		bannedHost,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Update banned host by ID
function updateBannedHost(req, res) {
	const id = req.body.id;
	const bannedHost = req.body;
	Model.connection.query(
		"UPDATE Banned_hosts SET ? WHERE ban_id = ?",
		[bannedHost, id],
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Delete banned host by ID
function deleteBannedHost(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"DELETE FROM Banned_hosts WHERE ban_id = ?",
		id,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

module.exports = {
	getAllBannedHosts: getAllBannedHosts,
	getBannedHostById: getBannedHostById,
	getBannedHostByUsername: getBannedHostByUsername,
	addBannedHost: addBannedHost,
	updateBannedHost: updateBannedHost,
	deleteBannedHost: deleteBannedHost,
};
