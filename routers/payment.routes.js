// all routes to handle payments
const express = require("express");
const {
  requestPayment,
  checkPayment,
  fromPaymentRedirect,
} = require("../controllers/payment.controller");
const axios = require("axios");
const xml2js = require("xml2js");
const router = express.Router();
const Model = require("../models/mongo_db");
const middleware = require("../middleware/authtoken");
router.post("/example");

// request payment
router.post("/request", requestPayment);

// redirect url
router.get("/redirect", fromPaymentRedirect);

// callback url
router.post("/callback", (req, res) => {
  console.log("Callback url hit", req.body);
  return res.send({ status: "SUCCESS", data: "Payment successful" });
});

//check payment for current user and event
router.get("/checkpayment/:ticket_id", middleware.verifyJWT, checkPayment);

router.get("/test-socket", async (req, res) => {
  try {
    const io = req.app.io;

    io.sockets.emit("paymentUpdate", { done: true });
    return res.send("Done");
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
});
module.exports = router;
