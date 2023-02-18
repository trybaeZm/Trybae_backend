const express = require("express");
const middleware = require("../middleware/authtoken");
const hostauth_controller = require("../controllers/host_auth");
const router = express.Router();

router.post("/login", hostauth_controller.login);
router.post("/signup", hostauth_controller.signup);
router.post("/refresh", hostauth_controller.refresh);
router.post("/verifyotp", hostauth_controller.verifyOTP);
router.post("/resendotp", hostauth_controller.resend_OTP);
router.post("/uploadprofilepic", middleware.verifyJWT, hostauth_controller.upload_profile_pic);
router.delete("/deleteaccount", middleware.verifyJWT, hostauth_controller.deleteAccount)
router.patch("/resetpassword", hostauth_controller.reset_Password)
router.post("/gethostdata", middleware.verifyJWT, hostauth_controller.gethostData);
router.post('/uploadsociallinks', middleware.verifyJWT, hostauth_controller.uploadSociallinks);

module.exports = router;
