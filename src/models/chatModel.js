// libraries
const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    type: {
        type: Number,
        required: true
    },
    participantIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ],
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
    }
}, {timestamps: true});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;