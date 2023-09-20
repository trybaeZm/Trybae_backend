// all routes to handle payments
const express = require("express");
const { requestPayment } = require("../controllers/payment.controller");
const axios = require("axios");
const xml2js = require("xml2js");
const router = express.Router();

router.post("/example");

// request payment
router.post("/request", requestPayment);

// redirect url
router.post("/redirect", (req, res) => {
  console.log("Redirect url hit", req.body);
  return res.send({ status: "SUCCESS", data: "Payment successful" });
});

// callback url
router.post("/callback", (req, res) => {
  console.log("Callback url hit", req.body);
  return res.send({ status: "SUCCESS", data: "Payment successful" });
});
module.exports = router;
