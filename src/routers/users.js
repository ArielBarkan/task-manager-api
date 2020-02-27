const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/user");
const auth = require("../middleware/auth");
const { welcome, goodbye } = require("../emails/account");
const userRouters = new express.Router();

// CREATE
userRouters.post("/users/create", async (req, res) => {
  const data = req.body;
  const newUser = new User(data);
  const token = await newUser.generateAndSaveAuthToken();
  try {
    await newUser.save();
    welcome(newUser);
    res.status(201).send({
      newUser,
      token
    });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

// LOGIN USER
userRouters.post("/users/login", async (req, res) => {
  const data = req.body;
  try {
    const user = await User.findByCredentials(data.email, data.password);
    const token = await user.generateAndSaveAuthToken();
    res.status(200).send({
      user,
      token
    });
  } catch (error) {
    res.status(400).send("error");
  }
});

// GET ME (BY TOKEN)
userRouters.get("/user/me", auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

// LOGOUT CURRENT SESSION
userRouters.get("/user/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send("Logged out");
  } catch (error) {}
});

// LOGOUT ALL SESSION
userRouters.get("/user/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Logged out");
  } catch (error) {}
});
// GET ALL
userRouters.get("/users/read/all", async (req, res) => {
  try {
    const users = await User.find({});
    res.status(201).send(users);
  } catch (e) {
    res.status(500).send("Error: " + e.message);
  }
});

//  UPDATE BY ID
userRouters.patch("/users/me", auth, async (req, res) => {
  const user = req.user;
  const data = req.body;

  const receivedUpdates = Object.keys(data);
  const allowedUpdates = ["age", "name", "email", "password"];
  const isValidUpdate = receivedUpdates.every(update =>
    allowedUpdates.includes(update)
  );
  if (!isValidUpdate) {
    return res.status(400).send("Update no allowed");
  }

  try {
    //const updatedUser   = await User.findByIdAndUpdate(_id, data, {new:true, runValidators:true});
    // const updatedUser  = await User.findById(_id);

    receivedUpdates.forEach(item => {
      user[item] = data[item];
    });

    await user.save();
    res.status(200).send(user);
  } catch (e) {
    res.status(500).send("Error: " + e);
  }
});

// DELETE BY ID
userRouters.delete("/users/delete/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    goodbye(req.user);

    res.status(200).send("User deleted");
  } catch (e) {
    res.status(500).send(e);
  }
});

// Upload user profile image 📷
// ! USED ONLY IF WE WANT TO SAVE THE AVATAR IMAGE IN THE HARD DRIVE (INSTEAD OF DB)
/* 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "avatars/");
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + "_" + Date.now() + ".jpg"); //Appending .jpg
    // cb(null, req.user._id + '.jpg') //Appending .jpg
  }
});
 */
const upload = multer({
  /*  storage, */
  limits: {
    fileSize: 10000000000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error("Only images are allowed"));
    }
    cb(undefined, true);
  }
});

// UPLOAD AVATAR
userRouters.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    // req.user.avatar = req.file.buffer;
    const buffer = await sharp(req.file.buffer)
      .png()
      .resize({
        width: 250,
        height: 250
      })
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message
    });
  }
);

// DELETE AVATAR
userRouters.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).send();
});

// SERVING AVATAR
userRouters.get("/users/:id/avatar", async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);

    if (!user || !user.avatar) {
      throw new Error();
    }
    res
      .status(200)
      .set("Content-Type", "image/png")
      .send(user.avatar);
  } catch (error) {
    res.status(404).send("no image");
  }

  res.status(200).send(_id);
});

module.exports = userRouters;
