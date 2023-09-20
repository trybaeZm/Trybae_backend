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

module.exports = {
  requestPayment,
};
