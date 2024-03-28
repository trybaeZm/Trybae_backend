const Model = require("../models/TryBae_db");
const mysql = require("mysql2");
const mongo_db = require("../models/mongo_db");
const { createMulter } = require("../middleware/multer-upload");

// Select all events
function getAllEvents(req, res) {
  Model.connection.query("SELECT * FROM events", function (error, results) {
    if (error) {
      res.send({ status: "FAILURE", message: "Unknown error" });
    } else {
      console.log(results, "results");
      res.send({ status: "SUCCESS", results: results });
    }
  });
}

function getAllNonFeaturedEvents(req, res) {
  const eventType = req.query.eventType;
  if (eventType == undefined) {
    Model.connection.query(
      `SELECT * FROM events
		WHERE event_id NOT IN (SELECT event_id FROM featured_events);`,
      function (error, results) {
        if (error) {
          console.log(error, "error");
          return res.send({ status: "FAILURE", message: "Unknown error" });
        } else {
          return res.send({ status: "SUCCESS", results: results });
        }
      }
    );
  } else {
    Model.connection.query(
      `SELECT * FROM events
      WHERE event_id NOT IN (SELECT event_id FROM featured_events)
      AND category = ?;`,
      [eventType],
      function (error, results) {
        if (error) {
          console.log(error, "error");
          return res.send({ status: "FAILURE", message: "Unknown error" });
        } else {
          return res.send({ status: "SUCCESS", results: results });
        }
      }
    );
  }
}

function getAllFeaturedEvents(req, res) {
  Model.connection.query(
    `SELECT * FROM featured_events
		INNER JOIN events
		ON featured_events.event_id = events.event_id;`,
    function (error, results) {
      if (error) {
        return res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        return res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

function uploadevent_image(req, res) {
  if (req.decoded.privs != "admin") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const upload = createMulter(
    "public-read",
    "Events/images",
    "event_image",
    "jpg"
  );
  try {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.send({
          status: "FAILURE",
          message: "Disallowed file type",
        });
      }
      if (req.file && req.body.event_id) {
        updateEventQuery("Image_url", req.file.location, req.body.event_id);
        return res.send({ status: "SUCCESS", imageURL: req.file.location });
      } else {
        return res.send({
          status: "FAILURE",
          message: "No image or event_id provided in the request",
        });
      }
    });
  } catch (err) {
    // Handle the error and return a response
    return res.send({
      status: "FAILURE",
      message: "service down or busy or unknown error, try later",
    });
  }
}

function uploadevent_video(req, res) {
  if (req.decoded.privs != "admin") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const upload = createMulter(
    "public-read",
    "Events/videos",
    "event_video",
    "mp4"
  );
  try {
    // Use the createMulter function to handle the file upload
    upload.single("video")(req, res, (err) => {
      if (err) {
        return res.send({
          status: "ERROR",
          message: "Disallowed file type",
        });
      }
      if (req.file && req.body.event_id) {
        if (req.file.mimetype.startsWith("video/")) {
          updateEventQuery("Video_url", req.file.location, req.body.event_id);
          return res.send({ status: "SUCCESS", videoURL: req.file.location });
        }
      } else {
        return res.send({
          status: "FAILURE",
          message: "No video or event_id provided in the request",
        });
      }
    });
  } catch (err) {
    // Handle the error and return a response
    return res.send({
      status: "ERROR",
      message: "service down or busy or unknown error, try later",
    });
  }
}

async function Update_like_count(req, res) {
  let { id, type = "increase" } = req.body;

  const username = req.decoded["username"];

  if (id == undefined || !username) {
    res.send({
      status: "FAILURE",
      message:
        "please provide event post id and be authenticated to like a post",
    });
  }

  mongo_db.eventLikes.findOne({ event_id: id }, async (err, doc) => {
    if (!doc) {
      const newevent = new mongo_db.eventLikes({ event_id: id, likers: [] });
      await newevent.save();
    }
    if (err) {
      return res.send({
        status: "FAILURE",
        message: `Unknown error`,
      });
    }
  });

  if (type == "increase") {
    mongo_db.eventLikes.findOne(
      { event_id: id, likers: { $in: [username] } },
      function (err, event) {
        if (err || event) {
          return res.send({
            status: "FAILURE",
            message: "you already liked this event post",
          });
        } else {
          try {
            mongo_db.eventLikes.updateOne(
              { event_id: id },
              { $push: { likers: username } },
              function (err, event) {
                if (!err && event) {
                  Model.connection.query(
                    "UPDATE events SET like_count = like_count + 1 WHERE event_id = ?",
                    [id],
                    function (error, results) {
                      if (error) return res.send({ status: "FAILURE" });
                      else
                        return res.send({
                          status: "SUCCESS",
                          message: `liked event id ${id}`,
                        });
                    }
                  );
                } else {
                  return res.send({
                    status: "FAILURE",
                    message: `Unknown error`,
                  });
                }
              }
            );
          } catch (error) {
            return res.send({ status: "FAILURE", message: `Unknown error` });
          }
        }
      }
    );
  } else {
    mongo_db.eventLikes.findOne(
      { event_id: id, likers: { $in: [username] } },
      function (err, event) {
        if (err || !event) {
          return res.send({
            status: "FAILURE",
            message: "you dont like this event post anyway",
          });
        } else {
          mongo_db.eventLikes.updateOne(
            { event_id: id },
            { $pull: { likers: username } },
            function (err, event) {
              if (!err && event) {
                Model.connection.query(
                  "UPDATE events SET like_count = like_count - 1 WHERE event_id = ?",
                  [id],
                  function (error, results) {
                    if (error) return res.send({ status: "FAILURE" });
                    else
                      return res.send({
                        status: "SUCCESS",
                        message: `Unliked event id ${id}`,
                      });
                  }
                );
              } else {
                return res.send({
                  status: "FAILURE",
                  message: `Unknown error`,
                });
              }
            }
          );
        }
      }
    );
  }
}

// Select event by ID
async function getEventById(req, res) {
  const id = req.params.id;
  await getEvent_query("event_id", id, (error, results) => {
    if (error) {
      res.send({ status: "FAILURE", message: "Unkown error" });
    } else {
      res.send({ status: "SUCCESS", result: results });
    }
  });
}

async function getEvent_query(field, value, callback) {
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

// Add new event
async function addEvent(req, res) {
  if (req.decoded.privs != "admin") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const {
    event_name,
    event_time,
    event_location,
    event_date,
    About,
    number_of_people,
    host_username,
    active,
    normal_price,
    like_count,
    category,
    Longitude,
    Latitude,
  } = req.body;

  const passcode = Math.floor(10000 + Math.random() * 90000); // random 5 digit passcode

  const event = {
    event_name: event_name,
    event_date: event_date,
    event_time: event_time,
    event_location: event_location,
    About: About == undefined ? null : About,
    number_of_people: number_of_people == undefined ? 0 : number_of_people,
    host_username: host_username,
    active: active == undefined ? true : active,
    normal_price: normal_price,
    like_count: like_count == undefined ? 0 : like_count,
    category: category,
    Latitude: Latitude,
    Longitude: Longitude,
    event_passcode: passcode,
  };

  Model.connection.query(
    "INSERT INTO events SET ?",
    event,
    async function (error, results) {
      if (error) res.send({ status: "FAILURE", message: "Unknown error" });
      if (results) {
        await setTicketTypes(results.insertId, "normal_price", normal_price);
        res.send({
          status: "SUCCESS",
          message:
            "successfully created event, keep the event passcode secure.",
          event_name: event_name,
          event_passcode: passcode,
        });
      }
    }
  );
}

const setTicketTypes = async (event_id, ticket_type, ticket_price) => {
  try {
    const new_event_ticket_type_record = new mongo_db.TicketTypes({
      event_id: `${event_id}`,
      ticket_type: ticket_type,
      ticket_price: ticket_price,
    });

    await new_event_ticket_type_record.save();

    return true;
  } catch (err) {
    return false;
  }
};

const getTicketTypesEndpoint = async (req, res) => {
  if (req.body.event_id == undefined) {
    return res.send({ status: "FAILURE", message: "Event Id required" });
  }

  const ticket_types = await mongo_db.TicketTypes.find({
    event_id: req.body.event_id,
  });

  if (!ticket_types) {
    return res.send({
      status: "FAILURE",
      message: "No ticket types found for given event",
    });
  } else {
    return res.send({ status: "SUCCESS", data: ticket_types });
  }
};

const setTicketTypesEndpoint = async (req, res) => {
  if (req.decoded.privs != "admin") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const { ticket_types } = req.body;

  if (!ticket_types) {
    return res.send({
      status: "FAILURE",
      message: `Missing details`,
    });
  }

  try {
    for (let i = 0; i < ticket_types?.length; i++) {
      const ticket_type = await mongo_db.TicketTypes.findOne({
        event_id: `${ticket_types[i].event_id}`,
        ticket_type: ticket_types[i].ticket_type,
        ticket_price: ticket_types[i].ticket_price,
      });
      if (ticket_type) {
        await mongo_db.TicketTypes.deleteOne({
          event_id: `${ticket_types[i].event_id}`,
          ticket_type: ticket_types[i].ticket_type,
          ticket_price: ticket_types[i].ticket_price,
        });
      }
    }

    let completed = 0;
    for (let i = 0; i < ticket_types?.length; i++) {
      const new_ticket_type = new mongo_db.TicketTypes({
        event_id: `${ticket_types[i].event_id}`,
        ticket_type: ticket_types[i].ticket_type,
        ticket_price: ticket_types[i].ticket_price,
      });

      await new_ticket_type.save();

      completed++;

      if (completed == ticket_types?.length) {
        return res.send({
          status: "SUCCESS",
          message: "All ticket types created",
        });
      }
    }
  } catch (err) {
    return res.send({ status: "FAILURE", message: "Unknown error" });
  }
};

// Update event by ID
function updateEventQuery(field, value, event_id) {
  Model.connection.query(
    "UPDATE events SET ?? = ? WHERE event_id = ?",
    [field, value, event_id],
    function (err, results) {
      if (err) throw err;
    }
  );
}

// Update event by ID
function updateEvent(req, res) {
  const id = req.body.id;
  const event = req.body;
  Model.connection.query(
    "UPDATE events SET ? WHERE event_id = ?",
    [event, id],
    function (error, results) {
      if (error) {
        res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

// Delete event by ID
function deleteEvent(req, res) {
  const id = req.body.id;
  Model.connection.query(
    "DELETE FROM events WHERE event_id = ?",
    id,
    function (error, results) {
      if (error) {
        res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

function getHostEvents(req, res) {
  const username = req.decoded["username"];
  getEvent_querys("host_username", username, (error, results) => {
    if (error) {
      res.send({ status: "FAILURE", message: "Unkown error" });
    } else {
      res.send({ status: "SUCCESS", result: results });
    }
  });
}

function getEvent_querys(fieldOne, valueOne, callback) {
  const query = mysql.format("SELECT * FROM events WHERE ?? = ?", [
    fieldOne,
    valueOne,
  ]);
  Model.connection.query(query, function (error, results) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, results);
    }
  });
}

module.exports = {
  getAllEvents: getAllEvents,
  getEventById: getEventById,
  getHostEvents: getHostEvents,
  addEvent: addEvent,
  Update_like_count: Update_like_count,
  updateEvent: updateEvent,
  deleteEvent: deleteEvent,
  uploadImage: uploadevent_image,
  uploadVideo: uploadevent_video,
  getAllFeaturedEvents: getAllFeaturedEvents,
  getAllNonFeaturedEvents: getAllNonFeaturedEvents,
  setTicketTypesEndpoint: setTicketTypesEndpoint,
  getTicketTypesEndpoint: getTicketTypesEndpoint,
};
