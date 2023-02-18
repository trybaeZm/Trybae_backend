const express = require("express");
const followerController = require('../controllers/followers')
const middleware = require("../middleware/authtoken");

const router = express.Router();

router.patch("/follow", middleware.verifyJWT, followerController.follow)
router.patch("/unfollow", middleware.verifyJWT, followerController.unfollow);
router.post("/getfollowers", middleware.verifyJWT, followerController.getFollowers);
router.post("/getfollowing", middleware.verifyJWT, followerController.getFollowing);


module.exports = router;
