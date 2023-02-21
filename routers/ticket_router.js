const express = require("express");
const ticketController = require("../controllers/tickets");
const middleware = require("../middleware/authtoken");
const router = express.Router();

router.post(
	"/getallusertickets",
	middleware.verifyJWT,
	ticketController.get_all_user_tickets,
);
router.post(
	"/getuserticketbyid",
	middleware.verifyJWT,
	ticketController.get_ticket_by_id,
);
router.post("/buyticket", middleware.verifyJWT, ticketController.buy_ticket);
router.delete(
	"/deleteticket",
	middleware.verifyJWT,
	ticketController.delete_ticket_by_id,
);
router.get(
	"/verifyticket",
	ticketController.verify_ticket,
);
router.post(
	"/getparticipants",
	middleware.verifyJWT,
	ticketController.get_participants,
);
router.patch(
	"/transferticket",
	middleware.verifyJWT,
	ticketController.transfer_ticket,
);

router.post('/gettransfers', middleware.verifyJWT, ticketController.get_transfer_logs)
router.post(
	"/buycinematicket",
	middleware.verifyJWT,
	ticketController.buy_cinema_ticket,
);

router.post(
	"/redeemticket",
	middleware.verifyJWT,
	ticketController.redeem_ticket,
);

router.patch('/bulktransfer', middleware.verifyJWT, ticketController.bulk_transfer)

module.exports = router;
