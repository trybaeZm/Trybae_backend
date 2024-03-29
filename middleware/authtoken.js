const jwt = require("jsonwebtoken");
const mongo_db = require("../models/mongo_db");

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;

const createJWTtoken = (username, privs = "user") => {
	const date = new Date();
	const JWT_EXPIRATION_TIME =
		privs === "admin"
			? Math.floor(date.getTime() / 1000) + 60 * 10 // 10 minutes from now if admin
			: Math.floor(date.getTime() / 1000) + 60 * 45; // changed it to 45 minutes from now if host or user

	return jwt.sign(
		{ username, exp: JWT_EXPIRATION_TIME, privs: privs },
		privs === "admin" ? ADMIN_JWT_SECRET : JWT_SECRET,
	);
};

function generateRefreshToken(username, privs = "user") {
	const date = new Date();
	const REFRESH_EXPIRATION_TIME = date.setMonth(date.getMonth() + 1); // 1 month from now

	const refreshToken = jwt.sign(
		{ username, exp: REFRESH_EXPIRATION_TIME, privs: privs },
		REFRESH_SECRET,
	);

	if (privs == "user") {
		mongo_db.RefreshToken.deleteMany(
			{ userId: username },
			function (err, result) {
				if (!err) {
					console.log(
						`cleared previous refresh token for ${privs}: '${username}'`,
					);
				}
			},
		);

		mongo_db.RefreshToken.create(
			{
				token: refreshToken,
				userId: username,
				expires: REFRESH_EXPIRATION_TIME,
			},
			(err, doc) => {
				if (err || !doc) {
					return false;
				}
			},
		);
		return refreshToken;
	}

	if (privs == "host") {
		mongo_db.HostRefreshToken.deleteMany(
			{ userId: username },
			function (err, result) {
				if (!err) {
					console.log(
						`cleared previous refresh token for ${privs}: '${username}'`,
					);
				}
			},
		);

		mongo_db.HostRefreshToken.create(
			{
				token: refreshToken,
				userId: username,
				expires: REFRESH_EXPIRATION_TIME,
			},
			(err, doc) => {
				if (err || !doc) {
					return false;
				}
			},
		);
		return refreshToken;
	}

	if (privs == "admin") {
		mongo_db.AdminRefreshToken.deleteMany(
			{ userId: username },
			function (err, result) {
				if (!err) {
					console.log(
						`cleared previous refresh token for ${privs}: '${username}'`,
					);
				}
			},
		);

		mongo_db.AdminRefreshToken.create(
			{
				token: refreshToken,
				userId: username,
				expires: REFRESH_EXPIRATION_TIME,
			},
			(err, doc) => {
				if (err || !doc) {
					return false;
				}
			},
		);
		return refreshToken;
	}
}

const verifyRefreshToken = (token, username, res) => {
	try {
		// Verify the token and decode the payload
		const decoded = jwt.verify(token, REFRESH_SECRET);

		if (decoded.username !== username) {
			return res.status(404).send({ auth: false, message: "Token mismatch" });
		}


		if (decoded.privs == "user") {
			mongo_db.RefreshToken.findOne({ token: token }, (err, doc) => {
				if (err || !doc) {
					return res.status(401).send({
						status: false,
						message: "Invalid refresh token, Log in again...",
					});
				}
				// Check that the refresh token has not expired
				if (doc.expires < new Date()) {
					return res.status(401).send({
						status: false,
						message: "Refresh token has expired, Log in again...",
					});
				}
				// Generate a new JWT for the user with the ID stored in the refresh token
				const jwt = createJWTtoken(decoded.username, decoded.privs);
				// Send the new JWT to the client
				res.send({ status: true, jwt });
			});
		}

		if (decoded.privs == "host") {
			mongo_db.HostRefreshToken.findOne({ token: token }, (err, doc) => {
				if (err || !doc) {
					return res.status(401).send({
						status: false,
						message: "Invalid refresh token, Log in again...",
					});
				}
				// Check that the refresh token has not expired
				if (doc.expires < new Date()) {
					return res.status(401).send({
						status: false,
						message: "Refresh token has expired, Log in again...",
					});
				}
				// Generate a new JWT for the user with the ID stored in the refresh token
				const jwt = createJWTtoken(decoded.username, decoded.privs);
				// Send the new JWT to the client
				res.send({ status: true, jwt });
			});
		}

		if (decoded.privs == "admin") {
			mongo_db.AdminRefreshToken.findOne({ token: token }, (err, doc) => {
				if (err || !doc) {
					return res.status(401).send({
						status: false,
						message: "Invalid refresh token, Log in again...",
					});
				}
				// Check that the refresh token has not expired
				if (doc.expires < new Date()) {
					return res.status(401).send({
						status: false,
						message: "Refresh token has expired, Log in again...",
					});
				}
				// Generate a new JWT for the user with the ID stored in the refresh token
				const jwt = createJWTtoken(decoded.username, decoded.privs);
				// Send the new JWT to the client
				return res.send({ status: true, jwt });
			});
		}
	} catch (err) {
		if (err.message == "jwt expired")
			return res.send({
				status: false,
				message: "Refresh token has expired, Log in again...",
			});
		return res.send({
			status: false,
			mesage: "Invalid refresh token, Log in again...",
		});
	}
};

// Middleware function to verify JWT
function verifyJWT(req, res, next) {
	// Get the user's username from the decoded token
	const username = req.headers["username"];
	const token = req.headers["trybae-access-token"];
	const { isadmin = false } = req.headers;

	if (!token) {
		return res.status(401).send({ auth: false, message: "No token provided." });
	}
	// Verify the JWT and check that it is valid
	jwt.verify(token, isadmin == true || isadmin == "true" ? ADMIN_JWT_SECRET : JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(404).send({ auth: false, message: err.message });
		}
		if (decoded.exp < Date.now() / 1000) {
			return res.status(401).send("JWT has expired");
		}
		// If the JWT is valid, save the decoded user information in the request object
		// so that it is available for the next middleware function
		if (decoded.username != username) {
			return res.status(404).send({ auth: false, message: "Token mismatch" }); // Token is not this users, but another users
		}

		req.decoded = decoded;
		next();
	});
}


function confirmJWT(req, res) {
	// Get the user's username from the decoded token
	const username = req.body["username"];
	const token = req.body["trybae-access-token"];
	if (!token) {
		return res.status(401).send({ auth: false, message: "No token provided." });
	}
	// Verify the JWT and check that it is valid
	jwt.verify(token, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(404).send({ auth: false, message: err.message });
		}
		if (decoded.exp < Date.now() / 1000) {
			return res.status(401).send("JWT has expired");
		}
		// If the JWT is valid, save the decoded user information in the request object
		// so that it is available for the next middleware function
		if (decoded.username != username) {
			return res.status(404).send({ auth: false, message: "Token mismatch" }); // Token is not this users, but another users
		}

		return res.send({ auth: true, message: "jwt valid and working" });
	});
}

module.exports = {
	createJWTtoken,
	verifyJWT,
	verifyRefreshToken,
	generateRefreshToken,
	confirmJWT,
};
