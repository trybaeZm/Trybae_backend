// controllers/couponController.js

const { Coupon } = require("../models/mongo_db");

// Controller to add a new coupon
const addCoupon = async (req, res) => {
  try {
    // validate for required fields
    const {
      coupon_code,
      discount_percentage,
      expiration_date,
      usage_limit,
      resource_id,
      coupon_for,
    } = req.body;

    if (
      !coupon_code ||
      !discount_percentage ||
      !expiration_date ||
      !usage_limit ||
      !resource_id
    ) {
      return res
        .status(400)
        .json({ error: "Please provide all required fields" });
    }

    // validate for unique coupon code, make sure its case insensitive
    const coupon = await Coupon.findOne({
      coupon_code: { $regex: new RegExp(coupon_code, "i") },
    });

    if (coupon) {
      return res.status(400).json({
        error: `Coupon code '${coupon_code}' already exists, please try another`,
      });
    }

    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.json(newCoupon);
  } catch (error) {
    console.log(error, "error");
    res.status(500).json({ error: "Failed to add coupon" });
  }
};

// Controller to edit an existing coupon
const editCoupon = async (req, res) => {
  try {
    const { couponCode } = req.params;
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { coupon_code: couponCode },
      req.body,
      {
        new: true,
      }
    );
    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ error: "Failed to edit coupon" });
  }
};

// Controller to view details of a specific coupon
const viewCoupon = async (req, res) => {
  try {
    const { couponCode } = req.params;

    // check if coupon exists

    const couponExist = await Coupon.findOne({ coupon_code: couponCode });

    if (!couponExist) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    const coupon = await Coupon.findOne({ coupon_code: couponCode });
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve coupon details" });
  }
};

// Controller to delete a specific coupon
const deleteCoupon = async (req, res) => {
  try {
    const { couponCode } = req.params;

    // check if coupon exists
    const coupon = await Coupon.findOne({ coupon_code: couponCode });
    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    await Coupon.findOneAndDelete({ coupon_code: couponCode });
    res.json({ message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

// Controller to list all available coupons for a specific resource
const listCouponsForResource = async (req, res) => {
  try {
    const { resourceType } = req.params;
    const coupons = await Coupon.find({ coupon_for: resourceType });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve coupons" });
  }
};

module.exports = {
  addCoupon,
  editCoupon,
  viewCoupon,
  deleteCoupon,
  listCouponsForResource,
};
