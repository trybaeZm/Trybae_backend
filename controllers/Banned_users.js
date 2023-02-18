const Model = require("../models/TryBae_db");

// Select all banned users
function getAllBannedUsers(req, res) {
	Model.connection.query(
		"SELECT * FROM Banned_users",
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Select banned user by ID
function getBannedUserById(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"SELECT * FROM Banned_users WHERE ban_id = ?",
		id,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

function getBannedUserByUsername(login, callback) {
	Model.connection.query(
		"SELECT * FROM Banned_users WHERE username = ?",
		login,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			callback(results);
		},
	);
}
// Add new banned user
function addBannedUser(req, res) {
	const bannedUser = req.body;
	Model.connection.query(
		"INSERT INTO Banned_users SET ?",
		bannedUser,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Update banned user by ID
function updateBannedUser(req, res) {
	const id = req.body.id;
	const bannedUser = req.body;
	Model.connection.query(
		"UPDATE Banned_users SET ? WHERE ban_id = ?",
		[bannedUser, id],
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Delete banned user by ID
function deleteBannedUser(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"DELETE FROM Banned_users WHERE ban_id = ?",
		id,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

module.exports = {
	getAllBannedUsers: getAllBannedUsers,
	getBannedUserById: getBannedUserById,
	getBannedUserByUsername: getBannedUserByUsername,
	addBannedUser: addBannedUser,
	updateBannedUser: updateBannedUser,
	deleteBannedUser: deleteBannedUser,
};
