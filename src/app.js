const express = require("express");
require("./db/mongoose");

const usersRouters = require("./routers/users");
const tasksRouters = require("./routers/tasks");
const errorsRouters = require("./routers/errors");
const otherRouters = require("./routers/other");

const app = express();

app.use(
    //  * parse incoming json into object
    express.json(),
    // use the following custom routes defined in the '/routers' folder
    usersRouters,
    tasksRouters,
    otherRouters,
    errorsRouters
);

module.exports = app