// all controller functions related to payment are defined here
const mongodb = require("../models/mongo_db");
const PaymentService = require("./services/payment.service");

const requestPayment = async (req, res) => {
  try {
    const {
      ticket_owner,
      ticket_description,
      show_under_participants,
      event_id,
      ticket_type,
      qty = 1,
      time = new Date(),
      redeemed = false,
    } = req.body.ticket;

    console.log(req.body, "check for body <<<<");
    const { username } = req.decoded;
    const responseData = await PaymentService.requestPayment(
      ticket_owner,
      ticket_description,
      show_under_participants,
      event_id,
      ticket_type,
      qty,
      time,
      (redeemed = false),
      username
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

  const { status, eventId } = await PaymentService.checkPayment(
    ticket_id,
    username
  );

  res.status(200).json({ status, eventId });
};

const fromPaymentRedirect = async (req, res) => {
  try {
    const {
      TransID,
      CCDapproval,
      PnrID,
      TransactionToken: transactionToken,
      CompanyRef,
    } = req.query;

    const io = req.app.io;
    // verify the payment from transaction token

    const transaction = await PaymentService.DPOVerifyPayment(transactionToken);

    console.log(transaction, "check for transaction");
    if (transaction?.result[0] === "000") {
      // update the transaction status
      await PaymentService.updateTransactionStatus(
        transactionToken,
        "completed"
      );

      const transationsDetails = await PaymentService.getTransactionDetails(
        transactionToken
      );

      const { eventId, username } = transationsDetails;

      const newTicketPurchase = new mongodb.newTicketPurchase({
        userId: username,
        event_id: eventId,
      });
      await newTicketPurchase.save();

      const Ticket = await mongodb.Tickets.findOne({
        tx_ref: transactionToken,
      });

      if (Ticket) {
        const seatsChosen = Ticket.seatsChosen;

        let completed = 0;
        for (let i = 0; i < Ticket.seatsChosen.length; i++) {
          let modifiedTicket = Ticket.toObject();

          modifiedTicket.seat_number = seatsChosen[i];
          console.log(modifiedTicket);
          try {
            await mongodb.Tickets.findOneAndUpdate(
              { _id: Ticket._id },
              modifiedTicket
            );
            completed++;
          } catch (error) {
            console.log(error);
            return res.status(500).json({
              error: "An error occurred while updating the ticket.",
            });
          }
        }

        if (completed === Ticket.seatsChosen.length) {
          console.log("All tickets updated");
        }
      }

      // emit an event to the client to update the payment status
      io.sockets.emit("paymentUpdate", {
        success: "completed",
        eventId,
        username,
      });

      console.log("expected to have run");
      //
      // redirect to a success page served by the pug template
      return res.render("success", {
        transactionToken,
        eventId,
        username,
      });
    }

    // redirect to a failure page served by the pug template
    return res.render("failure", {
      transactionToken,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: `An error occurred. ${error?.message}` });
  }
};

module.exports = {
  requestPayment,
  checkPayment,
  fromPaymentRedirect,
};
