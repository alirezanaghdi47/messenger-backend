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
}, {timestamps: true});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;