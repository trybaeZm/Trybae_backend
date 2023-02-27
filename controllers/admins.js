const bcrypt = require("bcrypt");
const { createMulter } = require("../middleware/multer-upload");
const middleware = require("../middleware/authtoken");
const mongodb = require("../models/mongo_db");
const nodemailer = require("nodemailer");

require("dotenv").config();

const SALT_ROUNDS = 10;

const transport = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

const signup = async (req, res) => {
	const {
		admin_username,
		admin_email,
		admin_password,
		admin_phone,
		admin_position = "employee",
		admin_signup_key = "",
		profile_pic_url = "",
	} = req.body;

	if (admin_signup_key === process.env.ADMIN_SIGNUP_KEY) {
		if (
			!admin_username ||
			!admin_email ||
			!admin_password ||
			!admin_phone ||
			!admin_position
		) {
			return res.send({
				status: "FAILURE",
				message: "missing details",
			});
		} else {
			const check = await mongodb.trybae_admins.findOne({
				admin_username: admin_username,
			});
			const check2 = await mongodb.trybae_admins.findOne({
				admin_email: admin_email,
			});

			if (check) {
				return res.send({
					status: "FAILURE",
					message: "username already exists",
				});
			}
			if (check2) {
				return res.send({
					status: "FAILURE",
					message: "email already exists",
				});
			}

			if (!check && !check2) {
				bcrypt.hash(
					admin_password,
					SALT_ROUNDS,
					async (err, hashedPassword) => {
						if (hashedPassword && !err) {
							const newAdmin = new mongodb.trybae_admins({
								admin_email: admin_email,
								admin_username: admin_username,
								admin_password: hashedPassword,
								admin_phone: admin_phone,
								admin_position: admin_position,
								profile_pic_url: profile_pic_url,
							});

							await newAdmin.save();

							return res.send({
								status: "SUCCESS",
								message: "Admin signup successful",
							});
						} else {
							return res.send({
								status: "FAILURE",
								message: "error occured when registering",
							});
						}
					},
				);
			}
		}
	} else {
		return res.send({
			status: "FAILURE",
			message: "Admin key invalid or missing",
		});
	}
};

const login = async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.send({ status: "FAILURE", message: "Empty details" });
	} else {
		const check = await mongodb.trybae_admins.findOne({
			admin_username: username,
		});

		if (!check) {
			return res.send({
				status: "FAILURE",
				message: "Incorrect credentials",
			});
		} else {
			bcrypt.compare(password, check.admin_password, async (error, result) => {
				if (result && !error) {
					console.log(result);

					await sendOTPVerificationEmail(check);
					return res.send({
						status: "Pending",
						message: "Verify otp to get auth tokens",
					});
				} else {
					return res.send({
						status: "FAILURE",
						message: "Incorrect credentials",
					});
				}
			});
		}
	}
};

const sendOTPVerificationEmail = async (user) => {
	try {
		//generate otp
		const otp = `${Math.floor(10000 + Math.random() * 90000)}`;

		await saveOTP(user, otp);

		const message = {
			from: process.env.EMAIL,
			to: user.admin_email, // CHANGE LATER to user.email
			subject: "Trybae OTP",
			html: `<h3>Hello <h2>${user.admin_username}</h2></h3> <br/> 
            <p>your otp for TryBae is:</p> <br/> <h2><em> ${otp} </em></h2>`,
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

const saveOTP = async (user, otp) => {
	// hash the otp
	const saltRounds = 10;

	const hashedOTP = await bcrypt.hash(otp, saltRounds);
	await mongodb.AdminEmailOTPVerification.deleteMany({
		userId: user.admin_username,
	}); // clear previous otps
	const newOTPVerification = mongodb.AdminEmailOTPVerification({
		userId: user.admin_username,
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

async function verifyOTP(req, res) {
	try {
		let { userId, otp } = req.body;
		if (!userId || !otp) {
			return res.send({
				status: "FAILED",
				message: "Empty details, please relogin!",
			});
		} else {
			const AdminEmailOTPVerificationRecord =
				await mongodb.AdminEmailOTPVerification.find({
					userId,
				});
			if (AdminEmailOTPVerificationRecord?.length <= 0) {
				// no record found
				return res.send({ status: "FAILED", message: "Invalid Code_01" });
			} else {
				// user otp record exists
				const { expiresAt } = AdminEmailOTPVerificationRecord[0];
				const hashedOTP = AdminEmailOTPVerificationRecord[0].otp;

				if (expiresAt < Date.now()) {
					// user otp record has expired
					mongodb.AdminEmailOTPVerification.deleteMany({ userId });
					return res.send({ status: "FAILED", message: "OTP Code Expired!" });
				} else {
					bcrypt.compare(otp, hashedOTP, (error, result) => {
						if (result && !error) {
							mongodb.AdminEmailOTPVerification.deleteMany({
								userId,
							});
							const refreshToken = middleware.generateRefreshToken(
								userId,
								"admin",
							);

							if (refreshToken == false) {
								return res.send({
									message: "Error creating refresh token!",
								});
							}

							return res.send({
								token: middleware.createJWTtoken(userId, "admin"),
								refreshToken: refreshToken,
							});
						} else {
							// supplied otp is wrong
							return res.send({ status: "FAILED", message: "Invalid Code_02" });
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

const resend_OTP = async (req, res) => {
	try {
		let { username } = req.body;

		const record = await mongodb.trybae_admins.findOne({
			admin_username: username,
		});

		if (!record) {
			return res.send({
				status: "FAILURE",
				message: "Failure sending otp",
			});
		} else {
			await sendOTPVerificationEmail({
				admin_username: record.admin_username,
				admin_email: record.admin_email,
			});
			return res.send({ status: "SUCCESS", message: "OTP sent!" });
		}
	} catch (error) {
		return res.send({
			status: "FAILED",
			message: "Unknown error",
		});
	}
};

module.exports = {
	login,
	signup,
	verifyOTP,
	resend_OTP,
};
