const express = require("express");
const txnController = require("../controllers/transactions");
const middleware = require("../middleware/authtoken");
const router = express.Router();


router.get("/verifytxn", txnController.verify_transaction)


module.exports = router