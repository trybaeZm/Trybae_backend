const express = require("express");
const eventController = require("../controllers/events");
const middleware = require("../middleware/authtoken");

const router = express.Router();

router.use(middleware.verifyJWT);

router.get("/getallEvents", eventController.getAllEvents);
router.get("/getallnonfeaturedevents", eventController.getAllNonFeaturedEvents);
router.get("/getallFeaturedEvents", eventController.getAllFeaturedEvents);
router.get("/geteventbyid/:id", eventController.getEventById);
router.post("/newevent", eventController.addEvent);
router.post("/uploadeventimage", eventController.uploadImage);
router.post("/uploadeventvideo", eventController.uploadVideo);
router.patch("/updatelikecount", eventController.Update_like_count);
router.patch("/settickettypes", eventController.setTicketTypesEndpoint);
router.post("/gettickettypes", eventController.getTicketTypesEndpoint);
router.get("/getHostEvents", eventController.getHostEvents);

module.exports = router;
