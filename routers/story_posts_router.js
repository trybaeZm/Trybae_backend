const express = require("express");
const middleware = require("../middleware/authtoken");
const story_postController = require('../controllers/story_posts')
const router = express.Router();

router.use(middleware.verifyJWT);

router.post('/all', story_postController.getAllStoryPosts)
router.post("/uploadstory", story_postController.uploadstory)
router.patch("/updateviewcount", story_postController.updateStoryPostViews);
router.delete("/deletestory", story_postController.deleteStoryPost);


module.exports = router;
