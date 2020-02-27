const jwt = require("jsonwebtoken");
const User = require("../models/user");
const dateFormat = require("dateformat");

const auth = async (req, res, next) => {
  console.log("---AUTH FUNCTION-------------START ");
  const timeStamp = dateFormat(new Date(), "h:MM:ss");
  console.log(timeStamp);
  const debugData = {
    path: req.path,
    method: req.method,
    authorization: req.headers.authorization
  };
  console.log(debugData);

  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.jwtSecret);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });
    if (!user) {
      console.log("---AUTH FUNCTION-------------END-----REJECTED");
      throw new Error();
    }
    req.token = token;
    req.user = user;
    console.log("---AUTH FUNCTION-------------END-----AUTHENTICATED");
    next();
  } catch (error) {
    console.log("---AUTH FUNCTION-------------END-----ERROR");
    res.status(401).send({
      error: "please authenticate."
    });
  }
};

module.exports = auth;