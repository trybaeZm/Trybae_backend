const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const security = require('./middleware/Security')

require("dotenv").config();
const app = express();
const limiter = rateLimit({
	windowMs: 3 * 60 * 1000, // 20 minutes
	max: 100, // Limit each IP to 300 requests
	message: { message: "Too many requests, please try again later" },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(express.json());
app.use(security.securityMiddleware)
app.use(
	cors({
		origin: "*"
	}),
);
app.set("trust proxy", 1); // to trust loadbalancers like nginx so that, that ip doesn`t get limited.

const userauthRouter = require("./routers/userauth_router");
const hostauthRouter = require("./routers/hostauth_router");
const adminauthRouter = require('./routers/adminauth_router');
const ticketRouter = require("./routers/ticket_router");
const eventRouter = require("./routers/events_router");
const storyRouter = require("./routers/story_posts_router");
const userInterestRouter = require("./routers/user_interest_router");
const followerRouter = require("./routers/followers");
const transactionRouter = require("./routers/transactions")
const searchRouter = require('./routers/search_router');
const fetchProfileRouter = require('./routers/fetchprofile_router')
const cinemaRouter = require('./routers/cinema_router')

app.use("/userauth", limiter,  userauthRouter);
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

// Test
app.get("/appcheck",  (req, res) => {
	res.send("running");
});

app.listen(process.env.PORT || 4455, () => {
	console.log("Server listening on port", process.env.PORT || 4455);
});
