const express = require("express");
const middleware = require("../middleware/authtoken");
const fetchProfileController = require("../controllers/fetchprofile");
const router = express.Router();


router.post('/fetchprofile', middleware.verifyJWT, fetchProfileController.getProfile)
router.post('/fetchtickets', middleware.verifyJWT, fetchProfileController.getTickets)

module.exports = router