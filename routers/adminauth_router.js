const express = require("express");
const middleware = require("../middleware/authtoken");
const adminAuthController = require("../controllers/admins");
const router = express.Router();

router.post("/login", adminAuthController.login);
router.post("/signup", adminAuthController.signup);
router.post("/verifyotp", adminAuthController.verifyOTP);
router.post("/resendotp", adminAuthController.resend_OTP);
router.post("/refresh", adminAuthController.refresh);

module.exports = router;
