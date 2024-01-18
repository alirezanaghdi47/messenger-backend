// libraries
const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: null,
    },
    name: {
        type: String,
        minLength: 8,
        maxLength: 40,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        default: null,
        maxLength: 200,
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {timestamps: true});

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;