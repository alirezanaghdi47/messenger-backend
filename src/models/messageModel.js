// libraries
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
    type: {
        type: Number,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    size: {
        type: Number,
    },
    duration: {
        type: Number,
    },
    thumbnail: {
        type: String,
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

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;