// libraries
const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    avatar: {
        type: String,
        default: null,
    },
    userName: {
        type: String,
        minLength: 8, 
        maxLength: 40,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    biography: {
        type: String,
        default: null,
        maxLength: 200,
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    language: {
        type: String,
        default: "fa",
    },
    darkMode: {
        type: Boolean,
        default: false,
    },
    fontSize: {
        type: Number,
        default: 14,
    },
    color: {
        light: {
            type: String,
            default: "#2563eb",
        },
        dark: {
            type: String,
            default: "#60a5fa",
        },
    },
    background: {
        type: String,
        default: "/images/desktop-1.jpg",
    }
}, {timestamps: true});

const User = mongoose.model("User", userSchema);

module.exports = User;