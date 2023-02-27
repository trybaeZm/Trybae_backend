const Flutterwave = require("flutterwave-node-v3");

const PUB_KEY =
	process.env.MODE == "TEST"
		? process.env.FLW_PUBLIC_KEY_TEST
		: process.env.FLW_PUBLIC_KEY;

const SECRET_KEY =
	process.env.MODE == "TEST"
		? process.env.FLW_SECRET_KEY_TEST
		: process.env.FLW_SECRET_KEY;

const ENC_KEY =
	process.env.MODE == "TEST"
		? process.env.FLW_ENC_KEY_TEST
		: process.env.FLW_ENC_KEY;

const Card_direct_charge = async (payload) => {
	payload["enckey"] = ENC_KEY;

	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);

	try {
		const response = await flw.Charge.card(payload);
		return response;
	} catch (err) {
		return err.message;
	}
};

const Mobile_money_direct_charge = async (payload, country = "zm") => {
	payload["enckey"] = ENC_KEY;

	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);

	let response;

	if (country == "zm") {
		try {
			response = await flw.MobileMoney.zambia(payload);
			return response;
		} catch (err) {
			return err.message;
		}
	}
};

const fetch_transactions = async (from, to) => {
	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);
	try {
		const payload = {
			//format YYYY-MM-DD
			from: from,
			to: to,
		};

		const response = await flw.Transaction.fetch(payload);
		return response;
	} catch (error) {
		return error.message;
	}
};

const verify_transaction = async (id) => {
	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);
	try {
		const payload = { id: id }; //This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
		const response = await flw.Transaction.verify(payload);

		return response;
	} catch (error) {
		throw new Error(error);
	}
};

const View_Transaction_Timeline = async (id) => {
	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);
	try {
		const payload = {
			id: id,
		}; //This is the unique transaction ID. It is returned in the verify transaction call as data.id
		const response = await flw.Transaction.event(payload);
		return response;
	} catch (error) {
		return error.message;
	}
};

const get_fee = async (amount, currency) => {
	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);

	try {
		const payload = {
			amount: amount,
			currency: currency,
		};
		const response = await flw.Transaction.fee(payload);
		return response;
	} catch (error) {
		return error.message;
	}
};

const refund = async (id, amount) => {
	const flw = new Flutterwave(PUB_KEY, SECRET_KEY);

	try {
		const payload = {
			id: id, //This is the transaction unique identifier. It is returned in the initiate transaction call as data.id
			amount: amount,
		};
		const response = await flw.Transaction.refund(payload);
		return response;
	} catch (error) {
		return error.message;
	}
};

module.exports = {
	Mobile_money_direct_charge,
	Card_direct_charge,
	fetch_transactions,
	verify_transaction,
	View_Transaction_Timeline,
	get_fee,
	refund,
};
