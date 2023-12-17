// libraries
const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;