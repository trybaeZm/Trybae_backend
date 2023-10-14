const Model = require("../models/TryBae_db");

// Select all user interests
function getAllUserInterests(req, res) {
	Model.connection.query(
		"SELECT * FROM User_interests",
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Select user interest by ID
function getUserInterestById(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"SELECT * FROM User_interests WHERE user_interest_id = ?",
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

// Select user interests by username
function getUserInterestsByUsername(req, res) {
	const username = req.body.username;
	Model.connection.query(
		"SELECT * FROM User_interests WHERE username = ?",
		username,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Add new user interest
function addUserInterest(req, res) {
	const { interest_id } = req.body;
	const user = req.decoded["username"];
	try {
		Model.connection.query(
			"INSERT INTO User_interests (interest_id, username) VALUES (?, ?)",
			[interest_id, user],
			function (error, results) {
				if (error) {
					res.send({ status: "FAILURE", message: "Unknown error" });
				} else {
					console.log(results.insertId);
				}
			},
		);

		res.send({ status: "SUCCESS", message: "added interests" });
	} catch (err) {
		res.send({ status: "FAILURE", message: "unknow error" });
	}
}

// Update user interest by ID
function updateUserInterest(req, res) {
	const id = req.body.id;
	const userInterest = req.body;
	Model.connection.query(
		"UPDATE User_interests SET ? WHERE user_interest_id = ?",
		[userInterest, id],
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

// Delete user interest by ID
function deleteUserInterest(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"DELETE FROM User_interests WHERE user_interest_id = ?",
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
	getAllUserInterests: getAllUserInterests,
	getUserInterestById: getUserInterestById,
	getUserInterestsByUsername: getUserInterestsByUsername,
	addUserInterest: addUserInterest,
	updateUserInterest: updateUserInterest,
	deleteUserInterest: deleteUserInterest,
};
