const express = require("express");
const middleware = require("../middleware/authtoken")
const userInterestController = require("../controllers/User_interests");
const router = express.Router();


router.post("/setinterests", middleware.verifyJWT, userInterestController.addUserInterest)


module.exports = router;