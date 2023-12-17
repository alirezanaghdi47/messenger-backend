// libraries
const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: null,
    },
    userName: {
        type: String,
        maxLength: 40,
        required: true,
    },
    biography: {
        type: String,
        default: null,
        maxLength: 200,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
    invitationLink: {
        type: String,
        default: null,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
}, {timestamps: true});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;