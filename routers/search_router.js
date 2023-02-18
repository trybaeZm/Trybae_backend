const express = require("express");
const searchController = require('../controllers/Search')
const middleware = require("../middleware/authtoken");

const router = express.Router();

router.use(middleware.verifyJWT);

router.post("/fullsearch", searchController.Full_search)


module.exports = router;