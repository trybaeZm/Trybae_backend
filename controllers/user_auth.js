const Model = require("../models/TryBae_db");
const middleware = require("../middleware/authtoken");
const mongodb = require("../models/mongo_db");
const BAN_CONTROLLER = require("./Banned_users");
const nodemailer = require("nodemailer");
const { createMulter } = require("../middleware/multer-upload");
const bcrypt = require("bcrypt");
const { Expo } = require("expo-server-sdk");

require("dotenv").config();

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const SALT_ROUNDS = 10;

const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const createUser = (
  fullname,
  username,
  email,
  password,
  phone,
  DOB,
  location = null,
  Expo_push_token = null,
  cb
) => {
  bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
    if (err) {
      return cb(err);
    }
    const query = `INSERT INTO users (username, fullname, DOB, age, email, password, phone, location, Expo_push_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    Model.connection.query(
      query,
      [
        username,
        fullname,
        DOB,
        calculateAge(DOB),
        email,
        hashedPassword,
        phone,
        JSON.stringify(location),
        Expo_push_token,
      ],
      (error, results) => {
        if (error) {
          console.log(new Date());
          return cb(error);
        }
        cb(null, results);
      }
    );
  });
};

const getuserData = (req, res) => {
  const username = req.decoded["username"];

  // ALL fields except password...
  const query = `SELECT username, fullname, DOB, email, age, phone, location, profile_pic_url, follower_count, 
	email_verified, phone_verified, private_profile FROM users WHERE username = ?`;

  Model.connection.query(query, [username], (error, results) => {
    if (error) {
      return res.send({ error: error });
    }
    if (results) {
      return res.send({ user: results[0] });
    } else {
      return res.send({ error: "no user found" });
    }
  });
};

const getUserByEmail = (email, cb) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  Model.connection.query(query, [email], (error, results) => {
    if (error) {
      return cb(error);
    }
    cb(null, results[0]);
  });
};

const getUserByUsername = (username, cb) => {
  const query = `SELECT * FROM users WHERE username = ?`;
  Model.connection.query(query, [username], (error, results) => {
    if (error) {
      return cb(error);
    }
    cb(null, results[0]);
  });
};

const update_push_token = (req, res) => {
  const username = req.decoded["username"];

  const { Expo_push_token } = req.body;

  const query = `UPDATE users SET Expo_push_token = ? WHERE username = ?`;

  try {
    Model.connection.query(
      query,
      [Expo_push_token, username],
      (err, result) => {
        if (!err && result) {
          return res.send({
            status: "SUCCESS",
            message: "Success",
          });
        } else {
          return res.send({
            status: "FAILURE",
            message: "Unknown error occured",
          });
        }
      }
    );
  } catch (error) {
    res.json({
      status: "FAILED",
      message: "Unknown error, try later.",
    });
  }
};

const change_to_private_profile = (req, res) => {
  const username = req.decoded["username"];

  const { option } = req.body;

  const query = `UPDATE users SET private_profile = ? WHERE username = ?`;

  try {
    Model.connection.query(query, [option, username], (err, result) => {
      if (!err && result) {
        return res.send({
          status: "SUCCESS",
          message: "Profile viewing settings updated",
        });
      } else {
        return res.send({
          status: "FAILURE",
          message: "Unknown error occured",
        });
      }
    });
  } catch (error) {
    res.json({
      status: "FAILED",
      message: "Unknown error, try later.",
    });
  }
};

const login = (req, res) => {
  console.log(req.body, "check for body");
  const { login, password, type, appkey, Expo_push_token = null } = req.body;

  if (appkey != process.env.APP_KEY) {
    return res.send({
      status: "FAILURE",
      message: "Could not verify integrity of application...",
    });
  }

  if (!login || !password || !type) {
    return res.send({
      status: "FAILURE",
      message: "One or more fields missing",
    });
  }

  if (type == "username") {
    getUserByUsername(login, (err, user) => {
      if (err) {
        return res.send({ message: "Error getting user", auth: false });
      }
      if (!user) {
        return res.send({ message: "User not found", auth: false });
      }

      if (user) {
        BAN_CONTROLLER.getBannedUserByUsername(
          user.username,
          function (results) {
            if (results.length <= 0) {
              bcrypt.compare(password, user.password, (error, result) => {
                if (result && !error) {
                  const refreshToken = middleware.generateRefreshToken(
                    user.username
                  );

                  if (refreshToken == false) {
                    return res.send({
                      message: "Error creating token!",
                      auth: false,
                    });
                  }

                  if (Expo_push_token !== null) {
                    if (Expo.isExpoPushToken(Expo_push_token)) {
                      updateUserQuery(
                        "Expo_push_token",
                        Expo_push_token,
                        user.username
                      );
                    }
                  }

                  return res.send({
                    token: middleware.createJWTtoken(user.username),
                    refreshToken: refreshToken,
                    account_status: user.email_verified,
                    username: user.username,
                    phone_number: user.phone,
                  });
                } else {
                  return res.send({
                    status: "FAILURE",
                    message: "Incorrect password",
                    auth: false,
                  });
                }
              });
            } else {
              return res.send({
                message: "This user is banned...",
                ispermanent: results[0].permanent == 0 ? false : true,
                ban_period_in_days: results[0].ban_period_in_days,
              });
            }
          }
        );
      }
    });
  } else {
    //console.log(email, password)
    getUserByEmail(login, (err, user) => {
      if (err) {
        return res.send({ message: "Error getting user", auth: false });
      }
      if (!user) {
        return res.send({ message: "User not found", auth: false });
      }
      if (user) {
        BAN_CONTROLLER.getBannedUserByUsername(
          user.username,
          function (results) {
            if (results.length <= 0) {
              bcrypt.compare(password, user.password, (error, result) => {
                if (result && !error) {
                  const refreshToken = middleware.generateRefreshToken(
                    user.username
                  );

                  if (refreshToken == false) {
                    return res.send({
                      message: "Error creating refresh token!",
                      auth: false,
                    });
                  }

                  if (Expo.isExpoPushToken(Expo_push_token)) {
                    updateUserQuery(
                      "Expo_push_token",
                      Expo_push_token,
                      user.username
                    );
                  }

                  console.log("hit");
                  return res.send({
                    token: middleware.createJWTtoken(user.username),
                    refreshToken: refreshToken,
                    account_status: user.email_verified,
                    username: user.username,
                    phone_number: user.phone,
                  });
                } else {
                  return res.send({
                    status: "FAILURE",
                    message: "Incorrect password",
                    auth: false,
                  });
                }
              });
            } else {
              return res.send({
                message: "This user is banned...",
                ispermanent: results[0].permanent == 0 ? false : true,
                ban_period_in_days: results[0].ban_period_in_days,
              });
            }
          }
        );
      }
    });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  const username = req.body.username;

  if (!refreshToken || refreshToken == undefined) {
    return res.send({ message: "No Token Provided!" });
  }
  await middleware.verifyRefreshToken(refreshToken, username, res);
};

const signup = (req, res) => {
  const {
    fullname,
    username,
    email,
    password,
    phone,
    DOB,
    interests,
    location = null,
    Expo_push_token = null,
  } = req.body;

  getUserByEmail(email.toLowerCase(), (err, user) => {
    if (err) {
      return res.send({
        status: "FAILURE",
        message: "Error looking up user",
        code: "101",
      });
    }
    if (!user) {
      getUserByUsername(username.toLowerCase(), (err, user) => {
        if (err) {
          return res.send({
            status: "FAILURE",
            message: "Error looking up user",
            code: "102",
          });
        }
        if (!user) {
          createUser(
            fullname,
            username.toLowerCase(),
            email.toLowerCase(),
            password,
            phone,
            DOB,
            location,
            Expo_push_token,
            (err, result) => {
              if (err) {
                return res.send({
                  status: "FAILURE",
                  message: "Unknown error",
                });
              } else {
                console.log(location);
                sendOTPVerificationEmail(req.body);
                return res.send({
                  status: "SUCCESS",
                  message: "Account created successfully",
                });
              }
            }
          );
        } else {
          return res.send({
            status: "FAILURE",
            message: "Username already exists",
          });
        }
      });
    } else {
      return res.send({ status: "FAILURE", message: "Email already exists" });
    }
  });
};

const upload_profile_pic = (req, res) => {
  const upload = createMulter(
    "public-read",
    "Profile Pics/users",
    "profile_pic_image",
    "jpg"
  );
  try {
    upload.single("image")(req, res, (err) => {
      if (err) {
        console.log(err);
        return res.send({ status: "FAILURE", message: `Disallowed file type` });
      }
      if (req.file && req.decoded["username"]) {
        updateUserQuery(
          "profile_pic_url",
          req.file.location,
          req.decoded["username"]
        );
        return res.send({ status: "SUCCESS", imageURL: req.file.location });
      } else {
        return res.send({
          status: "FAILURE",
          message: "No image or username provided in the request",
        });
      }
    });
  } catch (err) {
    // Handle the error and return a response
    return res.send({ status: "FAILURE", message: `Unknown error` });
  }
};

function updateUserQuery(field, value, username) {
  Model.connection.query(
    "UPDATE users SET ?? = ? WHERE username = ?",
    [field, value, username],
    function (err, results) {
      if (err) throw err;
    }
  );
}

const saveOTP = async (user, otp) => {
  // hash the otp
  const saltRounds = 10;

  const hashedOTP = await bcrypt.hash(otp, saltRounds);

  await mongodb.UserEmailOTPVerification.deleteMany({ userId: user.username }); // Clear previous otps

  const newOTPVerification = mongodb.UserEmailOTPVerification({
    userId: user.username,
    otp: hashedOTP,
    createdAt: Date.now(),
    expiresAt: Date.now() + 200000, // 3 min
  });

  // save otp record
  try {
    await newOTPVerification.save();
    console.log("otp saved");
  } catch {
    console.log("error sending");
  }
};

const sendOTPVerificationEmail = async (user) => {
  //generate otp
  const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

  await saveOTP(user, otp);

  console.log(user, otp, "<<<<<<<");

  const message = {
    from: process.env.EMAIL,
    to: user.email, // CHANGE LATER to user.email
    subject: "Trybae OTP",
    html: `<h3>Hello ${user.username}</h3> <br/> <p>YOUR OTP FOR TRYBAE IS:</p> <br/> <h2><em> ${otp} </em></h2> <br>
		<h3> if you did NOT request this otp, please contact support immediately </h3>`,
  };

  transport.sendMail(message, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Message sent: ${info.messageId}`);
    }
  });
};

const delete_profile_pic = (req, res) => {
  const username = req.decoded["username"];

  if (!username) {
    return res.send({ status: "FAILURE", message: "Missing details" });
  } else {
    const query = `UPDATE users SET profile_pic_url = ? where username = ?`;

    try {
      Model.connection.query(query, [null, username], (err, result) => {
        if (!err && result) {
          return res.send({
            status: "SUCCESS",
            message: "Deleted profile pic successfully",
          });
        } else {
          return res.send({
            status: "FAILURE",
            message: "Unknown error occured",
          });
        }
      });
    } catch (error) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error occured",
      });
    }
  }
};

async function update_verification_status(username, cb) {
  let query = `UPDATE users SET email_verified = TRUE WHERE username = ?`;

  Model.connection.query(query, [username], (error, results) => {
    if (error) {
      console.log(new Date());
      return cb(error);
    }
    cb(null, results);
  });
}

const resend_OTP = async (req, res) => {
  try {
    let { cred, type } = req.body;
    if (!cred || !type) {
      return res.send({
        status: "FAILURE",
        message: "Empty details are not allowed",
      });
    } else {
      if (type == "username") {
        getUserByUsername(cred, async (err, result) => {
          if (result && !err) {
            if (result.username !== cred) {
              return res.send({
                status: "FAILURE",
                message: "email or username mismatch",
              });
            } else {
              await sendOTPVerificationEmail({
                username: cred,
                email: result.email,
              });
              return res.send({
                status: "SUCCESS",
                message: "OTP sent!",
                username: result.username,
              });
            }
          } else {
            return res.send({
              status: "FAILURE",
              message: "No account found with this username",
            });
          }
        });
      } else {
        getUserByEmail(cred, async (err, result) => {
          if (result && !err) {
            if (result.email !== cred) {
              return res.send({
                status: "FAILURE",
                message: "email or username mismatch",
              });
            } else {
              await sendOTPVerificationEmail({
                username: result.username,
                email: cred,
              });
              return res.send({
                status: "SUCCESS",
                message: "OTP sent!",
                username: result.username,
              });
            }
          } else {
            return res.send({
              status: "FAILURE",
              message: "No account found with this email",
            });
          }
        });
      }
    }
  } catch (error) {
    return res.send({
      status: "FAILED",
      message: "Unknown error",
    });
  }
};

const reset_Password = async (req, res) => {
  try {
    let { userId, otp, newpassword } = req.body;
    if (!userId || !otp || !newpassword) {
      return res.send({ status: "FAILED", message: "Empty details!" });
    } else {
      const UserEmailOTPVerificationRecord =
        await mongodb.UserEmailOTPVerification.find({
          userId,
        });
      if (UserEmailOTPVerificationRecord.length <= 0) {
        // no record found
        return res.send({ status: "FAILED", message: "Account doesnt exist" });
      } else {
        // user otp record exists
        const { expiresAt } = UserEmailOTPVerificationRecord[0];
        const hashedOTP = UserEmailOTPVerificationRecord[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          mongodb.UserEmailOTPVerification.deleteMany({ userId });
          return res.send({ status: "FAILED", message: "OTP Code Expired!" });
        } else {
          bcrypt.compare(otp, hashedOTP, (error, result) => {
            if (result && !error) {
              mongodb.UserEmailOTPVerification.deleteMany({ userId });

              bcrypt.hash(newpassword, SALT_ROUNDS, (err, hashedPassword) => {
                if (hashedPassword && !err) {
                  try {
                    updateUserQuery("password", hashedPassword, userId);
                    return res.send({
                      status: "SUCCESS",
                      message: "Password updated successfully.",
                    });
                  } catch (err) {
                    return res.send({
                      status: "FAILED",
                      message: "Unknown error, try later",
                    });
                  }
                }
              });
            } else {
              // supplied otp is wrong
              return res.send({ status: "FAILED", message: "Invalid Code" });
            }
          });
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: "Unknown error, try later.",
    });
  }
};

async function change_password(req, res) {
  const username = req.decoded["username"];

  const { currentpassword, newpassword } = req.body;

  if (!currentpassword || !newpassword) {
    return res.send({ status: "FAILURE", message: "empty fields" });
  } else {
    getUserByUsername(username, (err, result) => {
      if (!err && result) {
        bcrypt.compare(currentpassword, result.password, (err, result) => {
          if (!err && result) {
            bcrypt.hash(newpassword, SALT_ROUNDS, (err, hashedPassword) => {
              if (err) {
                return res.send({
                  status: "FAILURE",
                  message: "Failed to set new password",
                });
              } else {
                updateUserQuery("password", hashedPassword, username);
                return res.send({
                  status: "SUCCESS",
                  message: "new password set successfully",
                });
              }
            });
          } else {
            return res.send({
              status: "FAILURE",
              message: "Invalid current password",
            });
          }
        });
      } else {
        return res.send({ status: "FAILURE", message: "User not found" });
      }
    });
  }
}

async function edit_profile(req, res) {
  const username = req.decoded["username"];
  const { fullname, email, phone, DOB } = req.body;

  if (!fullname || !email || !phone || !DOB) {
    return res.send({ status: "FAILURE", message: "empty fields" });
  } else {
    getUserByUsername(username, (err, result) => {
      if (!err && result) {
        try {
          updateUserQuery("fullname", fullname, username);
          updateUserQuery("email", email, username);
          updateUserQuery("DOB", DOB, username);
          updateUserQuery("phone", phone, username);
          updateUserQuery("email_verified", false, username);
          return res.send({
            status: "SUCCESS",
            message: "All fields updated successfully",
          });
        } catch (error) {
          return res.send({
            status: "SEMI-FAILURE",
            message: "Fields semi updated",
          });
        }
      } else {
        return res.send({ status: "FAILURE", message: "User not found" });
      }
    });
  }
}

async function getsociallinks(req, res) {
  const username = req.body.username;

  if (!username) {
    return res.send({ status: "FAILURE", message: "empty fields" });
  } else {
    try {
      const result = await mongodb.User_Social_Links.find({
        user_id: username,
      });

      if (result?.length < 1) {
        return res.send({
          status: "FAILURE",
          message: "Social links for user not found",
        });
      } else {
        return res.send({ status: "SUCCESS", data: result });
      }
    } catch (err) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error",
      });
    }
  }
}

async function uploadSociallinks(req, res) {
  const { links } = req.body;

  console.log(links);

  const username = req.decoded["username"];

  if (!username || !links[0]?.link) {
    return res.send({ status: "FAILURE", message: "empty fields" });
  }

  if (links?.length < 2 || links?.length > 3) {
    return res.send({
      status: "FAILURE",
      message: "Only up to 3 links allowed and 2 minimum, otherwise keep none.",
    });
  }

  const found = await mongodb.User_Social_Links.find({
    user_id: username,
  });

  if (found?.length > 0) {
    await mongodb.User_Social_Links.deleteMany({
      user_id: username,
    });
  }

  try {
    for (let j = 0; j < links?.length; j++) {
      if (!username || !links[j].link || !links[j].appname) {
        return res.send({
          status: "FAILURE",
          message: "Missing details in one of the links",
        });
      } else {
        const social_link = new mongodb.User_Social_Links({
          user_id: username,
          app_name: links[j].appname,
          social_link: links[j].link,
        });

        await social_link.save();
      }
    }
    return res.send({
      status: "SUCCESS",
      message: `Saved your links successfully`,
    });
  } catch (err) {
    return res.send({
      status: "FAILURE",
      message: "Unknown error",
    });
  }
}

async function deleteSocialLinks(req, res) {
  const username = req.decoded["username"];

  if (!username) {
    return res.send({ status: "FAILURE", message: "Missing details" });
  } else {
    try {
      await mongodb.User_Social_Links.deleteMany({ user_id: username });

      return res.send({
        status: "SUCCESS",
        message: "Deleted all links!",
      });
    } catch (err) {
      return res.send({
        status: "FAILURE",
        message: "Unknown error Try later",
      });
    }
  }
}

async function deleteAccount(req, res) {
  const username = req.decoded["username"];

  try {
    if (!username) {
      return res.send({ status: "FAILURE", message: "no username provided" });
    } else {
      getUserByUsername(username, (err, user) => {
        if (err) {
          return res.send({ status: "FAILURE", message: "Error getting user" });
        }
        if (user) {
          Model.connection.query(
            "DELETE FROM users WHERE username = ?",
            [username],
            async (err, results) => {
              if (err) {
                console.log(err);
                return res.send({
                  status: "FAILURE",
                  message: "Error deleting user",
                });
              }
              if (results) {
                await mongodb.RefreshToken.deleteMany({ userId: username });
                return res.send({
                  status: "SUCCESS",
                  message: "Deleted account successfully.",
                });
              }
            }
          );
        }
      });
    }
  } catch (err) {
    return res.send({
      status: "FAILURE",
      message: "Unknown error",
    });
  }
}

async function verifyOTP(req, res) {
  try {
    let { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.send({ status: "FAILED", message: "Empty details!" });
    } else {
      const UserEmailOTPVerificationRecord =
        await mongodb.UserEmailOTPVerification.find({
          userId,
        });
      if (UserEmailOTPVerificationRecord.length <= 0) {
        // no record found
        return res.send({ status: "FAILED", message: "Account doesnt exist" });
      } else {
        // user otp record exists
        const { expiresAt } = UserEmailOTPVerificationRecord[0];
        const hashedOTP = UserEmailOTPVerificationRecord[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          mongodb.UserEmailOTPVerification.deleteMany({ userId });
          return res.send({ status: "FAILED", message: "OTP Code Expired!" });
        } else {
          bcrypt.compare(otp, hashedOTP, (error, result) => {
            if (result && !error) {
              mongodb.UserEmailOTPVerification.deleteMany({ userId });
              update_verification_status(userId, (err, result) => {
                if (err) {
                  return res.send({ message: "Error Verifying user" });
                } else {
                  return res.send({
                    status: "SUCCESS",
                    message: "User email verified successfully.",
                  });
                }
              });
            } else {
              // supplied otp is wrong
              return res.send({ status: "FAILED", message: "Invalid Code" });
            }
          });
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: "Unknown error, try later.",
    });
  }
}

module.exports = {
  login,
  signup,
  verifyOTP,
  resend_OTP,
  refresh,
  update_push_token,
  upload_profile_pic,
  getuserData,
  deleteAccount,
  reset_Password,
  uploadSociallinks,
  change_password,
  edit_profile,
  getsociallinks,
  change_to_private_profile,
  deleteSocialLinks,
  delete_profile_pic,
};
