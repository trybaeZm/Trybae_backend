const Model = require("../models/TryBae_db");

// Select all interests
function getAllInterests(req, res) {
	Model.connection.query("SELECT * FROM interests", function (error, results) {
		if (error) {
			res.send({ status: "FAILURE", message: "Unknown error" });
		}
		res.send({ status: "SUCCESS", results: results });
	});
}

// Select interest by ID
function getInterestById(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"SELECT * FROM interests WHERE interest_id = ?",
		id,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Select interest by name
function getInterestByName(req, res) {
	const name = req.body.name;
	Model.connection.query(
		"SELECT * FROM interests WHERE interest_name = ?",
		name,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Add new interest
function addInterest(req, res) {
	const interest = req.body;
	Model.connection.query(
		"INSERT INTO interests SET ?",
		interest,
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

// Update interest by ID
function updateInterest(req, res) {
	const id = req.body.id;
	const interest = req.body;
	Model.connection.query(
		"UPDATE interests SET ? WHERE interest_id = ?",
		[interest, id],
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			}
			res.send({ status: "SUCCESS", results: results });
		},
	);
}

function deleteInterest(req, res) {
	const id = req.body.id;
	Model.connection.query(
		"DELETE FROM interests WHERE interest_id = ?",
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
	getAllInterests: getAllInterests,
	getInterestById: getInterestById,
	getInterestByName: getInterestByName,
	addInterest: addInterest,
	updateInterest: updateInterest,
	deleteInterest: deleteInterest,
};
