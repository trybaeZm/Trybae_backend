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
    const { resourceId } = req.params;

    const coupons = await Coupon.find({ resource_id: resourceId });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve coupons" });
  }
};

const validateCoupon = async (req, res) => {
  console.log(req.body, "body");
  try {
    const { coupon_code, resource_id: resource_idIfNumberOrString } = req.body;
    let resource_id;
    // if resource id a number, convert to string
    if (typeof resource_idIfNumberOrString === "number") {
      resource_id = resource_idIfNumberOrString.toString();
      console.log("made a string");
    } else {
      resource_id = resource_idIfNumberOrString;
      console.log("already a string");
    }

    // Check if the coupon exists
    const coupon = await Coupon.findOne({ coupon_code });

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    }

    // Check if the coupon is still active
    if (coupon.expiration_date < new Date()) {
      return res.status(400).json({ error: "Coupon has expired" });
    }

    console.log(
      typeof coupon.resource_id,
      typeof resource_id,
      "resource_id <<<<<<<<"
    );
    // Check if the coupon is for the correct resource
    if (coupon.resource_id !== resource_id) {
      return res
        .status(400)
        .json({ error: "Coupon is not valid for this resource" });
    }

    // Check if the coupon can still be used
    if (coupon.usage_count >= coupon.usage_limit) {
      return res
        .status(400)
        .json({ error: "Coupon usage limit has been reached" });
    }

    // If all checks pass, the coupon is valid
    res.json({ message: "Coupon is valid", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  addCoupon,
  editCoupon,
  viewCoupon,
  deleteCoupon,
  listCouponsForResource,
  validateCoupon,
};
