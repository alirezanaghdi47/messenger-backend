// libraries
const mongoose = require("mongoose");

const userCallSchema = mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    callId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Call",
        required: true
    },
}, {timestamps: true});

const UserCall = mongoose.model("UserCall", userCallSchema);

module.exports = UserCall;