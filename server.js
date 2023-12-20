// libraries
require("dotenv").config();
const express = require("express");
const session = require('express-session');
const passport = require('passport');
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// controllers
const authController = require("./src/controllers/authController.js");
const userController = require("./src/controllers/userController.js");
const historyController = require("./src/controllers/historyController.js");
const blockController = require("./src/controllers/blockController.js");

// middlewares
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
)
app.use(passport.initialize());
app.use(passport.session());
app.use(cors({"origin": process.env.ORIGIN}));
app.use('/uploads', express.static(process.cwd() + '/uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// routes
app.use("/api/auth", authController);
app.use("/api/user", userController);
app.use("/api/history", historyController);
app.use("/api/block", blockController);

// oauth
require("./src/middlewares/passport");

// connecting to database
require("./src/utils/database.js");

// connecting to server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});