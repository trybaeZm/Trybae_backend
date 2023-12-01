const express = require("express");
const cinemaController = require("../controllers/cinemas");
const middleware = require("../middleware/authtoken");

const router = express.Router();

// router.use(middleware.verifyJWT);

router.post('/insertstatic', cinemaController.insert_static)
router.post('/getcinema', cinemaController.get_cinema)
router.post('/newcinema', cinemaController.insert_cinema)
router.post('/getseats', cinemaController.get_seats_for_event)
router.post('/insertcinematimesanddays', cinemaController.insert_cinema_times_and_dates)
router.post("/getcinematimesanddates", cinemaController.get_cinema_times_and_dates);

module.exports = router
