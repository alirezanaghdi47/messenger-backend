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
    size: {
        type: Number,
    },
    duration: {
        type: Number,
    },
    thumbnail: {
        type: String,
    },
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;