require("./db/mongoose");

const usersRouters = require("./routers/users");
const tasksRouters = require("./routers/tasks");
const errorsRouters = require("./routers/errors");
const otherRouters = require("./routers/other");
const express = require("express");
const app = express();

// Express middleware

app.use((req, res, next) => {
  console.log(req.path);
  console.log(req.method);
  if (process.env.SITE_UNDER_MAINTENANCE == 'true') {
    return res.status(503).send("The site is under maintenance");
  }

  next();
});

app.use(
  //  * parse incoming json into object
  express.json(),
  // use the following custom routes defined in the '/routers' folder
  usersRouters,
  tasksRouters,
  otherRouters,
  errorsRouters
);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server is up on port " + port);
});

//! This is a test not relevant to the project functionality  😃
// dbg ref > populate > execPopulate
/* 
const Task = require("./models/task");
const examplePopulate = async () => {
    const task = await Task.findById("5e4f364d8e2ff11a1b6334c7");
    await task.populate("owner").execPopulate();
    console.log(task);
};
examplePopulate()
 */

// dbg virtual relationship
/* 
const User = require("./models/user");
const exampleVirtual = async () => {
    const user = await User.findById("5e4f25bbf6853a417c2197d5");

    await user.populate('tasks').execPopulate()
    console.log(user.tasks);
};
exampleVirtual();
 */