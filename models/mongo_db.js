const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const uri =
  process.env.MODE == "TEST"
    ? process.env.MONGO_DB_CONNECT_TEST
    : process.env.MONGO_DB_CONNECT_PROD;

mongoose.connect(uri, (err) => {
  if (!err) console.log("Connection to mongo DB Successful! ✅");
  else {
    console.log("Error connecting to mongo DB ❌", err);
  }
});

// define a schema for coupons
const couponSchema = new mongoose.Schema({
  coupon_code: {
    type: String,
    required: true,
    unique: true,
  },
  discount_percentage: {
    type: Number,
    required: true,
  },
  expiration_date: {
    type: Date,
    required: true,
  },
  usage_limit: {
    type: Number,
    required: true,
  },
  resource_id: {
    type: String,
    required: true,
  },

  usage_count: {
    type: Number,
    default: 0,
  },
});

const UserEmailOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const UserPhoneOTPVerficationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const HostEmailOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const HostPhoneOTPVerficationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const HostRefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
});

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
});

// host can follow host, host can follow user, user can follow host, user can follow user //
const followersSchema = new mongoose.Schema({
  follower_id: {
    type: String,
    required: true,
  },
  following_id: {
    type: String,
    required: true,
  },
  follower_type: {
    type: String,
    required: true,
    enum: ["user", "host"],
  },
  following_type: {
    type: String,
    required: true,
    enum: ["user", "host"],
  },
});

const eventLikesSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
  },
  likers: {
    type: Array,
  },
});

const transactionSchema = new mongoose.Schema({
  transaction_ref: {
    type: String,
  },
  txn_id: {
    type: String,
  },
  transation_status: {
    type: String,
    default: "pending_verfication",
  },
  method_used: {
    type: String,
    default: "mobilemoneyzm",
  },
  transaction_amount: {
    type: Number,
  },
  transaction_fee: {
    type: Number,
    default: 0,
  },
  transactionDate_and_time: {
    type: Date,
  },
  seatsChosen: {
    type: Array,
  },
});

const TicketTypesSchema = new mongoose.Schema({
  event_id: {
    type: String,
    required: true,
  },
  ticket_type: {
    type: String,
  },
  ticket_price: {
    type: Number,
  },
});

const Host_Social_Links_Schema = new mongoose.Schema({
  host_id: {
    type: String,
    required: true,
  },
  social_link: {
    type: String,
  },
  app_name: {
    type: String,
  },
});

const User_Social_Links_Schema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  social_link: {
    type: String,
  },
  app_name: {
    type: String,
  },
});

const ticketSchema = new mongoose.Schema({
  ticket_owner: { type: String, required: true },
  ticket_description: { type: String },
  show_under_participants: { type: Boolean, required: true, default: true },
  event_id: { type: Number, required: true },
  date_of_purchase: { type: String, required: true },
  time_of_purchase: { type: String, required: true },
  ticket_type: { type: String, required: true, default: "normal" },
  redeemed: { type: Boolean, required: true, default: false },
  qty: { type: Number, default: 1 },
  tx_ref: { type: String },
  seatsChosen: { type: Array },
  is_cinema_ticket: { type: Boolean, default: false },
  cinema_time: { type: String },
  cinema_date: { type: String },
});

const trybae_admin_Schema = new mongoose.Schema({
  admin_username: {
    type: String,
    required: true,
  },
  admin_password: {
    type: String,
    required: true,
  },
  admin_email: {
    type: String,
    required: true,
  },
  profile_pic_url: {
    type: String,
  },
  admin_phone: {
    type: String,
    required: true,
  },
  admin_position: {
    type: String,
    required: true,
  },
});

const AdminRefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  expires: { type: Date, required: true },
});

const CinemaSchema = new mongoose.Schema({
  cinema_id: String,
  cinema_name: String,
  cinema_seats: {
    type: Array,
  },
});

const CinemaTimeSchema = new mongoose.Schema({
  cinema_id: String,
  event_id: String,
  cinema_date: String,
  cinema_times: {
    type: Array,
  },
});

const AdminEmailOTPVerificationSchema = new mongoose.Schema({
  userId: String,
  otp: String,
  createdAt: Date,
  expiresAt: Date,
});

const newTicketPurchaseSchema = new mongoose.Schema({
  userId: String,
  event_id: String,
});

const paymentSchema = new mongoose.Schema({
  transactionToken: {
    type: String,
    required: true,
    unique: true,
  },

  transactionAmount: {
    type: Number,
    required: true,
  },

  transactionDateAndTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  transactionFee: {
    type: Number,
  },
  transactionStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  eventId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
});

const Tickets = mongoose.model("Ticket", ticketSchema);

const Followers = mongoose.model("Followers", followersSchema);

const eventLikes = mongoose.model("eventLikes", eventLikesSchema);

const HostRefreshToken = mongoose.model(
  "HostRefreshTokens",
  HostRefreshTokenSchema
);

const RefreshToken = mongoose.model("RefreshTokens", RefreshTokenSchema);

const UserEmailOTPVerification = mongoose.model(
  "UserEmailOTPVerifications",
  UserEmailOTPVerificationSchema
);

const UserPhoneOTPVerfication = mongoose.model(
  "UserPhoneOTPVerfications",
  UserPhoneOTPVerficationSchema
);

const HostEmailOTPVerification = mongoose.model(
  "HostEmailOTPVerifications",
  HostEmailOTPVerificationSchema
);

const HostPhoneOTPVerfication = mongoose.model(
  "HostPhoneOTPVerfications",
  HostPhoneOTPVerficationSchema
);

const Transactions = mongoose.model("Transactions", transactionSchema);

const TicketTypes = mongoose.model("TicketTypes", TicketTypesSchema);

const User_Social_Links = mongoose.model(
  "User_Social_Links",
  User_Social_Links_Schema
);

const Host_Social_Links = mongoose.model(
  "Host_Social_Links",
  Host_Social_Links_Schema
);

const trybae_admins = mongoose.model("trybae_admins", trybae_admin_Schema);

const AdminEmailOTPVerification = mongoose.model(
  "AdminEmailOTPVerifications",
  AdminEmailOTPVerificationSchema
);

const AdminRefreshToken = mongoose.model(
  "AdminRefreshToken",
  AdminRefreshTokenSchema
);

const Cinemas = mongoose.model("Cinemas", CinemaSchema);

const CinemaTimes = mongoose.model("CinemaTimes", CinemaTimeSchema);

const newTicketPurchase = mongoose.model(
  "newTicketPurchase",
  newTicketPurchaseSchema
);

const payments = mongoose.model("paymentsTable", paymentSchema);
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = {
  UserEmailOTPVerification,
  UserPhoneOTPVerfication,
  HostEmailOTPVerification,
  HostPhoneOTPVerfication,
  RefreshToken,
  HostRefreshToken,
  Followers,
  eventLikes,
  Transactions,
  TicketTypes,
  Tickets,
  User_Social_Links,
  Host_Social_Links,
  trybae_admins,
  AdminRefreshToken,
  AdminEmailOTPVerification,
  Cinemas,
  CinemaTimes,
  newTicketPurchase,
  payments,
  Coupon,
};
