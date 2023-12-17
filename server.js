// libraries
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// controllers


const app = express();

// middlewares
app.use(cors({
    "origin": process.env.ORIGIN,
}));
app.use('/uploads', express.static(process.cwd() + '/uploads'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// connecting to database
require("./src/utils/database.js")

// routes


// connecting to server
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});