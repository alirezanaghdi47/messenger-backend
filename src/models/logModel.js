// libraries
const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
    type: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true
    },
}, {timestamps: true});

const Log = mongoose.model("Log", logSchema);

module.exports = Log;