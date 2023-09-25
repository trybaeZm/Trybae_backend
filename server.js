const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const security = require("./middleware/Security");
const morgan = require("morgan");
const socketIo = require("socket.io");

require("dotenv").config();
const app = express();

// Socket.io
const server = require("http").createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "*",
  },
});

app.io = io;

io.on("connection", (socket) => {
  console.log("New client connected");

  // When the payment is done, emit an event to the client
  socket.on("paymentDone", () => {
    io.sockets.emit("paymentUpdate", { done: true });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
const limiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 3 minutes
  max: 150, // Limit each IP to 150 requests
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.set("view engine", "pug");
app.use(express.json());
app.use(security.securityMiddleware);
app.use(
  cors({
    origin: "*",
  })
);

app.set("trust proxy", 1); // to trust loadbalancers like nginx so that, that ip doesn`t get limited.
app.use(morgan("dev"));
const userauthRouter = require("./routers/userauth_router");
const hostauthRouter = require("./routers/hostauth_router");
const adminauthRouter = require("./routers/adminauth_router");
const ticketRouter = require("./routers/ticket_router");
const eventRouter = require("./routers/events_router");
const storyRouter = require("./routers/story_posts_router");
const userInterestRouter = require("./routers/user_interest_router");
const followerRouter = require("./routers/followers");
const transactionRouter = require("./routers/transactions");
const searchRouter = require("./routers/search_router");
const fetchProfileRouter = require("./routers/fetchprofile_router");
const cinemaRouter = require("./routers/cinema_router");
const paymentRouter = require("./routers/payment.routes");

app.use("/userauth", limiter, userauthRouter);
app.use("/hostauth", limiter, hostauthRouter);
app.use("/tickets", limiter, ticketRouter);
app.use("/events", limiter, eventRouter);
app.use("/stories", limiter, storyRouter);
app.use("/userinterests", limiter, userInterestRouter);
app.use("/followers", limiter, followerRouter);
app.use("/transactions", limiter, transactionRouter);
app.use("/search", limiter, searchRouter);
app.use("/tbadmins", limiter, adminauthRouter);
app.use("/profiles", limiter, fetchProfileRouter);
app.use("/cinemas", limiter, cinemaRouter);
app.use("/payments", limiter, paymentRouter);

// Test
app.get("/appcheck", limiter, (req, res) => {
  return res.send(
    `<body style='background-color: #000'><h1 style='color: white'>All services running ✅</h1></body>`
  );
});

app.get("/test-payment", (req, res) => {
  io.sockets.emit("paymentUpdate", { done: true });
  return res.send("Done");
});

app.get("/apiversion", limiter, (req, res) => {
  return res.send({
    status: "SUCCESS",
    data: process.env.API_VERSION || "v.1.0.0",
  });
});

server.listen(process.env.PORT || 4455, () => {
  console.log("Server listening on port", process.env.PORT || 4455);
  console.log("Server running in " + process.env.MODE + " Mode");
});
