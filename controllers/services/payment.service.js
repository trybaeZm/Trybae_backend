const Model = require("../../models/mongo_db");
const axios = require("axios");
const xml2js = require("xml2js");
const dotenv = require("dotenv");
const { differenceInHours } = require("date-fns");

dotenv.config();

class PaymentService {
  constructor() {
    this.companyToken = process.env.DPO_COMPANY_TOKEN;
    this.companyRef = process.env.DPO_COMPANY_REF;
    this.backURL = process.env.DPO_BACKURL;
    this.redirectURL = process.env.DPO_REDIRECT_URL;
    this.serviceType = process.env.DPO_SERVICE_TYPE;
    this.currency = process.env.DPO_CURRENCY;
    this.paymentUrl = process.env.DPO_PAYMENT_URL;
  }

  async requestPayment(amount, username, description, eventId) {
    try {
      const xmlData = `<API3G>
      <CompanyToken>${this.companyToken}</CompanyToken>
      <Request>createToken</Request>
      <Transaction>
        <PaymentAmount>${amount}</PaymentAmount>
        <PaymentCurrency>${this.currency}</PaymentCurrency>
        <CompanyRef>${this.companyRef}</CompanyRef>
        <RedirectURL>${this.DPO_REDIRECT_URL}</RedirectURL>
        <BackURL>${this.DPO_BACKURL}</BackURL>
        <CompanyRefUnique>0</CompanyRefUnique>
        <PTL>5</PTL>
      </Transaction>
      <Services>
        <Service>
          <ServiceType>${this.serviceType}</ServiceType>
          <ServiceDescription>${description}</ServiceDescription>
          <ServiceDate>2013/12/20 19:00</ServiceDate>
        </Service>
      </Services>
    </API3G>`;

      // Set the headers for the POST request
      const headers = {
        "Content-Type": "application/xml",
      };

      // Make the POST request using axios
      const response = await axios.post(
        "https://secure.3gdirectpay.com/API/v6/",
        xmlData,
        { headers }
      );

      // Handle the response
      const responseData = response.data;

      // You can parse the XML response if needed (using xml2js, for example)
      const parsedData = await xml2js.parseStringPromise(responseData);

      // Save the transaction details to the database

      const transaction = new Model.payments({
        eventId,
        username,
        transactionToken: parsedData.API3G.TransToken[0],
        transactionAmount: amount,
        transactionDateAndTime: Date.now(),
        transactionFee: 0,
        transactionStatus: "pending",
      });

      await transaction.save();

      // Extract the specific values
      const result = {
        Result: parsedData.API3G.Result[0],
        ResultExplanation: parsedData.API3G.ResultExplanation[0],
        TransToken: parsedData.API3G.TransToken[0],
        TransRef: parsedData.API3G.TransRef[0],
        paymentLink: this.paymentUrl + "?ID=" + parsedData.API3G.TransToken[0],
      };

      return result;
    } catch (error) {
      console.log(error, "check for error here");
      throw error;
    }
  }

  async checkPayment(ticket_id, username) {
    console.log(ticket_id, username);
    const doesUserHaveTransaction = await Model.payments
      .findOne({
        eventId: ticket_id,
        username,
      })
      .exec();

    console.log({ doesUserHaveTransaction });

    if (doesUserHaveTransaction?.transactionStatus === "completed") {
      return {
        status: "COMPLETED",
        data: "Payment successful",
        ticket_id,
      };
    }

    if (doesUserHaveTransaction?.transactionStatus === "pending") {
      const hours = differenceInHours(
        Date.now(),
        doesUserHaveTransaction.transactionDateAndTime
      );
      console.log({ hours });
      if (hours > 1) {
        // delete the transaction
        await Model.payments
          .findOneAndDelete({
            eventId: ticket_id,
            username,
          })
          .exec();
        return {
          status: "EXPIRED",
          data: "Payment expired",
          ticket_id,
        };
      }
      return {
        status: "pending",
        data: "Payment pending",
        ticket_id,
        paymentLink:
          this.paymentUrl + "?ID=" + doesUserHaveTransaction.transactionToken,
      };
    }
    // else treat like a payment does not exist
    return {
      status: "DOES_NOT_EXIST",
      data: "Payment failed",
      ticket_id,
    };
  }

  async verifyPayment(transactionToken) {
    try {
      const xmlData = `<?xml version="1.0" encoding="utf-8"?>
      <API3G>
          <CompanyToken>${this.companyToken}</CompanyToken>
          <Request>verifyToken</Request>
          <TransactionToken>${transactionToken}</TransactionToken>
      </API3G>`;

      // Set the headers for the POST request
      const headers = {
        "Content-Type": "application/xml",
      };

      // Make the POST request using axios
      const response = await axios.post(
        "https://secure.3gdirectpay.com/API/v6/",
        xmlData,
        { headers }
      );

      // Handle the response

      const responseData = response.data;

      console.log(responseData);
      // You can parse the XML response if needed (using xml2js, for example)
      const parsedData = await xml2js.parseStringPromise(responseData);

      // console.log({ responseData });
      // Extract the specific values
      const result = {
        Result: parsedData.API3G.Result,
        ResultExplanation: parsedData.API3G.ResultExplanation,
      };

      return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyPaymentForUser(transactionToken) {
    try {
      const transaction = await Model.payments
        .findOne({
          transactionToken,
        })
        .exec();

      console.log({ transaction });
      if (!transaction) {
        return {
          status: "failed",
          data: "Payment failed",
        };
      }

      const verifyPaymentResponse = await this.verifyPayment(transactionToken);

      if (verifyPaymentResponse.Result == "000") {
        // update the transaction status
        transaction.transactionStatus = "completed";

        await transaction.save();

        return {
          status: "completed",
          data: "Payment successful",
        };
      } else {
        // delete the transaction
        await Model.payments
          .findOneAndDelete({
            transactionToken,
          })
          .exec();
        return {
          status: "failed",
          data: "Payment failed",
        };
      }

      // return result;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async purchaseTicket() {
    try {
      const Ticket = await mongodb.Tickets.findOne({
        tx_ref: response.data.tx_ref,
      });

      if (Ticket) {
        const newTicketPurchase = new mongodb.newTicketPurchase({
          userId: Ticket?.ticket_owner,
          event_id: Ticket?.event_id,
        });
        await newTicketPurchase.save();
        if (Ticket.is_cinema_ticket == true) {
          const seatsChosen = Ticket.seatsChosen;

          let completed = 0;
          for (let i = 0; i < Ticket.seatsChosen.length; i++) {
            let modifiedTicket = Ticket.toObject();

            modifiedTicket.seat_number = seatsChosen[i];
            console.log(modifiedTicket);
            try {
              ticketController.create_ticket_query(
                modifiedTicket,
                (err, results) => {
                  if (err || !results) {
                    return res.send({
                      status: "FAILURE",
                      message:
                        "Unknown error, contact support, or try later." + err,
                      code: "102",
                    });
                  }
                  completed++;
                  if (completed == Ticket.seatsChosen.length) {
                    try {
                      getUserByUsername(
                        Ticket?.ticket_owner,
                        (err, founduser) => {
                          if (!err && founduser) {
                            try {
                              if (
                                !Expo.isExpoPushToken(founduser.Expo_push_token)
                              ) {
                                console.error(
                                  `Push token ${founduser.Expo_push_token} is not a valid Expo push token. Notification to user wont be sent`
                                );
                              } else {
                                messages = [
                                  {
                                    to: founduser.Expo_push_token,
                                    sound: "default",
                                    badge: 1,
                                    title: `${completed} Movie Ticket/s 🎫 purchased`,
                                    body: `Your purchase was successful ✅`,
                                    data: {
                                      new: true,
                                      event_id: Ticket?.event_id,
                                      is_cinema: true,
                                      bulk: true,
                                    },
                                  },
                                ];

                                (async () => {
                                  let chunks =
                                    expo.chunkPushNotifications(messages);
                                  let tickets = [];

                                  for (let chunk of chunks) {
                                    let ticketChunk =
                                      await expo.sendPushNotificationsAsync(
                                        chunk
                                      );

                                    tickets.push(...ticketChunk);
                                    console.log(tickets);
                                  }
                                })();
                              }
                            } catch (err) {
                              console.log(err);
                            }
                          }
                        }
                      );
                    } catch (err) {
                      console.log(err);
                    }

                    return res.send({
                      status: "SUCCESS",
                      message:
                        "Transaction verified, and all tickets created... ✅",
                      code: "200",
                    });
                  }
                }
              );
            } catch (err) {
              return res.send({
                status: "FAILURE",
                message: "Unknown error, contact support, or try later." + err,
                code: "102",
              });
            }
          }
        } else {
          let completed = 0;
          for (let i = 0; i < Ticket.qty; i++) {
            ticketController.create_ticket_query(Ticket, (err, results) => {
              if (err || !results) {
                return res.send({
                  status: "FAILURE",
                  message:
                    "Unknown error, contact support, or try later." + err,
                  code: "102",
                });
              }
              completed++;
              if (completed == Ticket.qty) {
                try {
                  getUserByUsername(Ticket?.ticket_owner, (err, founduser) => {
                    if (!err && founduser) {
                      try {
                        if (!Expo.isExpoPushToken(founduser.Expo_push_token)) {
                          console.error(
                            `Push token ${founduser.Expo_push_token} is not a valid Expo push token. Notification to user wont be sent`
                          );
                        } else {
                          messages = [
                            {
                              to: founduser.Expo_push_token,
                              sound: "default",
                              badge: 1,
                              title: `${completed} Ticket/s 🎫 purchased`,
                              body: `Your purchase was successful ✅`,
                              data: {
                                new: true,
                                event_id: Ticket?.event_id,
                                is_cinema: false,
                                bulk: true,
                              },
                            },
                          ];

                          (async () => {
                            let chunks = expo.chunkPushNotifications(messages);
                            let tickets = [];

                            for (let chunk of chunks) {
                              let ticketChunk =
                                await expo.sendPushNotificationsAsync(chunk);

                              tickets.push(...ticketChunk);
                              console.log(tickets);
                            }
                          })();
                        }
                      } catch (err) {
                        console.log(err);
                      }
                    }
                  });
                } catch (err) {
                  console.log(err);
                }

                return res.send({
                  status: "SUCCESS",
                  message:
                    "Transaction verified, and all tickets created... ✅",
                  code: "200",
                });
              }
            });
          }
        }
      }
    } catch (error) {}
  }
  // other methods...
}

module.exports = new PaymentService();
