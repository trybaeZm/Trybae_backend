const Model = require("../models/TryBae_db");
const { createMulter } = require("../middleware/multer-upload");

function getAllStoryPosts(req, res) {
  Model.connection.query(
    `SELECT sp.*, h.profile_pic_url
		FROM story_posts sp
		JOIN hosts h ON sp.username = h.host_username;`,
    function (error, results) {
      if (error) {
        console.log(error.message, "error");
        res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

// Select story post by ID
function getStoryPostById(req, res) {
  const id = req.body.id;
  Model.connection.query(
    "SELECT * FROM story_posts WHERE story_id = ?",
    id,
    function (error, results) {
      if (error) {
        res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

// Select story posts by username
function getStoryPostsByUsername(req, res) {
  const username = req.body.username;
  Model.connection.query(
    "SELECT * FROM story_posts WHERE username = ?",
    username,
    function (error, results) {
      if (error) {
        res.send({ status: "FAILURE", message: "Unknown error" });
      } else {
        res.send({ status: "SUCCESS", results: results });
      }
    }
  );
}

function uploadstory(req, res) {
  if (req.decoded.privs !== "admin" && req.decoded.privs !== "host") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const upload = createMulter(
    "public-read",
    "Stories/images",
    "story_image",
    "jpg"
  );
  try {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.log(err);
        return res.send({
          status: "FAILURE",
          message: "Disallowed file type",
        });
      }
      if (req.file) {
        let time = new Date();
        const body = {
          image_url: req.file.location,
          description: req.body.description,
          title: req.body.title,
          username: req.body.username,
          date: new Date().toISOString().slice(0, 10),
          time:
            ("0" + time.getHours()).slice(-2) +
            ":" +
            ("0" + time.getMinutes()).slice(-2) +
            ":" +
            ("0" + time.getSeconds()).slice(-2),
          view_count: 0,
        };
        try {
          addStoryPost(body);
        } catch (err) {
          return res.send({
            status: "FAILURE",
            message: "service down or busy or unknown error, try later",
          });
        }

        return res.send({ status: "SUCCESS", imageURL: req.file.location });
      } else {
        return res.send({
          status: "FAILURE",
          message: "No image provided in the request",
        });
      }
    });
  } catch (err) {
    // Handle the error and return a response
    return res.send({
      status: "FAILURE",
      message: "service down or busy or unknown error, try later",
    });
  }
}

// Add new story post
function addStoryPost(post) {
  Model.connection.query(
    "INSERT INTO story_posts SET ?",
    post,
    function (error, results) {
      if (error) {
        res.send({ status: "FAILURE", message: "Unknown error" });
      }
      console.log("added new story post!");
    }
  );
}

// Update story post by ID
function updateStoryPostViews(req, res) {
  let id;

  if (req.body.id == undefined) {
    res.send({ status: "FAILURE", message: "please provide post id" });
  } else {
    id = req.body.id;
  }

  try {
    Model.connection.query(
      "UPDATE story_posts SET view_count = view_count + 1 WHERE story_id = ?",
      [id],
      function (error, results) {
        if (error) return res.send({ status: "FAILURE" });
        res.send({ status: "SUCCESS" });
      }
    );
  } catch (error) {
    return res.send({ status: "FAILURE", message: `Unknown error` });
  }
}

// Delete story post by ID
function deleteStoryPost(req, res) {
  if (req.decoded.privs !== "admin") {
    return res.send({ status: "FAILURE", message: "insufficient priveleges" });
  }

  const { id } = req.body;
  if (id != undefined) {
    Model.connection.query(
      "SELECT * FROM story_posts WHERE story_id = ?",
      id,
      function (error, results) {
        if (error) {
          res.send({ status: "FAILURE", message: "Unknown error" });
        }
        if (results) {
          if (results[0].username != req.decoded.username) {
            res.send({
              status: "FAILURE",
              message: "this story post is not yours",
            });
          } else {
            Model.connection.query(
              "DELETE FROM story_posts WHERE story_id = ?",
              id,
              function (error, results) {
                if (error) {
                  res.send({ status: "FAILURE", message: "Unknown error" });
                } else {
                  res.send({
                    status: "SUCCESS",
                    message: "Deleted",
                  });
                }
              }
            );
          }
        }
      }
    );
  } else {
    res.send({ status: "FAILURE", message: "provide story id" });
  }
}

module.exports = {
  getAllStoryPosts: getAllStoryPosts,
  getStoryPostById: getStoryPostById,
  getStoryPostsByUsername: getStoryPostsByUsername,
  uploadstory: uploadstory,
  updateStoryPostViews: updateStoryPostViews,
  deleteStoryPost: deleteStoryPost,
};
