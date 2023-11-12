const express = require("express");
const couponController = require("../controllers/coupons");
const middleware = require("../middleware/authtoken");

const router = express.Router();

// router.use(middleware.verifyJWT);

router.post("/add", couponController.addCoupon);
router.put("/edit/:couponCode", couponController.editCoupon);
router.get("/view/:couponCode", couponController.viewCoupon);
router.delete("/delete/:couponCode", couponController.deleteCoupon);
router.get("/list/:resourceId", couponController.listCouponsForResource);

module.exports = router;
