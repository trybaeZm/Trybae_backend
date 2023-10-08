const mongodb = require("../models/mongo_db");
const Model = require("../models/TryBae_db");
const ticketController = require("./tickets");
const Flutterwave = require("../middleware/flutterwave");
const { Expo } = require("expo-server-sdk");
const paymentService = require("./services/payment.service");

let expo = new Expo({ accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN });

const getUserByUsername = (username, cb) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  Model.connection.query(query, [username], (error, results) => {
    if (error) {
      return cb(error);
    }
    cb(null, results[0]);
  });
};

async function verify_transaction(req, res) {
  if (!req.query.status || !req.query.transaction_id || !req.query.tx_ref) {
    return res.send({
      status: "FAILURE",
      message: "Query parameters missing, contact support immediately.",
    });
  }

  try {
    if (req.query.status === "successful") {
      const response = await Flutterwave.verify_transaction(
        req.query.transaction_id
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
                              "Unknown error, contact support, or try later." +
                              err,
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
                                      !Expo.isExpoPushToken(
                                        founduser.Expo_push_token
                                      )
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
                      message:
                        "Unknown error, contact support, or try later." + err,
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
                        try {
                          getUserByUsername(
                            Ticket?.ticket_owner,
                            (err, founduser) => {
                              if (!err && founduser) {
                                try {
                                  if (
                                    !Expo.isExpoPushToken(
                                      founduser.Expo_push_token
                                    )
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
      message:
        "Unable to verify transaction, please contact support immediately or try again later",
      code: "101",
    });
  }
}
async function verify_transaction_dpo(req, res) {
  const {
    TransID,
    CCDapproval,
    PnrID,
    TransactionToken: transactionToken,
    CompanyRef,
  } = req.query;

  if (!transactionToken) {
    return res.send({
      status: "FAILURE",
      message: "Query parameters missing, contact support immediately.",
    });
  }

  try {
    const transaction = await paymentService.DPOVerifyPayment(transactionToken);

    if (!transaction || !transaction?.result[0] === "000") {
      return res.send({
        status: "FAILURE",
        message: "Api Busy, try later.",
      });
    } else {
      const check = await mongodb.Transactions.findOne({
        txn_id: transactionToken,
      });

      console.log({ check }, "check");

      if (!check) {
        // const newTransaction = new mongodb.Transactions({
        //   transaction_ref: response.data.tx_ref,
        //   txn_id: response.data.id,
        //   transation_status: "verified",
        //   method_used: response.data.payment_type,
        //   transaction_amount: response.data.amount,
        //   transaction_fee: response.data.app_fee,
        //   transactionDate_and_time: response.data.created_at,
        // });

        // await newTransaction.save();

        const Ticket = await mongodb.Tickets.findOne({
          tx_ref: transactionToken,
        });

        console.log(Ticket, "ticket");
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
                                  !Expo.isExpoPushToken(
                                    founduser.Expo_push_token
                                  )
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
                  message:
                    "Unknown error, contact support, or try later." + err,
                  code: "102",
                });
              }
            }
          } else {
            let completed = 0;
            for (let i = 0; i < Ticket.qty; i++) {
              ticketController.create_ticket_query(Ticket, (err, results) => {
                if (err || !results) {
                  console.log(err, "err");
                  console.log("this is not creating a ticker", results);
                  return res.render("failure", {
                    transactionToken,
                  });
                  // return res.send({
                  //   status: "FAILURE",
                  //   message:
                  //     "Unknown error, contact support, or try later." + err,
                  //   code: "102",
                  // });
                }
                completed++;
                if (completed == Ticket.qty) {
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

                  return res.render("success", {
                    transactionToken,
                  });
                  // return res.send({
                  //   status: "SUCCESS",
                  //   message:
                  //     "Transaction verified, and all tickets created... ✅",
                  //   code: "200",
                  // });
                }
              });
            }
          }
        } else {
          return res.render("failure", {
            transactionToken,
          });
          // return res.send({
          //   status: "FAILURE",
          //   message: "Could not find pending ticket",
          //   code: "100",
          // });
        }
      } else {
        return res.render("failure", {
          transactionToken,
        });
        // return res.send({
        //   status: "FAILURE",
        //   message: "Transaction already Verified!",
        // });
      }
    }
  } catch (err) {
    console.log(err);
    return res.render("failure", {
      transactionToken,
    });
    // return res.send({
    //   status: "FAILURE",
    //   message:
    //     "Unable to verify transaction, please contact support immediately or try again later",
    //   code: "101",
    // });
  }
}

module.exports = {
  verify_transaction,
  verify_transaction_dpo,
};
