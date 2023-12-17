// libraries
const mongoose = require("mongoose");

const settingSchema = mongoose.Schema({
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
        default: "/assets/images/desktop-1.jpg",
    }
}, {timestamps: true});

const Setting = mongoose.model("Setting", settingSchema);

module.exports = Setting;