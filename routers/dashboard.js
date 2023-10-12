const express = require("express");
const dashboardController = require("../controllers/dashboard");
const middleware = require("../middleware/authtoken");

const router = express.Router();

router.use(middleware.verifyJWT);

router.post("/total", dashboardController.getTotal)
router.post("/sales", dashboardController.getAllSales)
router.post("/revenue", dashboardController.getAllRevenue)
router.post("/topCustomer", dashboardController.getTopCustomer)
router.get("/requestFunds", dashboardController.requestFunds)
router.get("/export", dashboardController.getCSV)

module.exports = router