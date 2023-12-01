const Model = require("../models/TryBae_db");
const bcrypt = require("bcrypt");
const { createMulter } = require("../middleware/multer-upload");
const middleware = require("../middleware/authtoken");
const BAN_CONTROLLER = require("./Banned_hosts");
const mongodb = require("../models/mongo_db");
const nodemailer = require("nodemailer");

require("dotenv").config();

const transport = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

const SALT_ROUNDS = 10;

// Select all hosts
function getAllHosts(req, res) {
	Model.connection.query("SELECT * FROM hosts", function (error, results) {
		if (error) {
			res.send({ status: "FAILURE", message: "Unknown error" });
		} else {
			res.send({ status: "SUCCESS", results: results });
		}
	});
}

const getHostByEmail = (email, cb) => {
	const query = `SELECT * FROM hosts WHERE host_email = ?`;
	Model.connection.query(query, [email], (error, results) => {
		if (error) {
			return cb(error);
		} else {
			
			cb(null, results[0]);
		}
	});
};

const getHostByUsername = (username, cb) => {
	const query = `SELECT * FROM hosts WHERE host_username = ?`;
	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return cb(error);
		} else {
			
			cb(null, results[0]);
		}
	});
};

const saveOTP = async (user, otp) => {
	// hash the otp
	const saltRounds = 10;

	const hashedOTP = await bcrypt.hash(otp, saltRounds);

	await mongodb.HostEmailOTPVerification.deleteMany({
		userId: user.host_username,
	}); // clear previous otps
	const newOTPVerification = mongodb.HostEmailOTPVerification({
		userId: user.host_username,
		otp: hashedOTP,
		createdAt: Date.now(),
		expiresAt: Date.now() + 200000, // 3 min
	});

	// save otp record
	try {
		await newOTPVerification.save();
		console.log("otp saved");
	} catch {
		console.log("error sending");
	}
};

const sendOTPVerificationEmail = async (user) => {
	try {
		//generate otp
		const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

		await saveOTP(user, otp);

		const message = {
			from: process.env.EMAIL,
			to: user.host_email, // CHANGE LATER to user.email
			subject: "Trybae OTP",
			html: `<h3>Hello ${user.host_username}</h3> <br/> <p>YOUR OTP FOR TRYBAE IS:</p> <br/> <h2><em> ${otp} </em></h2> <br>
		<h3> if you did NOT request this otp, please contact support immediately </h3>`,
		};

		transport.sendMail(message, (error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log(`Message sent: ${info.messageId}`);
			}
		});
	} catch (err) {
		throw new Error(err);
	}
};

const createHost = (
	host_name,
	host_username,
	host_email,
	host_description,
	host_password,
	host_phone,
	number_of_events_hosted,
	cb,
) => {
	bcrypt.hash(host_password, SALT_ROUNDS, (err, hashedPassword) => {
		if (err) {
			return cb(err);
		}
		const query = `INSERT INTO hosts (host_name, host_username, host_email, host_description, host_password, host_phone, number_of_events_hosted)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`;
		Model.connection.query(
			query,
			[
				host_name,
				host_username,
				host_email,
				host_description == undefined ? null : host_description,
				hashedPassword,
				host_phone,
				number_of_events_hosted,
			],
			(error, results) => {
				if (error) {
					console.log(new Date());
					console.log(error);
					return cb(error);
				} else {
					
					cb(null, results);
				}
			},
		);
	});
};

const signup = (req, res) => {
	
	if ((req.body.HOST_SIGNUP_KEY == undefined) ||
		(req.body.HOST_SIGNUP_KEY != process.env.HOST_SIGNUP_KEY)) {
		return res.send({
			status: 'FAILURE',
			message: "Not authorized to signup as host. This incident will be reported along with your IP address!!"
		})
	}

	const {
		host_name,
		host_username,
		host_email,
		host_description,
		host_password,
		host_phone,
		number_of_events_hosted,
	} = req.body;


	getHostByEmail(host_email, (err, user) => {
		if (err) {
			return res.send({ message: "Error getting host" });
		}
		if (!user) {
			getHostByUsername(host_username, (err, user) => {
				if (err) {
					return res.send({ message: "Error getting host" });
				}
				if (!user) {
					createHost(
						host_name,
						host_username,
						host_email,
						host_description,
						host_password,
						host_phone,
						number_of_events_hosted,
						(err, result) => {
							if (err) {
								return res.send({ message: "Error creating host" });
							}
							sendOTPVerificationEmail(req.body);
							return res.send({ message: "Account created successfully" });
						},
					);
				} else {
					return res.send({ message: "Username already exists" });
				}
			});
		} else {
			return res.send({ message: "Email already exists" });
		}
	});
};

const gethostData = (req, res) => {
	const username = req.decoded["username"];

	// ALL fields except password...
	const query = `SELECT host_username, host_name, host_description FROM hosts WHERE host_username = ?`;

	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			return res.send({ error: error });
		}
		if (results) {
			return res.send({ user: results[0] });
		} else {
			return res.send({ error: "no host found" });
		}
	});
};

const login = (req, res) => {
	const { login, password, type } = req.body;

	if (type == "username") {
		getHostByUsername(login, (err, user) => {
			if (err) {
				return res.send({ message: "Error getting user" });
			}
			if (!user) {
				return res.send({ message: "User not found" });
			}
			if (user) {
				BAN_CONTROLLER.getBannedHostByUsername(
					user.host_username,
					function (results) {
						if (results.length <= 0) {
							bcrypt.compare(password, user.host_password, (error, result) => {
								if (result) {
									const refreshToken = middleware.generateRefreshToken(
										user.host_username,
										"host",
									);

									if (refreshToken == false) {
										return res.send({
											message: "Error creating refresh token!",
										});
									}
									return res.send({
										token: middleware.createJWTtoken(
											user.host_username,
											"host",
										),
										refreshToken: refreshToken,
										user: user.host_username
									});
								} else {
									return res.send({ message: "Incorrect password" });
								}
							});
						} else {
							return res.send({
								message: "This host is banned...",
								ispermanent: results[0].permanent == 0 ? false : true,
								ban_period_in_days: results[0].ban_period_in_days,
							});
						}
					},
				);
			}
		});
	} else {
		getHostByEmail(login, (err, user) => {
			if (err) {
				return res.send({ message: "Error getting user" });
			}
			if (!user) {
				return res.send({ message: "User not found" });
			}

			if (user) {
				BAN_CONTROLLER.getBannedHostByUsername(
					user.host_username,
					function (results) {
						if (results.length <= 0) {
							bcrypt.compare(password, user.host_password, (error, result) => {
								if (result) {
									const refreshToken = middleware.generateRefreshToken(
										user.host_username,
										"host",
									);

									if (refreshToken == false) {
										return res.send({
											message: "Error creating refresh token!",
										});
									}
									return res.send({
										token: middleware.createJWTtoken(
											user.host_username,
											"host",
										),
										refreshToken: refreshToken,
									});
								}
								if (error) {
									return res.send({ message: "Incorrect password" });
								}
							});
						} else {
							return res.send({
								message: "This host is banned...",
								ispermanent: results[0].permanent == 0 ? false : true,
								ban_period_in_days: results[0].ban_period_in_days,
							});
						}
					},
				);
			}
		});
	}
};

const refresh = async (req, res) => {
	const refreshToken = req.body.refreshToken;
	const username = req.body.username;

	if (!refreshToken || refreshToken == undefined) {
		return res.send({ message: "No Token Provided!" });
	}
	await middleware.verifyRefreshToken(refreshToken,username, res);
};

const upload_profile_pic = (req, res) => {
	const upload = createMulter(
		"public-read",
		"Profile Pics/hosts",
		"profile_pic_image",
		"jpg",
	);
	try {
		upload.single("image")(req, res, (err) => {
			if (err) {
				return res.send({ status: "FAILURE", message: `Disallowed file type` });
			}
			if (req.file && req.decoded["username"]) {
				updateHostQuery(
					"profile_pic_url",
					req.file.location,
					req.decoded["username"],
				);
				return res.send({ status: "SUCCESS", imageURL: req.file.location });
			} else {
				return res.send({
					status: "FAILURE",
					message: "No image or username provided in the request",
				});
			}
		});
	} catch (err) {
		// Handle the error and return a response
		return res.send({ status: "FAILURE", message: `Unknown error` });
	}
};

function updateHostQuery(field, value, username) {
	Model.connection.query(
		"UPDATE hosts SET ?? = ? WHERE host_username = ?",
		[field, value, username],
		function (err, results) {
			if (err) throw err;
		},
	);
}

const resend_OTP = async (req, res) => {
	try {
		let { cred, type } = req.body;
		if (!cred || !type) {
			return res.send({
				status: "FAILURE",
				message: "Empty details are not allowed",
			});
		} else {
			if (type == "username") {
				getHostByUsername(cred, async (err, result) => {
					if (result && !err) {
						if (result.host_username !== cred) {
							return res.send({
								status: "FAILURE",
								message: "email and username mismatch",
							});
						} else {
							await sendOTPVerificationEmail({
								username: cred,
								email: result.email,
							});
							return res.send({ status: "SUCCESS", message: "OTP sent!" });
						}
					} else {
						return res.send({
							status: "FAILURE",
							message: "No account found with this username",
						});
					}
				});
			} else {
				getHostByEmail(cred, async (err, result) => {
					if (result && !err) {
						if (result.email !== cred) {
							return res.send({
								status: "FAILURE",
								message: "email and username mismatch",
							});
						} else {
							await sendOTPVerificationEmail({
								username: result.host_username,
								email: cred,
							});
							return res.send({ status: "SUCCESS", message: "OTP sent!" });
						}
					} else {
						return res.send({
							status: "FAILURE",
							message: "No account found with this email",
						});
					}
				});
			}
		}
	} catch (error) {
		return res.send({
			status: "FAILED",
			message: "Unknown error",
		});
	}
};

async function update_verification_status(username, cb) {
	let query = `UPDATE hosts SET email_verified = TRUE WHERE host_username = ?`;

	Model.connection.query(query, [username], (error, results) => {
		if (error) {
			console.log(new Date());
			return cb(error);
		} else {
			
			cb(null, results);
		}
	});
}

async function deleteAccount(req, res) {
	const username = req.decoded["username"];

	try {
		if (!username) {
			return res.send({
				status: "FAILURE",
				message: "no host username provided",
			});
		} else {
			getHostByUsername(username, (err, user) => {
				if (err) {
					return res.send({ status: "FAILURE", message: "Error getting host" });
				}
				if (user) {
					Model.connection.query(
						"DELETE FROM hosts WHERE host_username = ?",
						[username],
						async (err, results) => {
							if (err) {
								console.log(err);
								return res.send({
									status: "FAILURE",
									message: "Error deleting host",
								});
							}
							if (results) {
								await mongodb.HostRefreshToken.deleteMany({ userId: username });
								return res.send({
									status: "SUCCESS",
									message: "Deleted account successfully.",
								});
							}
						},
					);
				}
			});
		}
	} catch (err) {
		return res.send({
			status: "FAILURE",
			message: "Unknown error",
		});
	}
}

const reset_Password = async (req, res) => {
	try {
		let { userId, otp, newpassword } = req.body;
		if (!userId || !otp || !newpassword) {
			return res.send({ status: "FAILED", message: "Empty details!" });
		} else {
			const HostEmailOTPVerificationRecord =
				await mongodb.HostEmailOTPVerification.find({
					userId,
				});
			if (HostEmailOTPVerificationRecord.length <= 0) {
				// no record found
				return res.send({ status: "FAILED", message: "Account doesnt exist" });
			} else {
				// user otp record exists
				const { expiresAt } = HostEmailOTPVerificationRecord[0];
				const hashedOTP = HostEmailOTPVerificationRecord[0].otp;

				if (expiresAt < Date.now()) {
					// user otp record has expired
					mongodb.HostEmailOTPVerification.deleteMany({ userId });
					return res.send({ status: "FAILED", message: "OTP Code Expired!" });
				} else {
					bcrypt.compare(otp, hashedOTP, (error, result) => {
						if (result && !error) {
							mongodb.HostEmailOTPVerification.deleteMany({ userId });

							bcrypt.hash(newpassword, SALT_ROUNDS, (err, hashedPassword) => {
								if (hashedPassword && !err) {
									try {
										updateHostQuery("password", hashedPassword, userId);
										res.json({
											status: "SUCCESS",
											message: "Host account password updated successfully.",
										});
									} catch (err) {
										return res.send({
											status: "FAILED",
											message: "Unknown error, try later",
										});
									}
								}
							});
						} else {
							// supplied otp is wrong
							return res.send({ status: "FAILED", message: "Invalid Code" });
						}
					});
				}
			}
		}
	} catch (error) {
		res.json({
			status: "FAILED",
			message: "Unknown error, try later.",
		});
	}
};

async function verifyOTP(req, res) {
	try {
		let { userId, otp } = req.body;
		if (!userId || !otp) {
			return res.send({ status: "FAILED", message: "Empty details!" });
		} else {
			const HostEmailOTPVerificationRecord =
				await mongodb.HostEmailOTPVerification.find({
					userId,
				});
			if (HostEmailOTPVerificationRecord.length <= 0) {
				// no record found
				return res.send({ status: "FAILED", message: "Account doesnt exist" });
			} else {
				// user otp record exists
				const { expiresAt } = HostEmailOTPVerificationRecord[0];
				const hashedOTP = HostEmailOTPVerificationRecord[0].otp;

				if (expiresAt < Date.now()) {
					// user otp record has expired
					mongodb.HostEmailOTPVerification.deleteMany({ userId });
					return res.send({ status: "FAILED", message: "OTP Code Expired!" });
				} else {
					bcrypt.compare(otp, hashedOTP, (error, result) => {
						if (result && !error) {
							mongodb.HostEmailOTPVerification.deleteMany({ userId });
							update_verification_status(userId, (err, result) => {
								if (err) {
									return res.send({ message: "Error Verifying user" });
								} else {
									res.json({
										status: "SUCCESS",
										message: "User email verified successfully.",
									});
								}
							});
						} else {
							// supplied otp is wrong
							return res.send({ status: "FAILED", message: "Invalid Code" });
						}
					});
				}
			}
		}
	} catch (error) {
		res.json({
			status: "FAILED",
			message: "Unkown error",
		});
	}
}

// Update host by username
function updateHost(req, res) {
	const username = req.body.username;
	const host = req.body;
	Model.connection.query(
		"UPDATE hosts SET ? WHERE host_username = ?",
		[host, username],
		function (error, results) {
			if (error) {
				res.send({ status: "FAILURE", message: "Unknown error" });
			} else {
				res.send({ status: "SUCCESS", results: results });
			}
		},
	);
}

async function uploadSociallinks(req, res) {
	const { link, appname } = req.body;

	const username = req.decoded["username"];

	if (!username || !link || !appname) {
		return res.send({
			status: "FAILURE",
			message: "Missing details",
		});
	} else {
		const found = await mongodb.Host_Social_Links.find({
			host_id: username,
			app_name: appname,
			social_link: link,
		});

		if (!found) {
			const social_link = new mongodb.Host_Social_Links({
				host_id: username,
				app_name: appname,
				social_link: link,
			});

			await social_link.save();

			return res.send({
				status: "SUCCESS",
				message: `Saved your ${appname} link successfully`,
			});
		} else {
			return res.send({
				status: "FAILURE",
				message: "Already exists",
			});
		}
	}
}

module.exports = {
	getAllHosts: getAllHosts,
	getHostByUsername: getHostByUsername,
	signup: signup,
	login: login,
	refresh: refresh,
	verifyOTP: verifyOTP,
	resend_OTP: resend_OTP,
	upload_profile_pic: upload_profile_pic,
	updateHost: updateHost,
	deleteAccount,
	deleteAccount,
	reset_Password: reset_Password,
	gethostData: gethostData,
	uploadSociallinks: uploadSociallinks,
};
