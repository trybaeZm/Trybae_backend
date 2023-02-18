const mongodb = require("../models/mongo_db");
const ticketController = require("./tickets");
const Flutterwave = require("../middleware/flutterwave");
const { Expo } = require("expo-server-sdk");

let expo = new Expo({ accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN });

async function verify_transaction(req, res) {
	if (!req.query.status || !req.query.transaction_id || !req.query.tx_ref) {
		return res.send({ status: "FAILURE", message: "Query parameters missing, contact support immediately." });
	}

	try {
		if (req.query.status === "successful") {
			const response = await Flutterwave.verify_transaction(
				req.query.transaction_id,
			);
			if (!response || !response.status) {
				return res.send({
					status: "FAILURE",
					message: "Api Busy, try later.",
				});
			} else {
				if (response.status === "success" && response.data.currency === "ZMW") {
					const check = await mongodb.Transactions.findOne({
						txn_id: req.query.transaction_id,
					});

					if (!check) {
						const newTransaction = new mongodb.Transactions({
							transaction_ref: response.data.tx_ref,
							txn_id: response.data.id,
							transation_status: "verified",
							method_used: response.data.payment_type,
							transaction_amount: response.data.amount,
							transaction_fee: response.data.app_fee,
							transactionDate_and_time: response.data.created_at,
						});

						await newTransaction.save();

						const Ticket = await mongodb.Tickets.findOne({
							tx_ref: response.data.tx_ref,
						});

						if (Ticket) {
							if (Ticket.is_cinema_ticket == true) {
								const seatsChosen = Ticket.seatsChosen;

								let completed = 0;
								for (let i = 0; i < Ticket.seatsChosen.length; i++) {
									
									let modifiedTicket = Ticket.toObject();

									modifiedTicket.seat_number = seatsChosen[i];
									console.log(modifiedTicket)
									try {
										ticketController.create_ticket_query(
											modifiedTicket,
											(err, results) => {
												if (err || !results) {
													return res.send({
														status: "FAILURE",
														message:
															"Unknown error, contact support, or try later." +
															err,
														code: "102",
													});
													
												}
												completed++;
												if (completed == Ticket.seatsChosen.length) {
													return res.send({
														status: "SUCCESS",
														message:
															"Transaction verified, and all tickets created...",
														code: "200",
													});
												}
											},
										);
									} catch (err) {
										return res.send({
											status: "FAILURE",
											message:
												"Unknown error, contact support, or try later." +
												err,
											code: "102",
										});
									}
								}
							} else {
								let completed = 0;
								for (let i = 0; i < Ticket.qty; i++) {
									ticketController.create_ticket_query(
										Ticket,
										(err, results) => {
											if (err || !results) {
												return res.send({
													status: "FAILURE",
													message:
														"Unknown error, contact support, or try later." +
														err,
													code: "102",
												});
											}
											completed++;
											if (completed == Ticket.qty) {
												return res.send({
													status: "SUCCESS",
													message:
														"Transaction verified, and all tickets created...",
													code: "200",
												});
											}
										},
									);
								}
							}
						} else {
							return res.send({
								status: "FAILURE",
								message: "Could not find pending ticket",
								code: "100",
							});
						}
					} else {
						return res.send({
							status: "FAILURE",
							message: "Transaction already Verified!",
						});
					}
				} else {
					return res.send({
						status: "FAILURE",
						message:
							"Unable to verify transaction, please contact support immediately or try again later",
					});
				}
			}
		} else {
			return res.send({
				status: "FAILURE",
				message:
					"Payment was unsuccessful, please contact support or try later",
			});
		}
	} catch (err) {
		console.log(err);
		return res.send({
			status: "FAILURE",
			message: err,
			code: "101",
		});
	}
}

module.exports = {
	verify_transaction,
};
