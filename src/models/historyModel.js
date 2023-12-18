// libraries
const mongoose = require("mongoose");

const historySchema = mongoose.Schema({
    ip: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    browser: {
        type: String,
        required: true,
    },
    device: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }
}, {timestamps: true});

const History = mongoose.model("History", historySchema);

module.exports = History;