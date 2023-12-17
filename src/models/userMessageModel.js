// libraries
const mongoose = require("mongoose");

const userMessageSchema = mongoose.Schema({
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
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        required: true
    },
}, {timestamps: true});

const UserMessage = mongoose.model("UserMessage", userMessageSchema);

module.exports = UserMessage;