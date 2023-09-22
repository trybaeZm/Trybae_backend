// all controller functions related to payment are defined here

const PaymentService = require("./services/payment.service");

const requestPayment = async (req, res) => {
  const { amount, customerId, description, eventId } = req.body;
  try {
    const responseData = await PaymentService.requestPayment(
      amount,
      customerId,
      description,
      eventId
    );

    res.status(200).json({ response: responseData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while making the request." });
  }
};

const checkPayment = async (req, res) => {
  const { ticket_id } = req.params;

  const { username } = req.decoded;

  const { status } = await PaymentService.checkPayment(ticket_id, username);

  res.status(200).json({ status });
};

const fromPaymentRedirect = async (req, res) => {
  const {
    TransID,
    CCDapproval,
    PnrID,
    TransactionToken: transactionToken,
    CompanyRef,
  } = req.query;

  const { status } = await PaymentService.verifyPaymentForUser(
    transactionToken
  );

  // update the transaction status

  res.status(200).json({ status });
};

module.exports = {
  requestPayment,
  checkPayment,
  fromPaymentRedirect,
};
