// libraries
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: null,
    },
    userName: {
        type: String,
        maxLength: 40,
        required: true
    },
    biography: {
        type: String,
        default: null,
        maxLength: 200,
    },
    settingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Setting",
        required: true
    },
    privacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Privacy",
        required: true
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;