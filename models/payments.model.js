// create payments model using mongoose
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  event_id: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  payment_status: {
    type: String,
    required: true,
  },
  payment_date: {
    type: Date,
    required: true,
  },
  transaction_id: {
    type: String,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
});

const Payments = mongoose.model("Payments", paymentSchema);

module.exports = Payments;
