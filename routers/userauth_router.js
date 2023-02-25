const express = require("express");
const authController = require("../controllers/user_auth");
const middleware = require('../middleware/authtoken')

const router = express.Router();

router.post("/confirmjwt", middleware.confirmJWT);

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/refresh", authController.refresh);
router.post("/verifyotp", authController.verifyOTP);
router.post("/resendotp", authController.resend_OTP);
router.post("/uploadprofilepic", middleware.verifyJWT, authController.upload_profile_pic);
router.post("/getuserdata", middleware.verifyJWT, authController.getuserData);
router.patch("/resetpassword", authController.reset_Password);
router.delete("/deleteaccount", middleware.verifyJWT, authController.deleteAccount);
router.post('/uploadsociallinks', middleware.verifyJWT, authController.uploadSociallinks);
router.delete('/deletelinks', middleware.verifyJWT, authController.deleteSocialLinks);
router.post("/getsociallinks",middleware.verifyJWT,authController.getsociallinks);
router.patch('/changepassword', middleware.verifyJWT, authController.change_password);
router.patch('/editprofile', middleware.verifyJWT, authController.edit_profile);
router.patch('/changeviewsettings', middleware.verifyJWT, authController.change_to_private_profile)
router.patch('/notificationset', middleware.verifyJWT, authController.update_push_token)
router.delete(
	"/deleteprofilepic",
	middleware.verifyJWT,
	authController.delete_profile_pic,
);

module.exports = router;
