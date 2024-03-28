const Model = require("../models/TryBae_db");
const Flutterwave = require("../middleware/flutterwave");
const mongodb = require("../models/mongo_db");
const mysql = require("mysql2");
const got = require("got");
const { Expo } = require("expo-server-sdk");
const paymentService = require("./services/payment.service");
const randomstring = require("randomstring");
const { getUserObjects, sendNotificationToFollowers } = require("./followers");

let expo = new Expo({ accessToken: process.env.EXPO_PUSH_ACCESS_TOKEN });

const CONVENIENCE_FEE = 5; // IMPORTANT: 5 kwacha service cost / convenience fee...

const create_ticket_query = (record, cb) => {
  const {
    ticket_owner,
    ticket_description,
    show_under_participants,
    event_id,
    ticket_type,
    date_of_purchase,
    time_of_purchase,
    redeemed = 0,
    is_cinema_ticket = false,
    seat_number = null,
    cinema_time = null,
    cinema_date = null,
  } = record;

  if (is_cinema_ticket == false) {
    Model.connection.query(
      `INSERT INTO tickets (ticket_id, ticket_owner, ticket_description, show_under_participants, event_id, 
		ticket_type, Date_of_purchase, time_of_purchase, redeemed)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_owner,
        ticket_description,
        show_under_participants,
        event_id,
        ticket_type,
        date_of_purchase,
        time_of_purchase,
        redeemed,
      ],
      (error, results) => {
        if (error) {
          return cb(error);
        } else {
          // Send the results back to the client
          cb(null, results);
        }
      }
    );
  } else {
    Model.connection.query(
      `INSERT INTO tickets (ticket_id, ticket_owner, ticket_description, show_under_participants, event_id, 
		ticket_type, Date_of_purchase, time_of_purchase, redeemed, seat_number, cinema_time, cinema_date)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ticket_owner,
        ticket_description,
        show_under_participants,
        event_id,
        ticket_type,
        date_of_purchase,
        time_of_purchase,
        redeemed,
        seat_number,
        cinema_time,
        cinema_date,
      ],
      (error, results) => {
        if (error) {
          return cb(error);
        }
        // Send the results back to the client
        cb(null, results);
      }
    );
  }
};

function getCurrentTime() {
  const currentTime = new Date();
  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const seconds = currentTime.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function getCurrentDate() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed, so add 1
  const day = currentDate.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const hosttickets = (req, res) => {
  const { event_id, seat_number, cinema_time, cinema_date } = req.body;
  const ticket_owner = req.decoded["username"];

  for (let index = 0; index < seat_number?.length; index++) {
    const hostticket = {
      ticket_id: randomstring.generate(15),
      ticket_owner: ticket_owner,
      ticket_description:
        "This is a physically taken seat. Its is onlu here to make sure the seats on the app are upto date.",
      show_under_participants: 0,
      event_id: event_id,
      ticket_type: 0,
      Date_of_purchase: getCurrentDate(),
      time_of_purchase: getCurrentTime(),
      redeemed: 0,
      seat_number: seat_number[index],
      cinema_time: cinema_time,
      cinema_date: cinema_date,
    };

    Model.connection.query(
      "INSERT INTO tickets SET ?",
      hostticket,
      (err, result) => {
        if (err) {
          return res.send({
            status: "FAILURE",
            message: `Error When updating seat: ${seat_number[index]}`,
          });
        }
      }
    );
  }
  res.send({
    status: "SUCCESS",
    message: `All Seats update successfully. refreash to see changes`,
  });
};

const delete_ticket_by_id_query = (ticket_id, cb) => {
  Model.connection.query(
    `DELETE FROM tickets WHERE ticket_id = ?`,
    [ticket_id],
    (error, results) => {
      if (error) {
        return cb(error);
      }
      // Send the results back to the client
      cb(null, results);
    }
  );
};

// Update event by ID
function updateTicketQuery(field, value, event_id) {
  Model.connection.query(
    "UPDATE tickets SET ?? = ? WHERE ticket_id = ?",
    [field, value, event_id],
    function (err, results) {
      if (err) throw err;
    }
  );
}

// NOT APPLICABLE RN

const get_all_user_tickets_query = (username, cb) => {
  Model.connection.query(
    `SELECT events.event_id AS events_event_id, events.event_name AS events_event_name, 
		events.event_date AS events_event_date, events.event_time AS events_event_time, 
		events.event_location AS events_event_location, events.About AS events_About, 
		events.Image_url AS events_Image_url, events.Video_url AS events_Video_url, 
		events.number_of_people AS events_number_of_people, events.host_username AS events_host_username, 
		events.active AS events_active, events.normal_price AS events_normal_price, 
		events.category AS events_category, events.like_count AS events_like_count, 
		events.cinema_id AS events_cinema_id,
		tickets.ticket_id AS tickets_ticket_id, tickets.ticket_owner AS tickets_ticket_owner, 
		tickets.ticket_description AS tickets_ticket_description, 
		tickets.show_under_participants AS tickets_show_under_participants, 
		tickets.Date_of_purchase AS tickets_Date_of_purchase, 
		tickets.time_of_purchase AS tickets_time_of_purchase, tickets.ticket_type AS tickets_ticket_type, 
		tickets.cinema_time AS tickets_cinema_time, tickets.cinema_date AS tickets_cinema_date, tickets.seat_number AS tickets_seat_number,
		tickets.redeemed AS tickets_redeemed
		FROM events
		JOIN tickets
		ON events.event_id = tickets.event_id
		WHERE tickets.ticket_owner = ?;
		`,
    [username],
    (error, results) => {
      if (error) {
        return cb(error);
      }
      // Send the results back to the client
      cb(null, results);
    }
  );
};

const get_user_ticket_by_id_query = (username, ticket_id, cb) => {
  Model.connection.query(
    "SELECT * FROM tickets WHERE ticket_owner = ? AND ticket_id = ?",
    [username, ticket_id],
    (error, results) => {
      if (error) {
        return cb(error);
      }
      // Send the results back to the client
      cb(null, results);
    }
  );
};

const delete_ticket_by_id = (req, res) => {
  const { ticket_id } = req.body;

  if (!ticket_id || ticket_id == undefined || ticket_id == null) {
    return res.send({
      status: "FAILURE",
      message: "Please provide a ticket id.",
    });
  }
  try {
    get_user_ticket_by_id_query(
      (username = req.decoded["username"]),
      ticket_id,
      (err, tickets) => {
        if (err) {
          res.send({
            status: "FAILURE",
            message: err,
          });
        } else {
          if (tickets.length < 1) {
            return res.send({
              status: "FAILURE",
              message: "A ticket with this id not found on your account!",
            });
          } else {
            delete_ticket_by_id_query(ticket_id, (err, results) => {
              if (err) {
                res.send({
                  status: "FAILURE",
                  message: err,
                });
              } else {
                res.send({
                  status: "SUCCESS",
                  message: "Deleted successfully",
                });
              }
            });
          }
        }
      }
    );
  } catch (err) {
    return res.send({ status: "FAILURE", message: "Unknown error" });
  }
};

const get_participants = (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    res.send({ status: "FAILURE", message: "event id required" });
  }

  const query = `SELECT DISTINCT tickets.ticket_owner, users.username, users.fullname, 
	users.profile_pic_url, users.follower_count FROM tickets
	JOIN users ON tickets.ticket_owner = users.username
	WHERE tickets.event_id = ? AND show_under_participants = 1;`;

  Model.connection.query(query, [event_id], (err, results) => {
    if (err) {
      res.send({ status: "FAILURE", message: "query failed" });
    }
    if (results) {
      res.send({ status: "SUCCESS", participants: results });
    }
  });
};

const redeem_ticket_query = (ticket_id, cb) => {
  let query = `UPDATE tickets SET redeemed = 1 WHERE ticket_id = ?`;

  Model.connection.query(query, [ticket_id], (err, results) => {
    if (err) {
      return cb(err);
    }
    // Send the results back to the client
    cb(null, results);
  });
};

const check_if_redeemed_query = (ticket_id, cb) => {
  let query = `SELECT redeemed from tickets WHERE ticket_id = ?`;

  Model.connection.query(query, [ticket_id], (err, result) => {
    if (!err && result) {
      return cb(null, result);
    } else {
      return cb(null);
    }
  });
};

const verify_ticket = (req, res) => {
  try {
    const { ticket_id } = req.query;

    if (!ticket_id || ticket_id == undefined || ticket_id == null) {
      return res.send({
        status: "FAILURE",
        message: "Please provide a ticket id.",
      });
    }

    const query = `SELECT * FROM tickets WHERE ticket_id = ?`;

    Model.connection.query(query, [ticket_id], (err, results) => {
      if (!err && results.length > 0) {
        return res.send(
          `<h2 style="color:green;">Ticket with id: <em>${ticket_id}</em> is valid and belongs to user: <em>${results[0].ticket_owner}</em></h2>`
        );
      } else {
        return res.send(
          `<h2 style="color:red;">Ticket not found, Report user immediately!</h2>`
        );
      }
    });
  } catch (err) {
    return res.send(`<h2>Try again in a short while or contact support.</h2>`);
  }
};

const bulk_verify_tickets = (req, res) => {
  try {
    const { event_id, username } = req.query;

    if (!event_id || event_id == undefined || event_id == null || !username) {
      return res.send({
        status: "FAILURE",
        message: "Please provide a event id and username",
      });
    }

    const query = `SELECT * FROM tickets WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0`;

    Model.connection.query(query, [event_id, username], (err, results) => {
      if (!err && results.length > 0) {
        return res.send(
          `<h2 style="color:green;">user: <em>${results[0]?.ticket_owner}</em> has ${results?.length} active ticket/s for this event.</h2>`
        );
      } else {
        return res.send(
          `<h2 style="color:red;">User: <em>${results[0]?.ticket_owner}</em> has No active tickets for this event</h2>`
        );
      }
    });
  } catch (err) {
    return res.send(
      `<h2>Try again in a short while or contact support. ${err}</h2>`
    );
  }
};

const get_all_user_tickets = (req, res) => {
  // Get the user's username from the decoded token
  const username = req.decoded["username"];

  if (!username) {
    return res.send({ status: "FAILURE", message: "insufficient privileges" });
  } else {
    // Query the database for all the tickets belonging to the user
    get_all_user_tickets_query(username, (err, tickets) => {
      if (err) {
        return res.send({ message: "err" });
      } else {
        return res.send(tickets);
      }
    });
  }
};

const date_from_to_calc = (days_before = 2) => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const TO_DATE = `${year}-${month}-${day}`;

  date.setDate(date.getDate() - days_before);
  const year2 = date.getFullYear();
  const month2 = (date.getMonth() + 1).toString().padStart(2, "0");
  const day2 = date.getDate().toString().padStart(2, "0");
  const FROM_DATE = `${year2}-${month2}-${day2}`;

  return { FROM_DATE, TO_DATE };
};

const amount_calculator = async (
  ticket_type,
  qty = 1,
  event_id,
  normal_price = 0,
  coupon_code = null
) => {
  let found = await mongodb.TicketTypes.findOne({
    event_id: event_id,
    ticket_type: ticket_type,
  });
  const coupon = await mongodb.Coupon.findOne({
    coupon_code: coupon_code,
    resource_id: event_id,
  });

  try {
    let price = 0;
    if (!found) {
      const getPrice = normal_price == 0 ? false : (normal_price *= qty);

      if (coupon) {
        const couponDiscountPercentage = coupon.discount_percentage / 100;
        if (couponDiscountPercentage > 0 && couponDiscountPercentage < 100) {
          price = getPrice - getPrice * couponDiscountPercentage;

          return price;
        } else {
          return getPrice;
        }
      }

      return getPrice;
    } else {
      price = found.ticket_price;
      const getPrice = price == 0 ? false : (price *= qty);

      if (coupon) {
        const couponDiscountPercentage = coupon.discount_percentage / 100;
        if (couponDiscountPercentage > 0 && couponDiscountPercentage < 100) {
          price = getPrice - getPrice * couponDiscountPercentage;

          return price;
        } else {
          return getPrice;
        }
      }
      return getPrice;
    }
  } catch (error) {
    return false;
  }
};

const checkObject = (obj) => {
  for (let key in obj) {
    if (obj[key] === undefined) return true;
    if (typeof obj[key] === "object") {
      if (checkObject(obj[key])) return true;
    }
  }
  return false;
};

const buy_ticket = async (req, res) => {
  const {
    ticket_owner,
    ticket_description,
    show_under_participants,
    event_id,
    ticket_type,
    redeemed = false,
    coupon_code = null,
    is_cinema_ticket = false,
  } = req.body.ticket;

  const qty = req.body.qty || 1;

  const mui = req.body;

  getEvent_query("event_id", event_id, async (err, result) => {
    if (!err && result) {
      const amount = await amount_calculator(
        req.body.ticket.ticket_type,
        qty,
        event_id,
        result.normal_price,
        coupon_code
      );

      if (amount == false && !coupon_code) {
        return res.send({
          status: "FAILURE",
          message:
            "invalid ticket type or event not found for ticket type comparison",
        });
      }
      const tx_ref = `user:'${
        req.decoded["username"]
      }_date:${new Date()}_event:${event_id}_qty:${qty}_type:${ticket_type}`;

      if (
        ticket_owner === undefined ||
        ticket_description === undefined ||
        show_under_participants === undefined ||
        event_id === undefined ||
        ticket_type === undefined
      ) {
        return res.send({
          status: "FAILURE",
          messgae: "Missing some ticket details",
        });
      }

      try {
        const tx_ref = `user:'${
          req.decoded["username"]
        }_date:${new Date()}_event:${event_id}_qty:${qty}_type:${ticket_type}`;
        const time = new Date();

        try {
          if (amount > 0) {
            const payment = await paymentService.requestPayment(
              ticket_owner,
              ticket_description == undefined ||
                ticket_description == null ||
                ticket_description == ""
                ? "placeholder description"
                : ticket_description,
              show_under_participants,
              event_id,
              ticket_type,
              amount + CONVENIENCE_FEE * qty, // convenience cost of K5 per ticket
              redeemed,
              req.decoded["username"],
              qty,
              false,
              null,
              null,
              null,
              tx_ref
            );

            return res.send({
              status: "SUCCESS",
              message: "payment link created",
              link: payment.paymentLink,
            });
          } else {
            let newPendingTicket;
            if (is_cinema_ticket) {
              newPendingTicket = mongodb.Tickets({
                ticket_owner: ticket_owner,
                ticket_description: ticket_description,
                show_under_participants:
                  show_under_participants !== false
                    ? true
                    : show_under_participants,
                ticket_type: ticket_type,
                event_id: event_id,
                date_of_purchase: new Date().toISOString().slice(0, 10),
                time_of_purchase:
                  ("0" + time.getHours()).slice(-2) +
                  ":" +
                  ("0" + time.getMinutes()).slice(-2) +
                  ":" +
                  ("0" + time.getSeconds()).slice(-2),
                redeemed: redeemed,
                tx_ref: tx_ref,
                qty: qty,
                seatsChosen: seatsChosen,
                is_cinema_ticket: true,
                cinema_time: cinema_time,
                cinema_date: cinema_date,
              });
            } else {
              newPendingTicket = mongodb.Tickets({
                ticket_owner: ticket_owner,
                ticket_description: ticket_description,
                show_under_participants:
                  show_under_participants !== false
                    ? true
                    : show_under_participants,
                ticket_type: ticket_type,
                event_id: event_id,
                date_of_purchase: new Date().toISOString().slice(0, 10),
                time_of_purchase:
                  ("0" + time.getHours()).slice(-2) +
                  ":" +
                  ("0" + time.getMinutes()).slice(-2) +
                  ":" +
                  ("0" + time.getSeconds()).slice(-2),
                redeemed: false,
                tx_ref: tx_ref,
                qty: qty,
              });

              await newPendingTicket.save();

              const Ticket = await mongodb.Tickets.findOne({
                tx_ref: tx_ref,
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
                    // console.log(modifiedTicket, "modifiedTicket");
                    try {
                      create_ticket_query(modifiedTicket, (err, results) => {
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

                                        const userFollowersUserNames =
                                          await mongodb.Followers.find({
                                            following_id: founduser.username,
                                          });

                                        const userFollowers =
                                          await getUserObjects(
                                            userFollowersUserNames
                                          );

                                        await sendNotificationToFollowers(
                                          userFollowers,
                                          "Fire event",
                                          founduser.username
                                        );
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
                      });
                    } catch (err) {
                      console.log(err, "apa pali issue ");
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
                    create_ticket_query(Ticket, (err, results) => {
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

                                      let eventTitle = "";
                                      let eventLocation = "";
                                      // get event details using event_id
                                      getEvent_query(
                                        "event_id",
                                        event_id,
                                        (err, event) => {
                                          if (!err && event) {
                                            eventTitle = event.event_name;
                                            console.log(event, "event");
                                          } else {
                                            console.log(err, "err");
                                          }
                                        }
                                      );

                                      const userFollowersUserNames =
                                        await mongodb.Followers.find({
                                          following_id: founduser.username,
                                        });
                                      const follwers =
                                        userFollowersUserNames.map(
                                          (user) => user.follower_id
                                        );

                                      const userFollowers =
                                        await getUserObjects(follwers);

                                      await sendNotificationToFollowers(
                                        userFollowers,
                                        eventTitle,
                                        founduser.username
                                      );
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
                          freeCoupon: true,
                          message: "Transaction verified ✅",
                          code: "200",
                        });
                      }
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log(error, "error");
          return res.send({
            status: "FAILURE",
            message: "An error occurred while making the request.",
          });
        }
      } catch (error) {
        return res.send({
          status: "FAILURE",
          message: "An error occurred while making the request.",
        });
      }
    }
  });
};

const buy_cinema_ticket = async (req, res) => {
  const {
    ticket_owner,
    ticket_description,
    show_under_participants,
    event_id,
    ticket_type,
    time = new Date(),
    redeemed = false,
  } = req.body.ticket;
  const qty = req.body.qty || 1;
  const { seatsChosen } = req.body;
  const { cinema_time } = req.body;
  const { cinema_date } = req.body;

  if (
    ticket_owner === undefined ||
    ticket_description === undefined ||
    show_under_participants === undefined ||
    event_id === undefined ||
    ticket_type === undefined ||
    seatsChosen?.length < 1 ||
    seatsChosen == undefined ||
    cinema_time == undefined ||
    cinema_date == undefined
  ) {
    return res.send({
      status: "FAILURE",
      messgae: "Missing some ticket details",
    });
  } else {
    try {
      getEvent_query("event_id", event_id, async (err, result) => {
        if (!err && result) {
          const amount = await amount_calculator(
            req.body.ticket.ticket_type,
            qty,
            event_id,
            result.normal_price
          );

          if (amount == false) {
            return res.send({
              status: "FAILURE",
              message:
                "invalid ticket type or event not found for ticket type comparison",
            });
          } else {
            const tx_ref = `user:'${
              req.decoded["username"]
            }_date:${new Date()}_event:${event_id}_qty:${
              seatsChosen?.length || qty
            }_type:${ticket_type}_seats_${seatsChosen}`;

            const is_cinema_ticket = true;

            try {
              const payment = await paymentService.requestPayment(
                ticket_owner,
                ticket_description == undefined ||
                  ticket_description == null ||
                  ticket_description == ""
                  ? "placeholder description"
                  : ticket_description,
                show_under_participants,
                event_id,
                ticket_type,
                amount + CONVENIENCE_FEE * qty, // convenience cost of K5 per ticket
                redeemed,
                req.decoded["username"],
                qty,
                is_cinema_ticket,
                seatsChosen,
                cinema_time,
                cinema_date,
                tx_ref
              );

              return res.send({
                status: "SUCCESS",
                message: "payment link created",
                link: payment.paymentLink,
              });
            } catch (err) {
              return res.send({
                status: "FAILURE",
                message: "Unknown error, contact support, or try later.",
                code: "99",
              });
            }
          }
        }
      });
    } catch (err) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error, contact support, or try later.",
        code: "99",
      });
    }
  }
};
// const buy_cinema_ticket = async (req, res) => {
//   const {
//     ticket_owner,
//     ticket_description,
//     show_under_participants,
//     event_id,
//     ticket_type,
//     time = new Date(),
//     redeemed = false,
//   } = req.body.ticket;
//   const qty = req.body.qty || 1;
//   const { seatsChosen } = req.body;
//   const { cinema_time } = req.body;
//   const { cinema_date } = req.body;

//   if (
//     ticket_owner === undefined ||
//     ticket_description === undefined ||
//     show_under_participants === undefined ||
//     event_id === undefined ||
//     ticket_type === undefined ||
//     seatsChosen?.length < 1 ||
//     seatsChosen == undefined ||
//     cinema_time == undefined ||
//     cinema_date == undefined
//   ) {
//     return res.send({
//       status: "FAILURE",
//       messgae: "Missing some ticket details",
//     });
//   } else {
//     try {
//       getEvent_query("event_id", event_id, async (err, result) => {
//         if (!err && result) {
//           const amount = await amount_calculator(
//             req.body.ticket.ticket_type,
//             qty,
//             event_id,
//             result.normal_price
//           );

//           if (amount == false) {
//             return res.send({
//               status: "FAILURE",
//               message:
//                 "invalid ticket type or event not found for ticket type comparison",
//             });
//           } else {
//             const tx_ref = `user:'${
//               req.decoded["username"]
//             }_date:${new Date()}_event:${event_id}_qty:${
//               seatsChosen?.length || qty
//             }_type:${ticket_type}_seats_${seatsChosen}`;

//             const Payment_payload = {
//               headers: {
//                 Authorization: `Bearer ${
//                   process.env.MODE == "TEST"
//                     ? process.env.FLW_SECRET_KEY_TEST
//                     : process.env.FLW_SECRET_KEY
//                 }`,
//               },
//               json: {
//                 tx_ref: tx_ref,
//                 amount: amount + amount * 0.12, //Service cost 12%
//                 currency: "ZMW",
//                 redirect_url: "http://api.trybae.com/transactions/verifytxn",
//                 meta: {
//                   consumer_id: req.decoded["username"],
//                 },
//                 customer: {
//                   email: req.body.Payment_payload.customer.email,
//                   phonenumber: req.body.Payment_payload.customer.phone,
//                   name: req.decoded["username"],
//                 },
//                 customizations: {
//                   title: "TryBae tickets",
//                 },
//               },
//             };
//             if (checkObject(Payment_payload) == false) {
//               let response;

//               try {
//                 response = await got.post(
//                   "https://api.flutterwave.com/v3/payments",
//                   Payment_payload
//                 );
//               } catch (err) {
//                 console.log(err);
//                 return res.send({
//                   status: "FAILURE",
//                   message:
//                     "Internal payment api error, contact support or try later",
//                 });
//               }

//               let body = JSON.parse(response.body);

//               if (body.status == "success") {
//                 const newPendingTicket = mongodb.Tickets({
//                   ticket_owner: ticket_owner,
//                   ticket_description: ticket_description,
//                   show_under_participants:
//                     show_under_participants !== false
//                       ? true
//                       : show_under_participants,
//                   ticket_type: ticket_type,
//                   event_id: event_id,
//                   date_of_purchase: new Date().toISOString().slice(0, 10),
//                   time_of_purchase:
//                     ("0" + time.getHours()).slice(-2) +
//                     ":" +
//                     ("0" + time.getMinutes()).slice(-2) +
//                     ":" +
//                     ("0" + time.getSeconds()).slice(-2),
//                   redeemed: redeemed,
//                   tx_ref: tx_ref,
//                   qty: qty,
//                   seatsChosen: seatsChosen,
//                   is_cinema_ticket: true,
//                   cinema_time: cinema_time,
//                   cinema_date: cinema_date,
//                 });

//                 await newPendingTicket.save();
//                 return res.send({
//                   status: "SUCCESS",
//                   message: "Redirect to payment link",
//                   link: body.data.link,
//                 });
//               } else {
//                 return res.send({
//                   status: "FAILURE",
//                   message:
//                     "Middleware error, please contact support or try later",
//                 });
//               }
//             } else {
//               return res.send({
//                 status: "FAILURE",
//                 message: "One or more properties of payment payload undefined",
//               });
//             }
//           }
//         } else {
//           return res.send({
//             status: "FAILURE",
//             message: "Event not found, contact support to fix this",
//           });
//         }
//       });
//     } catch (err) {
//       return res.send({
//         status: "FAILURE",
//         message: "Unknown error, contact support, or try later.",
//         code: "99",
//       });
//     }
//   }
// };

const bulk_transfer = (req, res) => {
  const { event_id, qty, transfer_to, comment = null } = req.body;
  const username = req.decoded["username"];

  if (!event_id || !qty || !username || qty == 0 || !transfer_to) {
    return res.send({
      status: "FAILURE",
      message: "Invalid or missing details.",
    });
  } else {
    getEvent_query("event_id", event_id, (err, found) => {
      if (!err && found) {
        // Date.prototype.cutHours = function (h) {
        // 	this.setHours(this.getHours() - h);
        // 	return this;
        // };

        // Date.prototype.addHours = function (h) {
        // 	this.setHours(this.getHours() + h);
        // 	return this;
        // };

        // let jsDate;
        // let cuthours = 0;

        // jsDate = new Date(found.event_date);
        // cuthours = 1;

        // if (jsDate.cutHours(cuthours) <= new Date()) {
        // 	return res.send({
        // 		status: "FAILURE",
        // 		message: "Cannot transfer 23 hours before the event",
        // 	});
        // } else {
        const query = `SELECT * FROM tickets WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0`;

        Model.connection.query(query, [event_id, username], (err, results) => {
          if (err) {
            return res.send({
              status: "FAILURE",
              message: "Unknown error, contact support",
            });
          }
          if (results.length < qty) {
            return res.send({
              status: "FAILURE",
              message: "Insufficeint tickets",
            });
          } else {
            getUserByUsername(transfer_to, (err, founduser) => {
              if (!err && founduser) {
                let ticket_ids = results?.map((obj) => obj.ticket_id);
                let query = `UPDATE tickets SET ticket_owner = ? WHERE ticket_id = ?`;
                let completed = 0;

                for (let i = 0; i < qty; i++) {
                  Model.connection.query(
                    query,
                    [transfer_to, ticket_ids[i]],
                    (err, done) => {
                      if (!err && done) {
                        new_transfer_log(
                          {
                            ticket_transfered: ticket_ids[i],
                            transfer_to: transfer_to,
                            transfer_from: username,
                            comment: comment,
                          },
                          (err, results) => {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("Transfer log saved successfully!");
                            }
                          }
                        );
                        completed++;
                      } else {
                        return res.send({
                          status: "FAILURE",
                          message:
                            "Some tickets might be Transferred, but others might have not, try later.",
                        });
                      }

                      if (completed == qty - 1 || completed == qty) {
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
                                title: "Tickets Recieved 🎫",
                                body: `Hello ${founduser.username}, You recieved ${qty} ticket/s from '${username}' \nComment: '${comment}'.`,
                              },
                            ];

                            (async () => {
                              let chunks =
                                expo.chunkPushNotifications(messages);
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
                          return res.send({
                            status: "FAILURE",
                            message:
                              "Unknown error, ticket might have been Transferred, restart app to confirm, if not try again later",
                          });
                        }
                      }

                      return res.send({
                        status: "SUCCESS",
                        message: `Transferred ${qty} tickets to ${transfer_to}`,
                      });
                    }
                  );
                }
              } else {
                return res.send({
                  status: "FAILURE",
                  message:
                    "The user you are trying to transfer to is not found",
                });
              }
            });
          }
        });
        // }
      } else {
        return res.send({ status: "FAILURE", message: "Event not found" });
      }
    });
  }
};

const bulk_redeem = (req, res) => {
  const { event_id, qty = 1, event_passcode } = req.body;
  const username = req.decoded["username"];

  if (
    !event_id ||
    !username ||
    qty == undefined ||
    !event_passcode ||
    isNaN(qty) == true
  ) {
    return res.send({
      status: "FAILURE",
      message: "Invalid or Missing details",
    });
  } else {
    const passcode_check = `SELECT event_passcode FROM events WHERE event_id = ?`;

    try {
      Model.connection.query(passcode_check, [event_id], (err, results) => {
        if (!err && results) {
          if (results[0].event_passcode != event_passcode) {
            return res.send({
              status: "FAILURE",
              message: "Invalid event passcode",
            });
          } else {
            const query = `SELECT * FROM tickets WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0`;

            Model.connection.query(
              query,
              [event_id, username],
              (err, result) => {
                if (!err && qty <= result?.length) {
                  const query2 = `UPDATE tickets SET redeemed = 1 WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0 LIMIT ${qty}`;

                  Model.connection.query(
                    query2,
                    [event_id, username],
                    (err, done) => {
                      if (!err && done) {
                        return res.send({
                          status: "SUCCESS",
                          message: `redeemed ${qty} ticket/s for given event`,
                        });
                      } else {
                        console.log(err);
                        return res.send({
                          status: "SEMI-FAILURE",
                          message:
                            "Error redeeming one of the tickets, maybe try again",
                        });
                      }
                    }
                  );
                } else {
                  return res.send({
                    status: "FAILURE",
                    message: "Not enough tickets to bulk redeem",
                  });
                }
              }
            );
          }
        } else {
          return res.send({
            status: "FAILURE",
            message: "Unable to verify event",
          });
        }
      });
    } catch (err) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error, contact support",
      });
    }
  }
};

const multi_redeem = (req, res) => {
  const { event_id, ticket_ids = [], event_passcode } = req.body;
  const username = req.decoded["username"];

  if (
    !event_id ||
    !username ||
    !Array.isArray(ticket_ids) ||
    ticket_ids.length === 0 ||
    !event_passcode
  ) {
    return res.status(404).send({
      status: "FAILURE",
      message: "Invalid or Missing details",
    });
  } else {
    const passcode_check = `SELECT event_passcode FROM events WHERE event_id = ?`;

    try {
      Model.connection.query(passcode_check, [event_id], (err, results) => {
        if (!err && results) {
          if (results[0].event_passcode !== event_passcode) {
            return res.send({
              status: "FAILURE",
              message: "Invalid event passcode",
            });
          } else {
            const query = `SELECT * FROM tickets WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0 AND ticket_id IN (?)`;

            Model.connection.query(
              query,
              [event_id, username, ticket_ids],
              (err, result) => {
                if (!err && result.length === ticket_ids.length) {
                  const query2 = `UPDATE tickets SET redeemed = 1 WHERE event_id = ? AND ticket_owner = ? AND redeemed = 0 AND ticket_id IN (?)`;

                  Model.connection.query(
                    query2,
                    [event_id, username, ticket_ids],
                    (err, done) => {
                      if (!err && done) {
                        return res.send({
                          status: "SUCCESS",
                          message: `Redeemed ${ticket_ids.length} ticket/s for given event`,
                        });
                      } else {
                        console.log(err);
                        return res.send({
                          status: "SEMI-FAILURE",
                          message:
                            "Error redeeming one of the tickets, maybe try again",
                        });
                      }
                    }
                  );
                } else {
                  return res.send({
                    status: "FAILURE",
                    message: "Not all tickets are available for redemption",
                  });
                }
              }
            );
          }
        } else {
          return res.send({
            status: "FAILURE",
            message: "Unable to verify event",
          });
        }
      });
    } catch (err) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error, contact support",
      });
    }
  }
};

const redeem_ticket = (req, res) => {
  const { ticket_id, event_passcode } = req.body;

  if (!ticket_id || ticket_id == undefined || ticket_id == null) {
    return res.send({
      status: "FAILURE",
      message: "Please provide a ticket id and event passcode",
    });
  }

  get_user_ticket_by_id_query(
    (username = req.decoded["username"]),
    ticket_id,
    (err, tickets) => {
      if (err) {
        res.send({
          status: "FAILURE",
          message: "Unknown error",
        });
      } else {
        if (tickets.length < 1) {
          return res.send({
            status: "FAILURE",
            message: "A ticket with this id not found on your account!",
          });
        } else {
          getEvent_query("event_id", tickets[0].event_id, (err, event) => {
            if (err || !event) {
              return res.send({
                status: "FAILURE",
                message: "Error retrieving event",
              });
            }
            check_if_redeemed_query(ticket_id, (err, result) => {
              if (result[0]?.redeemed == 0 && !err) {
                redeem_ticket_query(ticket_id, (err, results) => {
                  if (err || !results) {
                    res.send({
                      status: "FAILURE",
                      message: `Unknown error, contact support`,
                    });
                  } else {
                    res.send({
                      status: "SUCCESS",
                      message: "Ticket Redeemed successfully",
                    });
                  }
                });
              } else {
                res.send({
                  status: "FAILURE",
                  message: "Ticket already redeemed",
                });
              }
            });
          });
        }
      }
    }
  );
};

function getEvent_query(field, value, callback) {
  const query = mysql.format("SELECT * FROM events WHERE ?? = ?", [
    field,
    value,
  ]);
  Model.connection.query(query, function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results[0]);
    }
  });
}

const getUserByUsername = (username, cb) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  Model.connection.query(query, [username], (error, results) => {
    if (error) {
      return cb(error);
    }
    cb(null, results[0]);
  });
};

const new_transfer_log = (data, cb) => {
  const time = new Date();
  const {
    transfer_to,
    transfer_from,
    comment = null,
    ticket_transfered,
    transfer_date = new Date().toISOString().slice(0, 10),
    transfer_time = ("0" + time.getHours()).slice(-2) +
      ":" +
      ("0" + time.getMinutes()).slice(-2) +
      ":" +
      ("0" + time.getSeconds()).slice(-2),
  } = data;

  const query = `INSERT INTO ticket_transfer_logs 
	(transfer_id, transfer_from, transfer_to, comment, ticket_transfered, transfer_date, transfer_time)
	VALUES(UUID(), ?, ?, ?, ?, ?, ?)`;
  Model.connection.query(
    query,
    [
      transfer_from,
      transfer_to,
      comment,
      ticket_transfered,
      transfer_date,
      transfer_time,
    ],
    (err, results) => {
      if (err || !results) {
        return cb(err);
      } else {
        cb(null, results);
      }
    }
  );
};

const get_transfer_logs = (req, res) => {
  const username = req.decoded["username"];

  const query = `SELECT * FROM ticket_transfer_logs WHERE transfer_from = ? OR transfer_to = ?`;

  try {
    Model.connection.query(query, [username, username], (err, result) => {
      if (!err && result.length > 0) {
        return res.send({ status: "SUCCESS", data: result });
      } else {
        return res.send({
          status: "FAILURE",
          message: "No transfers done on this account",
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const transfer_ticket = (req, res) => {
  const { ticket_id, transfer_to, comment } = req.body;

  const username = req.decoded["username"];

  if (username == transfer_to) {
    return res.send({
      status: "FAILURE",
      message: "Cannot transfer to self",
    });
  }

  try {
    get_user_ticket_by_id_query(username, ticket_id, async (err, result) => {
      if (!err && result[0] !== undefined && result[0].redeemed == 0) {
        getEvent_query("event_id", result[0].event_id, (err, found) => {
          if (!err && found) {
            // Date.prototype.cutHours = function (h) {
            // 	this.setHours(this.getHours() - h);
            // 	return this;
            // };

            // Date.prototype.addHours = function (h) {
            // 	this.setHours(this.getHours() + h);
            // 	return this;
            // };

            // let jsDate;
            // let cuthours = 3;

            // if (result[0].seat_number !== null) {
            // 	const time = result[0].cinema_time;
            // 	const date = result[0].cinema_date;

            // 	const [day, month, year] = date.split("/");
            // 	const [hours, minutes] = time.split(":");

            // 	jsDate = new Date(year, month - 1, day, hours, minutes);
            // 	cuthours = 1;
            // } else {
            // 	jsDate = new Date(found.event_date);
            // 	cuthours = 1;
            // }

            // if (jsDate.cutHours(cuthours) <= new Date()) {
            // 	return res.send({
            // 		status: "FAILURE",
            // 		message: `Cannot transfer ${cuthours} hours before the event`,
            // 	});
            // } else {
            getUserByUsername(transfer_to, (err, result) => {
              if (!err && result) {
                try {
                  updateTicketQuery("ticket_owner", transfer_to, ticket_id);

                  try {
                    new_transfer_log(
                      {
                        ticket_transfered: ticket_id,
                        transfer_to: transfer_to,
                        transfer_from: username,
                        comment: comment,
                      },
                      (err, results) => {
                        if (err) {
                          console.log(err);
                        } else {
                          console.log("Transfer log saved successfully!");
                        }
                      }
                    );

                    if (!Expo.isExpoPushToken(result.Expo_push_token)) {
                      console.error(
                        `Push token ${result.Expo_push_token} is not a valid Expo push token. Notification to user wont be sent`
                      );
                    } else {
                      messages = [
                        {
                          to: result.Expo_push_token,
                          sound: "default",
                          title: "Ticket Recieved 🎫",
                          badge: 1,
                          body: `Hello ${result.username}, You recieved a ticket from '${username}' \nComment: '${comment}'.`,
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
                    return res.send({
                      status: "FAILURE",
                      message:
                        "Unknown error, ticket might have been Transferred, restart app to confirm, if not try again later",
                    });
                  }
                } catch (err) {
                  console.log(err);
                  return res.send({
                    status: "FAILURE",
                    message:
                      "Unknown error, ticket might have been Transferred, restart app to confirm",
                  });
                }

                return res.send({
                  status: "SUCCESS",
                  message: `Ticket successfully transferred to user: '${transfer_to}'`,
                });
              } else {
                return res.send({
                  status: "FAILURE",
                  message: "The user you want to transfer to, is not found.",
                });
              }
            });
          }
          // }
        });
      } else {
        return res.send({
          status: "FAILURE",
          message:
            "Either ticket doesnt exist, or you dont own it, or it has been redeemed.",
        });
      }
    });
  } catch (err) {
    return res.send({
      status: "FAILURE",
      message: "Unknown error, try later, or contact support.",
    });
  }
};

const get_ticket_by_id = (req, res) => {
  const { ticket_id } = req.body;
  const username = req.decoded["username"];

  try {
    // Query the database for all the tickets belonging to the user
    get_user_ticket_by_id_query(username, ticket_id, (err, tickets) => {
      if (err) {
        return res.send(err);
      } else {
        if (tickets.length < 1) {
          return res.send({
            status: "FAILURE",
            message: "A ticket with this id not found on this account",
          });
        } else {
          return res.send({ status: "SUCCESS", ticket: tickets[0] });
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const new_ticket_purchase_check = async (req, res) => {
  const username = req.decoded["username"];

  const found = await mongodb.newTicketPurchase.find({ userId: username });
  console.log(found);

  try {
    if (found.length > 0) {
      const done = await mongodb.newTicketPurchase.deleteMany({
        userId: username,
      });
      return res.send({ status: "SUCCESS", anyrecent: true });
    } else {
      return res.send({ status: "SUCCESS", anyrecent: false });
    }
  } catch (error) {
    console.log(error);
  }
};

// Daily Sales by ENIGMA
const getDailySales = async (req, res) => {
  const { event_id, startDate, endDate } = req.body;

  getdailySales_query(event_id, startDate, endDate, (error, results) => {
    if (error) {
      res.send({ status: "FAILURE", message: "Unkown error" });
    } else {
      res.send({ status: "SUCCESS", result: results });
    }
  });
};

// Monthly Sales by ENIGMA
const getMonthSales = async (req, res) => {
  const { host_username, startDate, endDate } = req.body;

  getmonthlySales_query(host_username, startDate, endDate, (error, results) => {
    if (error) {
      res.send({ status: "FAILURE", message: "Unkown error" });
    } else {
      console.log(results);
      res.send({ status: "SUCCESS", result: results });
    }
  });
};

function getdailySales_query(value, valueTwo, valueThree, callback) {
  const query = mysql.format(
    "SELECT DATE(Date_of_Purchase) AS day, COUNT(*) AS daily_tickets_sold FROM tickets WHERE event_id = ? AND Date_of_purchase >= ? AND Date_of_purchase <= ? GROUP BY day ORDER BY day",
    [value, valueTwo, valueThree]
  );
  Model.connection.query(query, function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

function getmonthlySales_query(field, fieldTwo, fieldThree, callback) {
  const query = mysql.format(
    "SELECT DATE_FORMAT(tickets.Date_of_purchase, '%M') AS month_name, COUNT(*) AS monthly_tickets_sold, events.event_name FROM tickets JOIN events ON tickets.event_id = events.event_id WHERE tickets.event_id in (select event_id from events where host_username = ?) AND tickets.Date_of_purchase >= ? AND tickets.Date_of_purchase <= ? GROUP BY month_name, events.event_name ORDER BY FIELD( month_name, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' );",
    [field, fieldTwo, fieldThree]
  );
  Model.connection.query(query, function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

const breakdown = async (req, res) => {
  const { host_username } = req.body;

  getBreakdown(host_username, (error, result) => {
    if (error) {
      res.send({ status: "FAILURE", message: "Unkown error" });
    } else {
      res.send({ status: "success", message: result });
    }
  });
};

function getBreakdown(value, callback) {
  const query = mysql.format(
    "SELECT events.event_name, SUM(events.normal_price) AS total_normal_price FROM tickets JOIN events ON tickets.event_id = events.event_id where events.host_username = ? GROUP BY events.event_name;",
    [value]
  );
  Model.connection.query(query, function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}
const get_all_participants = (req, res) => {
  const { event_id } = req.body;

  if (!event_id) {
    res.send({ status: "FAILURE", message: "event id required" });
  }

  const query = `SELECT * FROM tickets WHERE event_id = ?;`;

  Model.connection.query(query, [event_id], (err, results) => {
    if (err) {
      res.send({ status: "FAILURE", message: "query failed" });
    }
    if (results) {
      res.send({ status: "SUCCESS", participants: results });
    }
  });
};

module.exports = {
  get_all_user_tickets,
  get_ticket_by_id,
  buy_ticket,
  bulk_transfer,
  buy_cinema_ticket,
  delete_ticket_by_id,
  verify_ticket,
  bulk_verify_tickets,
  get_participants,
  transfer_ticket,
  get_transfer_logs,
  create_ticket_query,
  hosttickets,
  redeem_ticket,
  bulk_redeem,
  new_ticket_purchase_check,
  getDailySales,
  getMonthSales,
  breakdown,
  get_all_participants,
  multi_redeem,
};
