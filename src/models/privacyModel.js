// libraries
const mongoose = require("mongoose");

const privacySchema = mongoose.Schema({
    password: {
        type: String,
        minLength: 8,
        default: null,
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
}, {timestamps: true});

const Privacy = mongoose.model("Privacy", privacySchema);

module.exports = Privacy;